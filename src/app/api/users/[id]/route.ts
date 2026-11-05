import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUserXP, updateUserCoins, updateUserStreak } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await findUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { xp, coins, streak } = await request.json();

    let user = await findUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (xp !== undefined) {
      user = await updateUserXP(id, xp);
    }
    if (coins !== undefined) {
      user = await updateUserCoins(id, coins);
    }
    if (streak !== undefined) {
      user = await updateUserStreak(id, streak);
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
