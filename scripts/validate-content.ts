import { z } from 'zod';
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

interface ValidationError {
  file: string;
  type: string;
  errors: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  stats: {
    languages: number;
    courses: number;
    modules: number;
    lessons: number;
    quizzes: number;
    challenges: number;
    debugChallenges: number;
    puzzles: number;
    projects: number;
    missions: number;
    achievements: number;
    glossaryTerms: number;
    cheatSheets: number;
    interviewQuestions: number;
  };
}

const CONTENT_DIR = path.join(process.cwd(), 'content');
const errors: ValidationError[] = [];
const stats = {
  languages: 0,
  courses: 0,
  modules: 0,
  lessons: 0,
  quizzes: 0,
  challenges: 0,
  debugChallenges: 0,
  puzzles: 0,
  projects: 0,
  missions: 0,
  achievements: 0,
  glossaryTerms: 0,
  cheatSheets: 0,
  interviewQuestions: 0,
};

function validateFile<T>(
  filePath: string,
  schema: z.ZodSchema<T>,
  type: string
): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const result = schema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      errors.push({
        file: filePath,
        type,
        errors: errorMessages,
      });
      return null;
    }

    return result.data;
  } catch (error) {
    errors.push({
      file: filePath,
      type,
      errors: [`Failed to parse JSON: ${error}`],
    });
    return null;
  }
}

function validateDirectory<T>(
  dirPath: string,
  schema: z.ZodSchema<T>,
  type: string,
  statKey: keyof typeof stats
): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = validateFile(filePath, schema, type);
    if (result) {
      stats[statKey]++;
    }
  }
}

function validateLanguages(): void {
  const languagesDir = path.join(CONTENT_DIR, 'languages');
  if (!fs.existsSync(languagesDir)) {
    return;
  }

  const languageDirs = fs.readdirSync(languagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const langDir of languageDirs) {
    const languagePath = path.join(languagesDir, langDir, 'language.json');
    if (fs.existsSync(languagePath)) {
      const result = validateFile(languagePath, LanguageSchema, 'language');
      if (result) {
        stats.languages++;
      }
    }

    // Validate courses
    const coursesDir = path.join(languagesDir, langDir, 'courses');
    if (fs.existsSync(coursesDir)) {
      const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const courseDir of courseDirs) {
        const coursePath = path.join(coursesDir, courseDir, 'course.json');
        if (fs.existsSync(coursePath)) {
          const result = validateFile(coursePath, CourseSchema, 'course');
          if (result) {
            stats.courses++;
          }
        }

        // Validate modules
        const modulesDir = path.join(coursesDir, courseDir, 'modules');
        if (fs.existsSync(modulesDir)) {
          const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

          for (const moduleDir of moduleDirs) {
            const modulePath = path.join(modulesDir, moduleDir, 'module.json');
            if (fs.existsSync(modulePath)) {
              const result = validateFile(modulePath, ModuleSchema, 'module');
              if (result) {
                stats.modules++;
              }
            }

            // Validate lessons
            const lessonsDir = path.join(modulesDir, moduleDir, 'lessons');
            if (fs.existsSync(lessonsDir)) {
              const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));
              for (const lessonFile of lessonFiles) {
                const lessonPath = path.join(lessonsDir, lessonFile);
                const result = validateFile(lessonPath, LessonSchema, 'lesson');
                if (result) {
                  stats.lessons++;
                }
              }
            }

            // Validate quizzes
            const quizzesDir = path.join(modulesDir, moduleDir, 'quizzes');
            if (fs.existsSync(quizzesDir)) {
              const quizFiles = fs.readdirSync(quizzesDir).filter((f) => f.endsWith('.json'));
              for (const quizFile of quizFiles) {
                const quizPath = path.join(quizzesDir, quizFile);
                const result = validateFile(quizPath, QuizSchema, 'quiz');
                if (result) {
                  stats.quizzes++;
                }
              }
            }

            // Validate challenges
            const challengesDir = path.join(modulesDir, moduleDir, 'challenges');
            if (fs.existsSync(challengesDir)) {
              const challengeFiles = fs.readdirSync(challengesDir).filter((f) => f.endsWith('.json'));
              for (const challengeFile of challengeFiles) {
                const challengePath = path.join(challengesDir, challengeFile);
                const result = validateFile(challengePath, ChallengeSchema, 'challenge');
                if (result) {
                  stats.challenges++;
                }
              }
            }

            // Validate debug challenges
            const debugDir = path.join(modulesDir, moduleDir, 'debug');
            if (fs.existsSync(debugDir)) {
              const debugFiles = fs.readdirSync(debugDir).filter((f) => f.endsWith('.json'));
              for (const debugFile of debugFiles) {
                const debugPath = path.join(debugDir, debugFile);
                const result = validateFile(debugPath, DebugChallengeSchema, 'debug');
                if (result) {
                  stats.debugChallenges++;
                }
              }
            }

            // Validate puzzles
            const puzzlesDir = path.join(modulesDir, moduleDir, 'puzzles');
            if (fs.existsSync(puzzlesDir)) {
              const puzzleFiles = fs.readdirSync(puzzlesDir).filter((f) => f.endsWith('.json'));
              for (const puzzleFile of puzzleFiles) {
                const puzzlePath = path.join(puzzlesDir, puzzleFile);
                const result = validateFile(puzzlePath, PuzzleSchema, 'puzzle');
                if (result) {
                  stats.puzzles++;
                }
              }
            }
          }
        }
      }
    }
  }
}

