import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth, findUserById } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const scoreSchema = z.object({
  game: z.string().min(1).max(50),
  language: z.string().min(1).max(50),
  score: z.number().int().min(0),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
  durationMs: z.number().int().min(0).optional(),
});

async function getAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? getSessionAuth(token) : null;
}

// POST — record a game result
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) return NextResponse.json({ error: 'Login required to save scores' }, { status: 401 });

    const body = await request.json();
    const data = scoreSchema.parse(body);

    const db = await getDb();
    const record = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      ...data,
      playedAt: new Date().toISOString(),
    };
    (db.data.gameHistory as any[]).push(record);

    // --- Streak: consecutive days with at least one game ---
    const history = db.data.gameHistory as any[];
    const days = new Set(
      history.filter((h) => h.userId === auth.userId).map((h) => String(h.playedAt).slice(0, 10))
    );
    const dayMs = 24 * 3600e3;
    let streak = 0;
    const cursor = new Date();
    // allow today or yesterday as the streak anchor
    if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setTime(cursor.getTime() - dayMs);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setTime(cursor.getTime() - dayMs);
    }
    const user = (db.data.users as any[]).find((u) => u.id === auth.userId);
    if (user) {
      user.streak = streak;
      user.longestStreak = Math.max(user.longestStreak || 0, streak);
      user.lastGameDate = new Date().toISOString().slice(0, 10);
    }

    // --- Badges ---
    const BADGES: { id: string; test: (ctx: any) => boolean }[] = [
      { id: 'first-game', test: (c) => c.games >= 1 },
      { id: 'getting-started', test: (c) => c.games >= 5 },
      { id: 'regular', test: (c) => c.games >= 25 },
      { id: 'sharpshooter', test: (c) => c.accuracy >= 0.8 && c.games >= 10 },
      { id: 'perfectionist', test: (c) => c.perfect },
      { id: 'streak-3', test: (c) => c.streak >= 3 },
      { id: 'streak-7', test: (c) => c.streak >= 7 },
      { id: 'streak-30', test: (c) => c.streak >= 30 },
      { id: 'polyglot', test: (c) => c.languages >= 3 },
      { id: 'decathlete', test: (c) => c.languages >= 10 },
      { id: 'score-1000', test: (c) => c.bestScore >= 1000 },
      { id: 'centurion', test: (c) => c.games >= 100 },
      { id: 'quiz-master', test: (c) => c.game === 'quiz-battle' && c.games >= 10 },
      { id: 'puzzle-solver', test: (c) => c.game === 'code-puzzle' && c.games >= 10 },
      { id: 'bug-squasher', test: (c) => c.game === 'bug-hunter' && c.games >= 10 },
    ];
    const myHistory = history.filter((h) => h.userId === auth.userId);
    const langs = new Set(myHistory.map((h) => h.language));
    const ctx = {
      games: myHistory.length,
      accuracy: myHistory.length ? myHistory.reduce((a: number, h: any) => a + h.correct / Math.max(1, h.total), 0) / myHistory.length : 0,
      perfect: data.correct === data.total && data.total >= 5,
      streak,
      languages: langs.size,
      bestScore: Math.max(0, ...myHistory.map((h: any) => h.score || 0)),
      game: data.game,
    };
    const achievements = db.data.userAchievements as any[];
    const newBadges: string[] = [];
    for (const b of BADGES) {
      const already = achievements.some((a) => a.userId === auth.userId && a.badgeId === b.id);
      if (!already && b.test(ctx)) {
        achievements.push({
          id: crypto.randomUUID(), userId: auth.userId, badgeId: b.id,
          earnedAt: new Date().toISOString(),
        });
        newBadges.push(b.id);
      }
    }

    await saveDb();
    return NextResponse.json({ success: true, id: record.id, streak, newBadges });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Game score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET — leaderboard: ?game=&language=&period=daily|weekly|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const language = searchParams.get('language');
    const period = searchParams.get('period') || 'all';

    const db = await getDb();
    let records = (db.data.gameHistory as any[]) || [];

    if (game) records = records.filter((r) => r.game === game);
    if (language) records = records.filter((r) => r.language === language);

    const now = Date.now();
    const windowMs = period === 'daily' ? 24 * 3600e3 : period === 'weekly' ? 7 * 24 * 3600e3 : Infinity;
    records = records.filter((r) => now - new Date(r.playedAt).getTime() < windowMs);

    // Best score per user
    const best = new Map<string, any>();
    for (const r of records) {
      const prev = best.get(r.userId);
      if (!prev || r.score > prev.score) best.set(r.userId, r);
    }

    const entries = await Promise.all(
      [...best.values()].map(async (r) => {
        const user = await findUserById(r.userId);
        return {
          username: user?.username || user?.email || 'Anonymous',
          score: r.score,
          correct: r.correct,
          total: r.total,
          playedAt: r.playedAt,
        };
      })
    );
    entries.sort((a, b) => b.score - a.score);

    return NextResponse.json({ leaderboard: entries.slice(0, 50) });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
