import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { ChallengeSubmission } from '@/models/challenge-submission';
import { z } from 'zod';

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
    const data = submissionSchema.parse(body);

    // Check if this is a better solution than existing ones
    const existingBest = await ChallengeSubmission.findOne({
      userId: decoded.userId,
      contentId: data.contentId,
      result: 'passed',
      isBestSolution: true,
    }).sort({ testsPassed: -1 });

    const isBest = !existingBest || (data.result === 'passed' && data.testsPassed > (existingBest.testsPassed || 0));

    if (isBest && existingBest) {
      await ChallengeSubmission.updateOne({ _id: existingBest._id }, { isBestSolution: false });
    }

    const submission = await ChallengeSubmission.create({
      ...data,
      userId: decoded.userId,
      isBestSolution: isBest,
    });

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
    const contentId = searchParams.get('contentId');

    const query: any = { userId: decoded.userId };
    if (contentId) query.contentId = contentId;

    const submissions = await ChallengeSubmission.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
