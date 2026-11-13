import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionAuth, findUserById } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const auth = token ? await getSessionAuth(token) : null;
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUserById(auth.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = await getDb();
    
    const users = (db.data.users as any[]).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      level: u.level,
      xp: u.xp,
      coins: u.coins,
      createdAt: u.createdAt,
    }));

    const gameHistory = (db.data.gameHistory as any[] || []);
    const totalGames = gameHistory.length;
    const uniqueUsers = new Set(gameHistory.map(g => g.userId)).size;

    return NextResponse.json({
      users: users.slice(0, 50),
      stats: {
        totalUsers: users.length,
        activeUsers: uniqueUsers,
        totalGames,
        totalXP: users.reduce((sum, u) => sum + (u.xp || 0), 0),
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
