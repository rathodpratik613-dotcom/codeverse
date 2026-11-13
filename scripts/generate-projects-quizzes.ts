// Generates project.json files and module-final quizzes for all languages
// Run: npx tsx scripts/generate-projects-quizzes.ts
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'content');

const LANGS = fs.readdirSync(path.join(ROOT, 'languages')).filter((d) =>
  fs.existsSync(path.join(ROOT, 'languages', d, 'courses'))
);

interface Project {
  id: string;
  language: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
  milestones: { title: string; description: string }[];
  starterCode: string;
  solutionCode: string;
  xpReward: number;
  coinReward: number;
}

interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  questions: any[];
  passingScore: number;
  xpReward: number;
}

function loadJsons(dir: string): any[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

for (const lang of LANGS) {
  console.log(`Processing ${lang}...`);
  
  // Find the course directory
  const coursesDir = path.join(ROOT, 'languages', lang, 'courses');
  const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  
  if (courseDirs.length === 0) continue;
  
  const courseDir = courseDirs[0]; // Use first course
  const modulesDir = path.join(coursesDir, courseDir, 'modules');
  
  if (!fs.existsSync(modulesDir)) continue;
  
  const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  
  // Generate project.json
  const lastModule = moduleDirs[moduleDirs.length - 1];
  const projectPath = path.join(coursesDir, courseDir, 'project.json');
  
  const project: Project = {
    id: `${lang}-capstone-project`,
    language: lang,
    title: `Complete ${lang} Capstone Project`,
    description: `Apply everything you've learned in ${lang} to build a complete application.`,
    difficulty: 'hard',
    estimatedHours: 8,
    milestones: [
      { title: 'Setup', description: 'Set up project structure and dependencies' },
      { title: 'Core Features', description: 'Implement main functionality' },
      { title: 'Testing', description: 'Write tests and verify functionality' },
      { title: 'Polish', description: 'Add error handling and documentation' },
    ],
    starterCode: `// ${lang} Capstone Project\n// TODO: Implement your solution here`,
    solutionCode: `// ${lang} Capstone Project Solution\n// Complete implementation`,
    xpReward: 500,
    coinReward: 200,
  };
  
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  console.log(`  Created project.json`);
  
  // Generate module-final quizzes
  for (const moduleDir of moduleDirs) {
    const modulePath = path.join(modulesDir, moduleDir);
    const quizzesDir = path.join(modulePath, 'quizzes');
    
    if (!fs.existsSync(quizzesDir)) continue;
    
    // Collect all quiz questions from this module
    const quizFiles = fs.readdirSync(quizzesDir).filter((f) => f.endsWith('.json'));
    const allQuestions: any[] = [];
    
    for (const quizFile of quizFiles) {
      const quizPath = path.join(quizzesDir, quizFile);
      const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
      for (const q of quiz.questions || []) {
        if (q.type === 'mcq' && q.options && q.correctAnswer) {
          allQuestions.push(q);
        }
      }
    }
    
    if (allQuestions.length === 0) continue;
    
    // Create module-final quiz with all questions
    const moduleQuiz: ModuleQuiz = {
      id: `${lang}-${moduleDir}-final-quiz`,
      moduleId: moduleDir,
      title: `Module Final Quiz - ${moduleDir}`,
      questions: allQuestions.slice(0, 10), // Limit to 10 questions
      passingScore: 70,
      xpReward: 100,
    };
    
    const finalQuizPath = path.join(quizzesDir, 'final-quiz.json');
    fs.writeFileSync(finalQuizPath, JSON.stringify(moduleQuiz, null, 2));
    console.log(`  Created final quiz for ${moduleDir}`);
  }
}

console.log('Done!');