function validateProjects(): void {
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  if (!fs.existsSync(projectsDir)) {
    return;
  }

  const langDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const langDir of langDirs) {
    const langPath = path.join(projectsDir, langDir);
    const projectFiles = fs.readdirSync(langPath).filter((f) => f.endsWith('.json'));

    for (const projectFile of projectFiles) {
      const projectPath = path.join(langPath, projectFile);
      const result = validateFile(projectPath, ProjectSchema, 'project');
      if (result) {
        stats.projects++;
      }
    }
  }
}

function validateMissions(): void {
  const missionsPath = path.join(CONTENT_DIR, 'missions', 'daily-pool.json');
  if (fs.existsSync(missionsPath)) {
    try {
      const content = fs.readFileSync(missionsPath, 'utf-8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        for (const mission of data) {
          const result = MissionSchema.safeParse(mission);
          if (result.success) {
            stats.missions++;
          } else {
            errors.push({
              file: missionsPath,
              type: 'mission',
              errors: result.error.issues.map(
                (issue) => `${issue.path.join('.')}: ${issue.message}`
              ),
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        file: missionsPath,
        type: 'mission',
        errors: [`Failed to parse JSON: ${error}`],
      });
    }
  }
}

function validateAchievements(): void {
  const achievementsPath = path.join(CONTENT_DIR, 'achievements', 'achievements.json');
  if (fs.existsSync(achievementsPath)) {
    try {
      const content = fs.readFileSync(achievementsPath, 'utf-8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        for (const achievement of data) {
          const result = AchievementSchema.safeParse(achievement);
          if (result.success) {
            stats.achievements++;
          } else {
            errors.push({
              file: achievementsPath,
              type: 'achievement',
              errors: result.error.issues.map(
                (issue) => `${issue.path.join('.')}: ${issue.message}`
              ),
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        file: achievementsPath,
        type: 'achievement',
        errors: [`Failed to parse JSON: ${error}`],
      });
    }
  }
}

function validateGlossary(): void {
  const glossaryDir = path.join(CONTENT_DIR, 'glossary');
  if (!fs.existsSync(glossaryDir)) {
    return;
  }

  const files = fs.readdirSync(glossaryDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(glossaryDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        for (const term of data) {
          const result = GlossaryTermSchema.safeParse(term);
          if (result.success) {
            stats.glossaryTerms++;
          } else {
            errors.push({
              file: filePath,
              type: 'glossary',
              errors: result.error.issues.map(
                (issue) => `${issue.path.join('.')}: ${issue.message}`
              ),
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        file: filePath,
        type: 'glossary',
        errors: [`Failed to parse JSON: ${error}`],
      });
    }
  }
}

function validateCheatSheets(): void {
  const cheatsheetsDir = path.join(CONTENT_DIR, 'cheatsheets');
  if (!fs.existsSync(cheatsheetsDir)) {
    return;
  }

  const files = fs.readdirSync(cheatsheetsDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(cheatsheetsDir, file);
    const result = validateFile(filePath, CheatSheetSchema, 'cheatsheet');
    if (result) {
      stats.cheatSheets++;
    }
  }
}

function validateInterviewQuestions(): void {
  const interviewDir = path.join(CONTENT_DIR, 'interview-questions');
  if (!fs.existsSync(interviewDir)) {
    return;
  }

  const files = fs.readdirSync(interviewDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(interviewDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        for (const question of data) {
          const result = InterviewQuestionSchema.safeParse(question);
          if (result.success) {
            stats.interviewQuestions++;
          } else {
            errors.push({
              file: filePath,
              type: 'interview',
              errors: result.error.issues.map(
                (issue) => `${issue.path.join('.')}: ${issue.message}`
              ),
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        file: filePath,
        type: 'interview',
        errors: [`Failed to parse JSON: ${error}`],
      });
    }
  }
}

function main(): void {
  console.log('🔍 Validating content files...\n');

  validateLanguages();
  validateProjects();
  validateMissions();
  validateAchievements();
  validateGlossary();
  validateCheatSheets();
  validateInterviewQuestions();

  const result: ValidationResult = {
    valid: errors.length === 0,
    errors,
    stats,
  };

  if (errors.length > 0) {
    console.error('❌ Validation failed!\n');
    console.error(`Found ${errors.length} error(s):\n`);

    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.file}`);
      console.error(`   Type: ${error.type}`);
      error.errors.forEach((err) => {
        console.error(`   - ${err}`);
      });
      console.error('');
    });

    process.exit(1);
  }

  console.log('✅ All content files are valid!\n');
  console.log('📊 Content Statistics:\n');
  console.log(`Languages: ${stats.languages}`);
  console.log(`Courses: ${stats.courses}`);
  console.log(`Modules: ${stats.modules}`);
  console.log(`Lessons: ${stats.lessons}`);
  console.log(`Quizzes: ${stats.quizzes}`);
  console.log(`Challenges: ${stats.challenges}`);
  console.log(`Debug Challenges: ${stats.debugChallenges}`);
  console.log(`Puzzles: ${stats.puzzles}`);
  console.log(`Projects: ${stats.projects}`);
  console.log(`Missions: ${stats.missions}`);
  console.log(`Achievements: ${stats.achievements}`);
  console.log(`Glossary Terms: ${stats.glossaryTerms}`);
  console.log(`Cheat Sheets: ${stats.cheatSheets}`);
  console.log(`Interview Questions: ${stats.interviewQuestions}`);
}

main();
