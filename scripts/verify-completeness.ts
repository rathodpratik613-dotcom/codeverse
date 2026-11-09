// Completeness verifier: scans content/languages for spec violations.
// Run: npm run content:verify  (add script) or npx tsx scripts/verify-completeness.ts
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'content', 'languages');
const PLACEHOLDERS = [/lorem ipsum/i, /coming soon/i, /\bTODO\b/, /sample lesson/i, /placeholder text/i];

interface Issue { lang: string; where: string; problem: string }
const issues: Issue[] = [];
const rows: any[] = [];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function readJson(p: string): any {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const REQUIRED_LANGS = ['python','javascript','java','cpp','c','csharp','typescript','sql','html','css','go','rust','php','ruby','swift','kotlin','r','dart','bash'];

for (const lang of REQUIRED_LANGS) {
  const langDir = path.join(ROOT, lang);
  if (!fs.existsSync(langDir)) { issues.push({ lang, where: '-', problem: 'language directory missing' }); continue; }

  const modulesRoot = path.join(langDir, 'courses', 'complete-course', 'modules');
  const moduleDirs = fs.existsSync(modulesRoot)
    ? fs.readdirSync(modulesRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
    : [];
  const courseDir = path.join(langDir, 'courses', 'complete-course');

  let lessons = 0, quizzes = 0, challenges = 0, quizQuestions = 0, exercises = 0;
  const titles = new Map<string, number>();

  for (const mod of moduleDirs) {
    const modDir = path.join(modulesRoot, mod);
    const files = walk(modDir);
    const lessonFiles = files.filter((f) => f.includes(`${path.sep}lessons${path.sep}`));
    const quizFiles = files.filter((f) => f.includes(`${path.sep}quizzes${path.sep}`));
    const challengeFiles = files.filter((f) => f.includes(`${path.sep}challenges${path.sep}`));

    lessons += lessonFiles.length;
    quizzes += quizFiles.length;
    challenges += challengeFiles.length;
    exercises += challengeFiles.length;

    if (lessonFiles.length < 6) issues.push({ lang, where: mod, problem: `only ${lessonFiles.length} lessons (min 6)` });
    if (challengeFiles.length < 3) issues.push({ lang, where: mod, problem: `only ${challengeFiles.length} exercises (min 3)` });

    for (const lf of lessonFiles) {
      const data = readJson(lf);
      if (!data) { issues.push({ lang, where: lf, problem: 'invalid JSON' }); continue; }
      const rel = path.relative(langDir, lf);
      for (const field of ['id', 'title']) {
        if (!data[field]) issues.push({ lang, where: rel, problem: `missing ${field}` });
      }
      const text = JSON.stringify(data);
      for (const re of PLACEHOLDERS) {
        if (re.test(text)) { issues.push({ lang, where: rel, problem: `placeholder text (${re})` }); break; }
      }
      const title = String(data.title || '').toLowerCase();
      titles.set(title, (titles.get(title) || 0) + 1);
      const sections = data.sections || [];
      if (!Array.isArray(sections) || sections.length === 0) issues.push({ lang, where: rel, problem: 'no sections' });
      const codeSections = sections.filter((s: any) => s.type === 'code' && s.codeExample);
      if (codeSections.length < 2) issues.push({ lang, where: rel, problem: `only ${codeSections.length} code examples (min 2)` });
      if (!data.keyTakeaways || !data.keyTakeaways.length) issues.push({ lang, where: rel, problem: 'no keyTakeaways' });
      if (!data.summary) issues.push({ lang, where: rel, problem: 'no summary' });
    }
    for (const qf of quizFiles) {
      const data = readJson(qf);
      quizQuestions += (data?.questions || []).length;
      if (!data?.questions || data.questions.length < 5) {
        issues.push({ lang, where: path.relative(langDir, qf), problem: `quiz has ${data?.questions?.length || 0} questions (min 5)` });
      }
    }
  }

  for (const [t, n] of titles) {
    if (n > 1) issues.push({ lang, where: '-', problem: `duplicate lesson title "${t}" x${n}` });
  }
  if (moduleDirs.length < 6) issues.push({ lang, where: '-', problem: `only ${moduleDirs.length} modules (min 6)` });
  if (moduleDirs.length > 20) issues.push({ lang, where: '-', problem: `${moduleDirs.length} modules (max 20)` });

  rows.push({ lang, modules: moduleDirs.length, lessons, quizFiles: quizzes, quizQuestions, exercises: challenges });
}

console.log('\n=== COMPLETENESS REPORT ===');
console.log('lang'.padEnd(14), 'modules', 'lessons', 'quizFiles', 'quizQ', 'exercises');
for (const r of rows) {
  console.log(r.lang.padEnd(14), String(r.modules).padEnd(8), String(r.lessons).padEnd(8), String(r.quizFiles).padEnd(10), String(r.quizQuestions).padEnd(7), r.exercises);
}
console.log(`\nTotal issues: ${issues.length}`);
const byLang = new Map<string, number>();
for (const i of issues) byLang.set(i.lang, (byLang.get(i.lang) || 0) + 1);
for (const [l, n] of [...byLang.entries()].sort()) console.log(`  ${l}: ${n} issues`);
if (issues.length <= 30) for (const i of issues) console.log(`  [${i.lang}] ${i.where}: ${i.problem}`);
else for (const i of issues.slice(0, 30)) console.log(`  [${i.lang}] ${i.where}: ${i.problem}`);
process.exit(issues.length ? 1 : 0);
