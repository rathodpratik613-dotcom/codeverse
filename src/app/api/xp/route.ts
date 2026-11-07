import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth, updateUserXP, updateUserCoins } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const xpSchema = z.object({
  amount: z.number(),
  sourceType: z.enum(['lesson', 'challenge', 'quiz', 'mission', 'achievement', 'streak']),
  sourceId: z.string(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = xpSchema.parse(body);

    const db = await getDb();

    // Check if XP was already awarded (idempotent)
    const existing = db.data.xpTransactions.find(
      (t: any) => t.userId === auth.userId && t.sourceType === data.sourceType && t.sourceId === data.sourceId
    );

    if (existing) {
      return NextResponse.json({ success: true, alreadyAwarded: true });
    }

    // Create XP transaction
    const transaction = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.data.xpTransactions.push(transaction);
    await saveDb();

    // Update user XP
    const user = await updateUserXP(auth.userId, data.amount);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('XP award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const coinSchema = z.object({
  amount: z.number(),
  sourceType: z.string(),
  sourceId: z.string(),
  description: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = coinSchema.parse(body);

    const db = await getDb();

    // Check if coins were already awarded (idempotent)
    const existing = db.data.coinTransactions.find(
      (t: any) => t.userId === auth.userId && t.sourceType === data.sourceType && t.sourceId === data.sourceId
    );

    if (existing) {
      return NextResponse.json({ success: true, alreadyAwarded: true });
    }

    // Create coin transaction
    const transaction = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.data.coinTransactions.push(transaction);
    await saveDb();

    // Update user coins
    const user = await updateUserCoins(auth.userId, data.amount);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Coin award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
