import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

interface ContentStats {
  [key: string]: {
    lessons: number;
    quizzes: number;
    challenges: number;
    debugChallenges: number;
    puzzles: number;
    projects: number;
    glossaryTerms: number;
    cheatSheets: number;
    interviewQuestions: number;
  };
}

const stats: ContentStats = {};

function countFiles(dir: string, extension: string = '.json'): number {
  if (!fs.existsSync(dir)) return 0;
  
  return fs.readdirSync(dir).filter((f) => f.endsWith(extension)).length;
}

function countRecursive(dir: string, subdir: string): number {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory()) {
      const subPath = path.join(dir, item.name, subdir);
      count += countFiles(subPath);
    }
  }
  
  return count;
}

function main(): void {
  console.log('📊 Content Statistics\n');
  console.log('═'.repeat(80));

  // Languages
  const languagesDir = path.join(CONTENT_DIR, 'languages');
  if (fs.existsSync(languagesDir)) {
    const langDirs = fs.readdirSync(languagesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const lang of langDirs) {
      const langPath = path.join(languagesDir, lang);
      stats[lang] = {
        lessons: 0,
        quizzes: 0,
        challenges: 0,
        debugChallenges: 0,
        puzzles: 0,
        projects: 0,
        glossaryTerms: 0,
        cheatSheets: 0,
        interviewQuestions: 0,
      };

      // Count lessons, quizzes, challenges, etc.
      const coursesDir = path.join(langPath, 'courses');
      if (fs.existsSync(coursesDir)) {
        const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name);

        for (const courseDir of courseDirs) {
          const modulesDir = path.join(coursesDir, courseDir, 'modules');
          if (fs.existsSync(modulesDir)) {
            const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) => dirent.name);

            for (const moduleDir of moduleDirs) {
              const modulePath = path.join(modulesDir, moduleDir);
              
              stats[lang].lessons += countFiles(path.join(modulePath, 'lessons'));
              stats[lang].quizzes += countFiles(path.join(modulePath, 'quizzes'));
              stats[lang].challenges += countFiles(path.join(modulePath, 'challenges'));
              stats[lang].debugChallenges += countFiles(path.join(modulePath, 'debug'));
              stats[lang].puzzles += countFiles(path.join(modulePath, 'puzzles'));
            }
          }
        }
      }

      // Count projects
      const projectsDir = path.join(CONTENT_DIR, 'projects', lang);
      stats[lang].projects = countFiles(projectsDir);

      // Count glossary terms
      const glossaryPath = path.join(CONTENT_DIR, 'glossary', `${lang}.json`);
      if (fs.existsSync(glossaryPath)) {
        try {
          const content = fs.readFileSync(glossaryPath, 'utf-8');
          const terms = JSON.parse(content);
          stats[lang].glossaryTerms = Array.isArray(terms) ? terms.length : 0;
        } catch {
          stats[lang].glossaryTerms = 0;
        }
      }

      // Count cheat sheets
      const cheatsheetsDir = path.join(CONTENT_DIR, 'cheatsheets');
      if (fs.existsSync(cheatsheetsDir)) {
        const files = fs.readdirSync(cheatsheetsDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(cheatsheetsDir, file), 'utf-8');
            const cheatSheet = JSON.parse(content);
            if (cheatSheet.language === lang) {
              stats[lang].cheatSheets++;
            }
          } catch {
            // Skip invalid files
          }
        }
      }

      // Count interview questions
      const interviewDir = path.join(CONTENT_DIR, 'interview-questions');
      if (fs.existsSync(interviewDir)) {
        const files = fs.readdirSync(interviewDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(interviewDir, file), 'utf-8');
            const questions = JSON.parse(content);
            if (Array.isArray(questions)) {
              for (const q of questions) {
                if (q.language === lang) {
                  stats[lang].interviewQuestions++;
                }
              }
            }
          } catch {
            // Skip invalid files
          }
        }
      }
    }
  }

  // Print stats
  console.log('Language'.padEnd(15) + 'Lessons'.padEnd(10) + 'Quizzes'.padEnd(10) + 'Challenges'.padEnd(12) + 'Debug'.padEnd(10) + 'Puzzles'.padEnd(10) + 'Projects'.padEnd(10) + 'Glossary'.padEnd(10) + 'Cheats'.padEnd(10) + 'Interview');
  console.log('═'.repeat(120));

  let totals = {
    lessons: 0,
    quizzes: 0,
    challenges: 0,
    debugChallenges: 0,
    puzzles: 0,
    projects: 0,
    glossaryTerms: 0,
    cheatSheets: 0,
    interviewQuestions: 0,
  };

  for (const [lang, langStats] of Object.entries(stats)) {
    console.log(
      lang.padEnd(15) +
      langStats.lessons.toString().padEnd(10) +
      langStats.quizzes.toString().padEnd(10) +
      langStats.challenges.toString().padEnd(12) +
      langStats.debugChallenges.toString().padEnd(10) +
      langStats.puzzles.toString().padEnd(10) +
      langStats.projects.toString().padEnd(10) +
      langStats.glossaryTerms.toString().padEnd(10) +
      langStats.cheatSheets.toString().padEnd(10) +
      langStats.interviewQuestions.toString()
    );

    totals.lessons += langStats.lessons;
    totals.quizzes += langStats.quizzes;
    totals.challenges += langStats.challenges;
    totals.debugChallenges += langStats.debugChallenges;
    totals.puzzles += langStats.puzzles;
    totals.projects += langStats.projects;
    totals.glossaryTerms += langStats.glossaryTerms;
    totals.cheatSheets += langStats.cheatSheets;
    totals.interviewQuestions += langStats.interviewQuestions;
  }

  console.log('═'.repeat(120));
  console.log(
    'TOTAL'.padEnd(15) +
    totals.lessons.toString().padEnd(10) +
    totals.quizzes.toString().padEnd(10) +
    totals.challenges.toString().padEnd(12) +
    totals.debugChallenges.toString().padEnd(10) +
    totals.puzzles.toString().padEnd(10) +
    totals.projects.toString().padEnd(10) +
    totals.glossaryTerms.toString().padEnd(10) +
    totals.cheatSheets.toString().padEnd(10) +
    totals.interviewQuestions.toString()
  );

  console.log('\n📈 Summary:');
  console.log(`Total Languages: ${Object.keys(stats).length}`);
  console.log(`Total Lessons: ${totals.lessons}`);
  console.log(`Total Quizzes: ${totals.quizzes}`);
  console.log(`Total Challenges: ${totals.challenges}`);
  console.log(`Total Debug Challenges: ${totals.debugChallenges}`);
  console.log(`Total Puzzles: ${totals.puzzles}`);
  console.log(`Total Projects: ${totals.projects}`);
  console.log(`Total Glossary Terms: ${totals.glossaryTerms}`);
  console.log(`Total Cheat Sheets: ${totals.cheatSheets}`);
  console.log(`Total Interview Questions: ${totals.interviewQuestions}`);
}

main();
