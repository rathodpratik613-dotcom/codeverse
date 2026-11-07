import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUserXP, updateUserCoins, updateUserStreak, getSessionAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const patchSchema = z.object({
  xp: z.number().optional(),
  coins: z.number().optional(),
  streak: z.number().optional(),
});

async function authorize(request: NextRequest, targetUserId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const auth = token ? await getSessionAuth(token) : null;
  if (!auth) return null;

  const caller = await findUserById(auth.userId);
  if (!caller) return null;

  const isSelf = caller.id === targetUserId;
  const isAdmin = caller.role === 'admin';
  if (!isSelf && !isAdmin) return null;

  return caller;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caller = await authorize(request, id);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caller = await authorize(request, id);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // XP/coins/streak changes must go through /api/xp (idempotent, audited).
    // Direct profile mutation is admin-only.
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = patchSchema.parse(await request.json());

    let user = await findUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.xp !== undefined) {
      user = await updateUserXP(id, body.xp);
    }
    if (body.coins !== undefined) {
      user = await updateUserCoins(id, body.coins);
    }
    if (body.streak !== undefined) {
      user = await updateUserStreak(id, body.streak);
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
