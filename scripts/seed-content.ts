import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { z } from 'zod';
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

const CONTENT_DIR = path.join(process.cwd(), 'content');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/codeverse';

const pool = new Pool({ connectionString: DATABASE_URL });

interface SeedStats {
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
}

const stats: SeedStats = {
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

async function seedLanguage(client: any, languageData: any): Promise<void> {
  const validated = LanguageSchema.parse(languageData);
  
  await client.query(
    `INSERT INTO languages (id, name, icon, color, description, difficulty, runtime_type, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       icon = EXCLUDED.icon,
       color = EXCLUDED.color,
       description = EXCLUDED.description,
       difficulty = EXCLUDED.difficulty,
       runtime_type = EXCLUDED.runtime_type,
       tags = EXCLUDED.tags`,
    [
      validated.id,
      validated.name,
      validated.icon,
      validated.color,
      validated.description,
      validated.difficulty,
      validated.runtimeType,
      JSON.stringify(validated.tags),
    ]
  );
  stats.languages++;
}

async function seedCourse(client: any, courseData: any): Promise<void> {
  const validated = CourseSchema.parse(courseData);
  
  await client.query(
    `INSERT INTO courses (id, language_id, title, level, estimated_hours, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       level = EXCLUDED.level,
       estimated_hours = EXCLUDED.estimated_hours,
       description = EXCLUDED.description`,
    [
      validated.id,
      courseData.languageId,
      validated.title,
      validated.level,
      validated.estimatedHours,
      validated.description,
    ]
  );
  stats.courses++;
}

async function seedModule(client: any, moduleData: any): Promise<void> {
  const validated = ModuleSchema.parse(moduleData);
  
  await client.query(
    `INSERT INTO modules (id, course_id, title, order, description, estimated_minutes)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       order = EXCLUDED.order,
       description = EXCLUDED.description,
       estimated_minutes = EXCLUDED.estimated_minutes`,
    [
      validated.id,
      moduleData.courseId,
      validated.title,
      validated.order,
      validated.description,
      validated.estimatedMinutes,
    ]
  );
  stats.modules++;
}

async function seedLesson(client: any, lessonData: any): Promise<void> {
  const validated = LessonSchema.parse(lessonData);
  
  await client.query(
    `INSERT INTO lessons (
      id, module_id, title, summary, estimated_minutes, difficulty, xp_reward,
      learning_objectives, sections, key_takeaways, quiz_refs, challenge_refs, next_lesson_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      estimated_minutes = EXCLUDED.estimated_minutes,
      difficulty = EXCLUDED.difficulty,
      xp_reward = EXCLUDED.xp_reward,
      learning_objectives = EXCLUDED.learning_objectives,
      sections = EXCLUDED.sections,
      key_takeaways = EXCLUDED.key_takeaways,
      quiz_refs = EXCLUDED.quiz_refs,
      challenge_refs = EXCLUDED.challenge_refs,
      next_lesson_id = EXCLUDED.next_lesson_id`,
    [
      validated.id,
      lessonData.moduleId,
      validated.title,
      validated.summary,
      validated.estimatedMinutes,
      validated.difficulty,
      validated.xpReward,
      JSON.stringify(validated.learningObjectives),
      JSON.stringify(validated.sections),
      JSON.stringify(validated.keyTakeaways),
      JSON.stringify(validated.quizRefs),
      JSON.stringify(validated.challengeRefs),
      validated.nextLessonId,
    ]
  );
  stats.lessons++;
}

async function seedQuiz(client: any, quizData: any): Promise<void> {
  const validated = QuizSchema.parse(quizData);
  
  await client.query(
    `INSERT INTO quizzes (id, title, description, questions, passing_score, xp_reward)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       questions = EXCLUDED.questions,
       passing_score = EXCLUDED.passing_score,
       xp_reward = EXCLUDED.xp_reward`,
    [
      validated.id,
      validated.title,
      validated.description,
      JSON.stringify(validated.questions),
      validated.passingScore,
      validated.xpReward,
    ]
  );
  stats.quizzes++;
}

async function seedChallenge(client: any, challengeData: any): Promise<void> {
  const validated = ChallengeSchema.parse(challengeData);
  
  await client.query(
    `INSERT INTO challenges (
      id, title, difficulty, statement, starter_code, visible_tests, hidden_tests,
      hints, solution, solution_explanation, time_limit_sec, xp_reward, coin_reward, tags
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      difficulty = EXCLUDED.difficulty,
      statement = EXCLUDED.statement,
      starter_code = EXCLUDED.starter_code,
      visible_tests = EXCLUDED.visible_tests,
      hidden_tests = EXCLUDED.hidden_tests,
      hints = EXCLUDED.hints,
      solution = EXCLUDED.solution,
      solution_explanation = EXCLUDED.solution_explanation,
      time_limit_sec = EXCLUDED.time_limit_sec,
      xp_reward = EXCLUDED.xp_reward,
      coin_reward = EXCLUDED.coin_reward,
      tags = EXCLUDED.tags`,
    [
      validated.id,
      validated.title,
      validated.difficulty,
      validated.statement,
      validated.starterCode,
      JSON.stringify(validated.visibleTests),
      JSON.stringify(validated.hiddenTests),
      JSON.stringify(validated.hints),
      validated.solution,
      validated.solutionExplanation,
      validated.timeLimitSec,
      validated.xpReward,
      validated.coinReward,
      JSON.stringify(validated.tags),
    ]
  );
  stats.challenges++;
}

async function seedDebugChallenge(client: any, debugData: any): Promise<void> {
  const validated = DebugChallengeSchema.parse(debugData);
  
  await client.query(
    `INSERT INTO debug_challenges (
      id, title, difficulty, description, broken_code, bug_count, bug_descriptions,
      fixed_code, hints, explanation, xp_reward, coin_reward
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      difficulty = EXCLUDED.difficulty,
      description = EXCLUDED.description,
      broken_code = EXCLUDED.broken_code,
      bug_count = EXCLUDED.bug_count,
      bug_descriptions = EXCLUDED.bug_descriptions,
      fixed_code = EXCLUDED.fixed_code,
      hints = EXCLUDED.hints,
      explanation = EXCLUDED.explanation,
      xp_reward = EXCLUDED.xp_reward,
      coin_reward = EXCLUDED.coin_reward`,
    [
      validated.id,
      validated.title,
      validated.difficulty,
      validated.description,
      validated.brokenCode,
      validated.bugCount,
      JSON.stringify(validated.bugDescriptions),
      validated.fixedCode,
      JSON.stringify(validated.hints),
      validated.explanation,
      validated.xpReward,
      validated.coinReward,
    ]
  );
  stats.debugChallenges++;
}

async function seedPuzzle(client: any, puzzleData: any): Promise<void> {
  const validated = PuzzleSchema.parse(puzzleData);
  
  await client.query(
    `INSERT INTO puzzles (
      id, title, description, blocks, correct_order, generated_code, explanation, xp_reward, coin_reward
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      blocks = EXCLUDED.blocks,
      correct_order = EXCLUDED.correct_order,
      generated_code = EXCLUDED.generated_code,
      explanation = EXCLUDED.explanation,
      xp_reward = EXCLUDED.xp_reward,
      coin_reward = EXCLUDED.coin_reward`,
    [
      validated.id,
      validated.title,
      validated.description,
      JSON.stringify(validated.blocks),
      JSON.stringify(validated.correctOrder),
      validated.generatedCode,
      validated.explanation,
      validated.xpReward,
      validated.coinReward,
    ]
  );
  stats.puzzles++;
}

async function seedProject(client: any, projectData: any): Promise<void> {
  const validated = ProjectSchema.parse(projectData);
  
  await client.query(
    `INSERT INTO projects (
      id, language_id, title, description, difficulty, estimated_hours,
      milestones, starter_code, solution_code, xp_reward, coin_reward
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      difficulty = EXCLUDED.difficulty,
      estimated_hours = EXCLUDED.estimated_hours,
      milestones = EXCLUDED.milestones,
      starter_code = EXCLUDED.starter_code,
      solution_code = EXCLUDED.solution_code,
      xp_reward = EXCLUDED.xp_reward,
      coin_reward = EXCLUDED.coin_reward`,
    [
      validated.id,
      projectData.languageId,
      validated.title,
      validated.description,
      validated.difficulty,
      validated.estimatedHours,
      JSON.stringify(validated.milestones),
      validated.starterCode,
      validated.solutionCode,
      validated.xpReward,
      validated.coinReward,
    ]
  );
  stats.projects++;
}

async function seedMission(client: any, missionData: any): Promise<void> {
  const validated = MissionSchema.parse(missionData);
  
  await client.query(
    `INSERT INTO missions (id, title, description, type, target, xp_reward, coin_reward, difficulty)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       type = EXCLUDED.type,
       target = EXCLUDED.target,
       xp_reward = EXCLUDED.xp_reward,
       coin_reward = EXCLUDED.coin_reward,
       difficulty = EXCLUDED.difficulty`,
    [
      validated.id,
      validated.title,
      validated.description,
      validated.type,
      validated.target,
      validated.xpReward,
      validated.coinReward,
      validated.difficulty,
    ]
  );
  stats.missions++;
}

async function seedAchievement(client: any, achievementData: any): Promise<void> {
  const validated = AchievementSchema.parse(achievementData);
  
  await client.query(
    `INSERT INTO achievements (id, title, description, icon, requirement, xp_reward, coin_reward, category, rarity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       icon = EXCLUDED.icon,
       requirement = EXCLUDED.requirement,
       xp_reward = EXCLUDED.xp_reward,
       coin_reward = EXCLUDED.coin_reward,
       category = EXCLUDED.category,
       rarity = EXCLUDED.rarity`,
    [
      validated.id,
      validated.title,
      validated.description,
      validated.icon,
      validated.requirement,
      validated.xpReward,
      validated.coinReward,
      validated.category,
      validated.rarity,
    ]
  );
  stats.achievements++;
}

async function seedGlossaryTerm(client: any, termData: any): Promise<void> {
  const validated = GlossaryTermSchema.parse(termData);
  
  await client.query(
    `INSERT INTO glossary_terms (id, term, definition, example, related_terms)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       term = EXCLUDED.term,
       definition = EXCLUDED.definition,
       example = EXCLUDED.example,
       related_terms = EXCLUDED.related_terms`,
    [
      validated.id,
      validated.term,
      validated.definition,
      validated.example,
      JSON.stringify(validated.relatedTerms || []),
    ]
  );
  stats.glossaryTerms++;
}

async function seedCheatSheet(client: any, cheatSheetData: any): Promise<void> {
  const validated = CheatSheetSchema.parse(cheatSheetData);
  
  await client.query(
    `INSERT INTO cheat_sheets (id, language, title, sections)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET
       language = EXCLUDED.language,
       title = EXCLUDED.title,
       sections = EXCLUDED.sections`,
    [
      validated.id,
      validated.language,
      validated.title,
      JSON.stringify(validated.sections),
    ]
  );
  stats.cheatSheets++;
}

async function seedInterviewQuestion(client: any, questionData: any): Promise<void> {
  const validated = InterviewQuestionSchema.parse(questionData);
  
  await client.query(
    `INSERT INTO interview_questions (id, language, question, difficulty, answer, code_example, tips)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       language = EXCLUDED.language,
       question = EXCLUDED.question,
       difficulty = EXCLUDED.difficulty,
       answer = EXCLUDED.answer,
       code_example = EXCLUDED.code_example,
       tips = EXCLUDED.tips`,
    [
      validated.id,
      validated.language,
      validated.question,
      validated.difficulty,
      validated.answer,
      validated.codeExample,
      JSON.stringify(validated.tips || []),
    ]
  );
  stats.interviewQuestions++;
}

async function seedLanguageContent(client: any, langDir: string): Promise<void> {
  const langPath = path.join(CONTENT_DIR, 'languages', langDir);
  const languagePath = path.join(langPath, 'language.json');
  
  if (!fs.existsSync(languagePath)) {
    return;
  }

  const languageData = JSON.parse(fs.readFileSync(languagePath, 'utf-8'));
  await seedLanguage(client, languageData);

  // Seed courses
  const coursesDir = path.join(langPath, 'courses');
  if (!fs.existsSync(coursesDir)) {
    return;
  }

  const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const courseDir of courseDirs) {
    const coursePath = path.join(coursesDir, courseDir, 'course.json');
    if (fs.existsSync(coursePath)) {
      const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
      courseData.languageId = langDir;
      await seedCourse(client, courseData);
    }

    // Seed modules
    const modulesDir = path.join(coursesDir, courseDir, 'modules');
    if (!fs.existsSync(modulesDir)) {
      continue;
    }

    const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(modulesDir, moduleDir, 'module.json');
      if (fs.existsSync(modulePath)) {
        const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf-8'));
        moduleData.courseId = courseDir;
        await seedModule(client, moduleData);
      }

      // Seed lessons
      const lessonsDir = path.join(modulesDir, moduleDir, 'lessons');
      if (fs.existsSync(lessonsDir)) {
        const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));
        for (const lessonFile of lessonFiles) {
          const lessonPath = path.join(lessonsDir, lessonFile);
          const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
          lessonData.moduleId = moduleDir;
          await seedLesson(client, lessonData);
        }
      }

      // Seed quizzes
      const quizzesDir = path.join(modulesDir, moduleDir, 'quizzes');
      if (fs.existsSync(quizzesDir)) {
        const quizFiles = fs.readdirSync(quizzesDir).filter((f) => f.endsWith('.json'));
        for (const quizFile of quizFiles) {
          const quizPath = path.join(quizzesDir, quizFile);
          const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
          await seedQuiz(client, quizData);
        }
      }

      // Seed challenges
      const challengesDir = path.join(modulesDir, moduleDir, 'challenges');
      if (fs.existsSync(challengesDir)) {
        const challengeFiles = fs.readdirSync(challengesDir).filter((f) => f.endsWith('.json'));
        for (const challengeFile of challengeFiles) {
          const challengePath = path.join(challengesDir, challengeFile);
          const challengeData = JSON.parse(fs.readFileSync(challengePath, 'utf-8'));
          await seedChallenge(client, challengeData);
        }
      }

      // Seed debug challenges
      const debugDir = path.join(modulesDir, moduleDir, 'debug');
      if (fs.existsSync(debugDir)) {
        const debugFiles = fs.readdirSync(debugDir).filter((f) => f.endsWith('.json'));
        for (const debugFile of debugFiles) {
          const debugPath = path.join(debugDir, debugFile);
          const debugData = JSON.parse(fs.readFileSync(debugPath, 'utf-8'));
          await seedDebugChallenge(client, debugData);
        }
      }

      // Seed puzzles
      const puzzlesDir = path.join(modulesDir, moduleDir, 'puzzles');
      if (fs.existsSync(puzzlesDir)) {
        const puzzleFiles = fs.readdirSync(puzzlesDir).filter((f) => f.endsWith('.json'));
        for (const puzzleFile of puzzleFiles) {
          const puzzlePath = path.join(puzzlesDir, puzzleFile);
          const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
          await seedPuzzle(client, puzzleData);
        }
      }
    }
  }
}

