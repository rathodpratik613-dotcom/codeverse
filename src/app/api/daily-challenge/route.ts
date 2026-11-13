import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSessionAuth } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'crypto';

// Deterministic daily seed based on UTC date
function getDailySeed(): number {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const answerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selected: z.string(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const auth = await getSessionAuth(request.cookies.get('token')?.value || '');
    const today = new Date().toISOString().slice(0, 10);

    // Check if user already completed today's challenge
    const existing = (db.data.dailyChallenges as any[] || []).find(
      (d) => d.userId === auth?.userId && d.date === today
    );

    if (existing) {
      return NextResponse.json({
        completed: true,
        score: existing.score,
        correct: existing.correct,
        total: existing.total,
        completedAt: existing.completedAt,
      });
    }

    // Get quiz questions from database
    const quizzes = (db.data.contentItems as any[] || []).filter(
      (c) => c.type === 'quiz' && c.language === 'python' // Default to Python for daily
    );

    const allQuestions: any[] = [];
    for (const quiz of quizzes) {
      for (const q of quiz.questions || []) {
        if (q.type === 'mcq' && q.options && q.correctAnswer) {
          allQuestions.push({ ...q, quizTitle: quiz.title });
        }
      }
    }

    // Deterministic shuffle based on date
    const seed = getDailySeed();
    const rng = mulberry32(seed);
    const shuffled = [...allQuestions].sort(() => rng() - 0.5);
    const questions = shuffled.slice(0, 10).map((q, i) => ({
      id: `${today}-${i}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    return NextResponse.json({
      completed: false,
      date: today,
      questions,
    });
  } catch (error) {
    console.error('Daily challenge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionAuth(request.cookies.get('token')?.value || '');
    if (!auth) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = answerSchema.parse(body);

    const db = await getDb();
    const today = new Date().toISOString().slice(0, 10);

    // Check if already completed
    const existing = (db.data.dailyChallenges as any[] || []).find(
      (d) => d.userId === auth.userId && d.date === today
    );

    if (existing) {
      return NextResponse.json({ error: 'Already completed today' }, { status: 400 });
    }

    // Get questions again to verify answers
    const quizzes = (db.data.contentItems as any[] || []).filter(
      (c) => c.type === 'quiz' && c.language === 'python'
    );

    const allQuestions: any[] = [];
    for (const quiz of quizzes) {
      for (const q of quiz.questions || []) {
        if (q.type === 'mcq' && q.options && q.correctAnswer) {
          allQuestions.push(q);
        }
      }
    }

    const seed = getDailySeed();
    const rng = mulberry32(seed);
    const shuffled = [...allQuestions].sort(() => rng() - 0.5);
    const questions = shuffled.slice(0, 10);

    // Score
    let correct = 0;
    let score = 0;
    for (const q of questions) {
      const userAnswer = answers.find((a) => a.questionId === q.id)?.selected;
      if (userAnswer === q.correctAnswer) {
        correct++;
        score += 100;
      }
    }

    // Bonus for perfect score
    if (correct === questions.length) score += 500;

    const record = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      date: today,
      score,
      correct,
      total: questions.length,
      completedAt: new Date().toISOString(),
    };

    if (!db.data.dailyChallenges) db.data.dailyChallenges = [];
    (db.data.dailyChallenges as any[]).push(record);
    await saveDb();

    // Award XP
    const { updateUserXP } = await import('@/lib/auth');
    await updateUserXP(auth.userId, Math.floor(score / 10));

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: questions.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Daily challenge submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
