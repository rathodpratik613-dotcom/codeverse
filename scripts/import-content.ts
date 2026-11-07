/**
 * Bulk content importer for CODEVERSE.
 *
 * Scans the content/ directory, validates every JSON file against the Zod
 * schemas in src/schemas/content.ts, deduplicates against the LowDB
 * `contentItems` collection, and inserts in chunks so large datasets don't
 * crash or time out.
 *
 * Usage:
 *   npm run content:import              # import new/updated items
 *   npm run content:import -- --dry-run # validate + report only, no writes
 *   npm run content:import -- --reset   # wipe contentItems, then re-import
 *
 * To import against the live Render database, run inside the service
 * (e.g. `render ssh` into the web service) or point DATA_DIR at the mounted
 * disk:
 *   DATA_DIR=/var/data npm run content:import
 *
 * The error report is written to data/import-report-<timestamp>.json
 * (data/ is gitignored — reports are never committed).
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  LanguageSchema,
  CourseSchema,
  ModuleSchema,
  LessonSchema,
  QuizSchema,
  ChallengeSchema,
  DebugChallengeSchema,
  PuzzleSchema,
  ProjectSchema,
  MissionSchema,
  AchievementSchema,
  GlossaryTermSchema,
  CheatSheetSchema,
  InterviewQuestionSchema,
} from '../src/schemas/content';
import type { z } from 'zod';
import { getDb, saveDb } from '../src/lib/db';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const CHUNK_SIZE = 100;
const REPORT_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

interface ImportItem {
  type: string;
  language?: string;
  filePath: string;
  data: unknown;
}

interface ImportError {
  file: string;
  type: string;
  errors: string[];
}

const TYPE_BY_DIR: Record<string, { type: string; schema: z.ZodSchema; array?: boolean }> = {
  lessons: { type: 'lesson', schema: LessonSchema },
  quizzes: { type: 'quiz', schema: QuizSchema },
  challenges: { type: 'challenge', schema: ChallengeSchema },
  debug: { type: 'debug', schema: DebugChallengeSchema },
  puzzles: { type: 'puzzle', schema: PuzzleSchema },
  projects: { type: 'project', schema: ProjectSchema },
  missions: { type: 'mission', schema: MissionSchema, array: true },
  achievements: { type: 'achievement', schema: AchievementSchema, array: true },
  glossary: { type: 'glossaryTerm', schema: GlossaryTermSchema, array: true },
  cheatsheets: { type: 'cheatSheet', schema: CheatSheetSchema },
  'interview-questions': { type: 'interviewQuestion', schema: InterviewQuestionSchema, array: true },
};

const errors: ImportError[] = [];
const items: ImportItem[] = [];

function recordError(filePath: string, type: string, err: unknown) {
  const messages =
    err && typeof err === 'object' && 'issues' in err
      ? (err as z.ZodError).issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      : [`${err}`];
  errors.push({ file: filePath, type, errors: messages });
}

function validateJson(filePath: string, type: string, schema: z.ZodSchema, language?: string, array = false): void {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const entries = array ? (Array.isArray(raw) ? raw : [raw]) : [raw];
    if (array && !Array.isArray(raw)) {
      recordError(filePath, type, new Error('Expected a JSON array'));
      return;
    }
    for (const entry of entries) {
      const result = schema.safeParse(entry);
      if (result.success) {
        items.push({ type, language, filePath, data: result.data });
      } else {
        recordError(filePath, type, result.error);
      }
    }
  } catch (err) {
    recordError(filePath, type, err);
  }
}

function importLanguages(): void {
  const languagesDir = path.join(CONTENT_DIR, 'languages');
  if (!fs.existsSync(languagesDir)) return;

  for (const lang of fs.readdirSync(languagesDir, { withFileTypes: true })) {
    if (!lang.isDirectory()) continue;
    const langDir = path.join(languagesDir, lang.name);

    const langFile = path.join(langDir, 'language.json');
    if (fs.existsSync(langFile)) {
      validateJson(langFile, 'language', LanguageSchema, lang.name);
    }

    const coursesDir = path.join(langDir, 'courses');
    if (!fs.existsSync(coursesDir)) continue;

    for (const course of fs.readdirSync(coursesDir, { withFileTypes: true })) {
      if (!course.isDirectory()) continue;
      const courseDir = path.join(coursesDir, course.name);

      const courseFile = path.join(courseDir, 'course.json');
      if (fs.existsSync(courseFile)) {
        validateJson(courseFile, 'course', CourseSchema, lang.name);
      }

      const modulesDir = path.join(courseDir, 'modules');
      if (!fs.existsSync(modulesDir)) continue;

      for (const mod of fs.readdirSync(modulesDir, { withFileTypes: true })) {
        if (!mod.isDirectory()) continue;
        const modDir = path.join(modulesDir, mod.name);

        const moduleFile = path.join(modDir, 'module.json');
        if (fs.existsSync(moduleFile)) {
          validateJson(moduleFile, 'module', ModuleSchema, lang.name);
        }

        for (const [dirName, cfg] of Object.entries(TYPE_BY_DIR)) {
          if (dirName === 'projects' || dirName === 'missions' || dirName === 'achievements' ||
              dirName === 'glossary' || dirName === 'cheatsheets' || dirName === 'interview-questions') continue;
          const subDir = path.join(modDir, dirName);
          if (!fs.existsSync(subDir)) continue;
          for (const file of fs.readdirSync(subDir)) {
            if (file.endsWith('.json')) {
              validateJson(path.join(subDir, file), cfg.type, cfg.schema, lang.name);
            }
          }
        }
      }
    }
  }
}

function importFlatCollections(): void {
  for (const [dirName, cfg] of Object.entries(TYPE_BY_DIR)) {
    if (dirName === 'lessons' || dirName === 'quizzes' || dirName === 'challenges' ||
        dirName === 'debug' || dirName === 'puzzles') continue;
    const dirPath = path.join(CONTENT_DIR, dirName);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.json'));

    for (const file of files) {
      validateJson(path.join(dirPath, file.name), cfg.type, cfg.schema, undefined, cfg.array);
    }

    // One level of nesting (e.g. projects/<language>/*.json)
    for (const sub of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const subDir = path.join(dirPath, sub.name);
      for (const file of fs.readdirSync(subDir)) {
        if (file.endsWith('.json')) {
          validateJson(path.join(subDir, file), cfg.type, cfg.schema, sub.name, cfg.array);
        }
      }
    }
  }
}

function itemKey(type: string, data: { id: string }): string {
  return `${type}:${data.id}`;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const reset = process.argv.includes('--reset');

  console.log('Scanning content directory...');
  importLanguages();
  importFlatCollections();

  console.log(`Found ${items.length} valid item(s), ${errors.length} error(s).`);

  if (errors.length > 0) {
    console.log('\nValidation errors:');
    errors.slice(0, 20).forEach((e) => {
      console.log(`  ${e.file} [${e.type}]`);
      e.errors.slice(0, 3).forEach((m) => console.log(`    - ${m}`));
    });
    if (errors.length > 20) console.log(`  ... and ${errors.length - 20} more`);
  }

  if (dryRun) {
    console.log('\nDry run — no changes written.');
    writeReport(0, 0, 0);
    return;
  }

  const db = await getDb();

  if (reset) {
    console.log('Resetting contentItems collection...');
    db.data.contentItems = [];
    await saveDb();
  }

  const existing = new Set(
    db.data.contentItems.map((c: { type: string; data: { id: string } }) => itemKey(c.type, c.data))
  );

  // Dedupe within the batch itself (last write wins is avoided; first wins)
  const seen = new Set<string>();
  const toInsert: ImportItem[] = [];
  let duplicates = 0;

  for (const item of items) {
    const key = itemKey(item.type, item.data as { id: string });
    if (existing.has(key) || seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    toInsert.push(item);
  }

  console.log(`${toInsert.length} new item(s) to insert, ${duplicates} duplicate(s) skipped.`);

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + CHUNK_SIZE);
    for (const item of chunk) {
      db.data.contentItems.push({
        ...item,
        importedAt: new Date().toISOString(),
      });
    }
    await saveDb();
    inserted += chunk.length;
    console.log(`  Inserted ${inserted}/${toInsert.length}`);
  }

  writeReport(inserted, duplicates, errors.length);
  console.log('\nDone.');
}

function writeReport(inserted: number, duplicates: number, errorCount: number): void {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `import-report-${Date.now()}.json`);
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ inserted, duplicates, errorCount, errors }, null, 2)
  );
  console.log(`Report written to ${reportPath}`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