async function seedProjects(): Promise<void> {
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  if (!fs.existsSync(projectsDir)) {
    return;
  }

  const client = await pool.connect();

  try {
    const langDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const langDir of langDirs) {
      const langPath = path.join(projectsDir, langDir);
      const projectFiles = fs.readdirSync(langPath).filter((f) => f.endsWith('.json'));

      for (const projectFile of projectFiles) {
        const projectPath = path.join(langPath, projectFile);
        const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
        projectData.languageId = langDir;
        await seedProject(client, projectData);
      }
    }
  } finally {
    client.release();
  }
}

async function seedMissions(): Promise<void> {
  const missionsPath = path.join(CONTENT_DIR, 'missions', 'daily-pool.json');
  if (!fs.existsSync(missionsPath)) {
    return;
  }

  const client = await pool.connect();

  try {
    const content = fs.readFileSync(missionsPath, 'utf-8');
    const missions = JSON.parse(content);

    if (Array.isArray(missions)) {
      for (const mission of missions) {
        await seedMission(client, mission);
      }
    }
  } finally {
    client.release();
  }
}

async function seedAchievements(): Promise<void> {
  const achievementsPath = path.join(CONTENT_DIR, 'achievements', 'achievements.json');
  if (!fs.existsSync(achievementsPath)) {
    return;
  }

  const client = await pool.connect();

  try {
    const content = fs.readFileSync(achievementsPath, 'utf-8');
    const achievements = JSON.parse(content);

    if (Array.isArray(achievements)) {
      for (const achievement of achievements) {
        await seedAchievement(client, achievement);
      }
    }
  } finally {
    client.release();
  }
}

