import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const progressSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['lesson', 'quiz', 'challenge', 'debug', 'puzzle']),
  languageSlug: z.string(),
  moduleId: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  timeSpent: z.number().optional(),
  lastPosition: z.any().optional(),
  score: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = progressSchema.parse(body);

    const db = await getDb();
    let progress = db.data.lessonProgress.find(
      (p: any) => p.userId === auth.userId && p.contentId === data.contentId && p.languageSlug === data.languageSlug
    );

    if (progress) {
      Object.assign(progress, data, {
        completedAt: data.status === 'completed' ? new Date().toISOString() : progress.completedAt,
      });
    } else {
      progress = {
        id: crypto.randomUUID(),
        userId: auth.userId,
        ...data,
        completedAt: data.status === 'completed' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.data.lessonProgress.push(progress);
    }

    await saveDb();
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageSlug = searchParams.get('language');
    const contentId = searchParams.get('contentId');

    const db = await getDb();
    let progress = db.data.lessonProgress.filter((p: any) => p.userId === auth.userId);

    if (languageSlug) {
      progress = progress.filter((p: any) => p.languageSlug === languageSlug);
    }
    if (contentId) {
      progress = progress.filter((p: any) => p.contentId === contentId);
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
