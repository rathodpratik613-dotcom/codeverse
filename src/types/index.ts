export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  createdAt: Date;
}

export interface Language {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

export interface Course {
  id: string;
  languageId: string;
  title: string;
  description: string;
  level: number;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  codeExample?: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exercises: Exercise[];
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: 'code' | 'quiz' | 'fill-blank';
  question: string;
  starterCode?: string;
  expectedOutput?: string;
  testCases?: TestCase[];
  xpReward: number;
  coinReward: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  starterCode: string;
  testCases: TestCase[];
  xpReward: number;
  coinReward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  xpReward: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export interface UserProgress {
  userId: string;
  languageId: string;
  lessonId: string;
  completed: boolean;
  xpEarned: number;
  completedAt: Date;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'complete_lesson' | 'solve_challenge' | 'earn_xp' | 'streak';
  target: number;
  xpReward: number;
  coinReward: number;
}

export interface UserMission {
  userId: string;
  missionId: string;
  progress: number;
  completed: boolean;
  date: Date;
}
