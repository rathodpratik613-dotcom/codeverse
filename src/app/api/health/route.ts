import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Public health check for Render / uptime monitors.
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const users = Array.isArray(db.data.users) ? db.data.users.length : 0;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      users,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
