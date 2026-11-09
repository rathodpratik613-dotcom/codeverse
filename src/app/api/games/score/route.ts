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
    await saveDb();

    return NextResponse.json({ success: true, id: record.id });
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
