import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const submissionSchema = z.object({
  contentId: z.string(),
  language: z.string(),
  code: z.string(),
  result: z.enum(['passed', 'failed', 'error']),
  testsPassed: z.number().default(0),
  testsTotal: z.number().default(0),
  runtime: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = submissionSchema.parse(body);

    const db = await getDb();

    // Check if this is a better solution
    const existingBest = db.data.challengeSubmissions.find(
      (s: any) => s.userId === auth.userId && s.contentId === data.contentId && s.result === 'passed' && s.isBestSolution
    );

    const isBest = !existingBest || (data.result === 'passed' && data.testsPassed > (existingBest.testsPassed || 0));

    if (isBest && existingBest) {
      existingBest.isBestSolution = false;
    }

    const submission = {
      id: crypto.randomUUID(),
      userId: auth.userId,
      ...data,
      isBestSolution: isBest,
      createdAt: new Date().toISOString(),
    };

    db.data.challengeSubmissions.push(submission);
    await saveDb();

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Submission error:', error);
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
    const contentId = searchParams.get('contentId');

    const db = await getDb();
    let submissions = db.data.challengeSubmissions
      .filter((s: any) => s.userId === auth.userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    if (contentId) {
      submissions = submissions.filter((s: any) => s.contentId === contentId);
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
