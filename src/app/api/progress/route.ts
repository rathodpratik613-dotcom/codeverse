import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { LessonProgress } from '@/models/lesson-progress';
import { z } from 'zod';

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
    const data = progressSchema.parse(body);

    const progress = await LessonProgress.findOneAndUpdate(
      {
        userId: decoded.userId,
        contentId: data.contentId,
      },
      {
        ...data,
        userId: decoded.userId,
        completedAt: data.status === 'completed' ? new Date() : undefined,
      },
      { upsert: true, new: true }
    );

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
    await dbConnect();

    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const languageSlug = searchParams.get('language');
    const contentId = searchParams.get('contentId');

    const query: any = { userId: decoded.userId };
    if (languageSlug) query.languageSlug = languageSlug;
    if (contentId) query.contentId = contentId;

    const progress = await LessonProgress.find(query).lean();

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
