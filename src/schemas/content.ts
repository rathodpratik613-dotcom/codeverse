import { z } from 'zod';

// Base schemas
export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const ChallengeDifficultySchema = z.number().min(1).max(5);
export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  runtimeType: z.enum(['browser', 'server', 'simulated', 'unsupported']),
  tags: z.array(z.string()),
});

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: DifficultySchema,
  estimatedHours: z.number(),
  description: z.string(),
});

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  description: z.string(),
  estimatedMinutes: z.number(),
});

export const LessonSectionSchema = z.object({
  type: z.enum(['text', 'code', 'tip', 'warning', 'common-mistake']),
  content: z.string(),
  codeExample: z.string().optional(),
  expectedOutput: z.string().optional(),
  language: z.string().optional(),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number(),
  difficulty: ChallengeDifficultySchema,
  xpReward: z.number(),
  learningObjectives: z.array(z.string()),
  sections: z.array(LessonSectionSchema),
  keyTakeaways: z.array(z.string()),
  quizRefs: z.array(z.string()),
  challengeRefs: z.array(z.string()),
  nextLessonId: z.string().optional(),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['mcq', 'multi-select', 'true-false', 'fill-blank', 'predict-output']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string(),
  incorrectExplanations: z.record(z.string(), z.string()).optional(),
});

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(QuizQuestionSchema),
  passingScore: z.number(),
  xpReward: z.number(),
});

export const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
});

export const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: ChallengeDifficultySchema,
  statement: z.string(),
  starterCode: z.string(),
  visibleTests: z.array(TestCaseSchema),
  hiddenTests: z.array(TestCaseSchema),
  hints: z.array(z.string()).length(3),
  solution: z.string(),
  solutionExplanation: z.string(),
  timeLimitSec: z.number().optional(),
  xpReward: z.number(),
  coinReward: z.number(),
  tags: z.array(z.string()),
});

export const DebugChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: ChallengeDifficultySchema,
  description: z.string(),
  brokenCode: z.string(),
  bugCount: z.number(),
  bugDescriptions: z.array(z.string()),
  fixedCode: z.string(),
  hints: z.array(z.string()),
  explanation: z.string(),
  xpReward: z.number(),
  coinReward: z.number(),
});

export const PuzzleBlockSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
});

export const PuzzleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  blocks: z.array(PuzzleBlockSchema),
  correctOrder: z.array(z.string()),
  generatedCode: z.string(),
  explanation: z.string(),
  xpReward: z.number(),
  coinReward: z.number(),
});

export const ProjectMilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  xpReward: z.number(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  estimatedHours: z.number(),
  milestones: z.array(ProjectMilestoneSchema),
  starterCode: z.string().optional(),
  solutionCode: z.string().optional(),
  xpReward: z.number(),
  coinReward: z.number(),
});

export const MissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['complete_lesson', 'solve_challenge', 'earn_xp', 'streak', 'daily_login']),
  target: z.number(),
  xpReward: z.number(),
  coinReward: z.number(),
  difficulty: ChallengeDifficultySchema,
});

export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  requirement: z.string(),
  xpReward: z.number(),
  coinReward: z.number(),
  category: z.enum(['learning', 'coding', 'social', 'special']),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
});

export const GlossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
  example: z.string().optional(),
  relatedTerms: z.array(z.string()).optional(),
});

export const CheatSheetSchema = z.object({
  id: z.string(),
  language: z.string(),
  title: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    codeExamples: z.array(z.string()).optional(),
  })),
});

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  language: z.string(),
  question: z.string(),
  difficulty: ChallengeDifficultySchema,
  answer: z.string(),
  codeExample: z.string().optional(),
  tips: z.array(z.string()).optional(),
});

// Type exports
export type Language = z.infer<typeof LanguageSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type DebugChallenge = z.infer<typeof DebugChallengeSchema>;
export type Puzzle = z.infer<typeof PuzzleSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type CheatSheet = z.infer<typeof CheatSheetSchema>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