async function seedGlossary(): Promise<void> {
  const glossaryDir = path.join(CONTENT_DIR, 'glossary');
  if (!fs.existsSync(glossaryDir)) {
    return;
  }

  const client = await pool.connect();

  try {
    const files = fs.readdirSync(glossaryDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(glossaryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const terms = JSON.parse(content);

      if (Array.isArray(terms)) {
        for (const term of terms) {
          await seedGlossaryTerm(client, term);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function seedCheatSheets(): Promise<void> {
  const cheatsheetsDir = path.join(CONTENT_DIR, 'cheatsheets');
  if (!fs.existsSync(cheatsheetsDir)) {
    return;
  }

  const client = await pool.connect();

  try {
    const files = fs.readdirSync(cheatsheetsDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(cheatsheetsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const cheatSheet = JSON.parse(content);
      await seedCheatSheet(client, cheatSheet);
    }
  } finally {
    client.release();
  }
}

async function seedInterviewQuestions(): Promise<void> {
  const interviewDir = path.join(CONTENT_DIR, 'interview-questions');
  if (!fs.existsSync(interviewDir)) {
    return;
  }

  const client = await pool.connect();

  try {
    const files = fs.readdirSync(interviewDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(interviewDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(content);

      if (Array.isArray(questions)) {
        for (const question of questions) {
          await seedInterviewQuestion(client, question);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  console.log('🌱 Seeding database from content files...\n');

  const client = await pool.connect();

  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS languages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        runtime_type TEXT NOT NULL,
        tags JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        level TEXT NOT NULL,
        estimated_hours NUMERIC NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        order INTEGER NOT NULL,
        description TEXT NOT NULL,
        estimated_minutes INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        estimated_minutes INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        xp_reward INTEGER NOT NULL,
        learning_objectives JSONB NOT NULL,
        sections JSONB NOT NULL,
        key_takeaways JSONB NOT NULL,
        quiz_refs JSONB NOT NULL,
        challenge_refs JSONB NOT NULL,
        next_lesson_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        questions JSONB NOT NULL,
        passing_score INTEGER NOT NULL,
        xp_reward INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        statement TEXT NOT NULL,
        starter_code TEXT NOT NULL,
        visible_tests JSONB NOT NULL,
        hidden_tests JSONB NOT NULL,
        hints JSONB NOT NULL,
        solution TEXT NOT NULL,
        solution_explanation TEXT NOT NULL,
        time_limit_sec INTEGER,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        tags JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS debug_challenges (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        description TEXT NOT NULL,
        broken_code TEXT NOT NULL,
        bug_count INTEGER NOT NULL,
        bug_descriptions JSONB NOT NULL,
        fixed_code TEXT NOT NULL,
        hints JSONB NOT NULL,
        explanation TEXT NOT NULL,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS puzzles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        blocks JSONB NOT NULL,
        correct_order JSONB NOT NULL,
        generated_code TEXT NOT NULL,
        explanation TEXT NOT NULL,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_hours NUMERIC NOT NULL,
        milestones JSONB NOT NULL,
        starter_code TEXT,
        solution_code TEXT,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        target INTEGER NOT NULL,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        requirement TEXT NOT NULL,
        xp_reward INTEGER NOT NULL,
        coin_reward INTEGER NOT NULL,
        category TEXT NOT NULL,
        rarity TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS glossary_terms (
        id TEXT PRIMARY KEY,
        term TEXT NOT NULL,
        definition TEXT NOT NULL,
        example TEXT,
        related_terms JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cheat_sheets (
        id TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        title TEXT NOT NULL,
        sections JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS interview_questions (
        id TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        question TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        answer TEXT NOT NULL,
        code_example TEXT,
        tips JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed languages and their content
    const languagesDir = path.join(CONTENT_DIR, 'languages');
    if (fs.existsSync(languagesDir)) {
      const langDirs = fs.readdirSync(languagesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const langDir of langDirs) {
        await seedLanguageContent(client, langDir);
        console.log(`✅ Seeded language: ${langDir}`);
      }
    }

    // Seed projects
    await seedProjects();
    console.log('✅ Seeded projects');

    // Seed missions
    await seedMissions();
    console.log('✅ Seeded missions');

    // Seed achievements
    await seedAchievements();
    console.log('✅ Seeded achievements');

    // Seed glossary
    await seedGlossary();
    console.log('✅ Seeded glossary terms');

    // Seed cheat sheets
    await seedCheatSheets();
    console.log('✅ Seeded cheat sheets');

    // Seed interview questions
    await seedInterviewQuestions();
    console.log('✅ Seeded interview questions');

  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n✅ Seeding completed!\n');
  console.log('📊 Seeded Statistics:\n');
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

main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
