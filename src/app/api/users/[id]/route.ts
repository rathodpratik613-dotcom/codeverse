import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUserXP, updateUserCoins, updateUserStreak } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = findUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
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
  { params }: { params: { id: string } }
) {
  try {
    const { xp, coins, streak } = await request.json();

    let user = findUserById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (xp !== undefined) {
      user = updateUserXP(params.id, xp);
    }
    if (coins !== undefined) {
      user = updateUserCoins(params.id, coins);
    }
    if (streak !== undefined) {
      user = updateUserStreak(params.id, streak);
    }

    const { password: _, ...userWithoutPassword } = user!;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
