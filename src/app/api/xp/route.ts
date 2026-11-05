import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { XpTransaction, CoinTransaction } from '@/models/xp-transaction';
import { z } from 'zod';

const xpSchema = z.object({
  amount: z.number(),
  sourceType: z.enum(['lesson', 'challenge', 'quiz', 'mission', 'achievement', 'streak']),
  sourceId: z.string(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const data = xpSchema.parse(body);

    // Check if XP was already awarded for this source (idempotent)
    const existing = await XpTransaction.findOne({
      userId: decoded.userId,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
    });

    if (existing) {
      return NextResponse.json({ success: true, alreadyAwarded: true });
    }

    // Create XP transaction
    await XpTransaction.create({
      ...data,
      userId: decoded.userId,
    });

    // Update user XP
    const { updateUserXP } = await import('@/lib/auth');
    const user = await updateUserXP(decoded.userId, data.amount);

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
    await dbConnect();

    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const data = coinSchema.parse(body);

    // Check if coins were already awarded for this source (idempotent)
    const existing = await CoinTransaction.findOne({
      userId: decoded.userId,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
    });

    if (existing) {
      return NextResponse.json({ success: true, alreadyAwarded: true });
    }

    // Create coin transaction
    await CoinTransaction.create({
      ...data,
      userId: decoded.userId,
    });

    // Update user coins
    const { updateUserCoins } = await import('@/lib/auth');
    const user = await updateUserCoins(decoded.userId, data.amount);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Coin award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
