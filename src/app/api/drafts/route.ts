import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const draftSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['lesson', 'challenge', 'playground']),
  language: z.string(),
  code: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const data = draftSchema.parse(body);

    const db = await getDb();
    let draft = db.data.editorDrafts.find(
      (d: any) => d.userId === decoded.userId && d.contentId === data.contentId
    );

    if (draft) {
      Object.assign(draft, data, { isAutosaved: true, updatedAt: new Date().toISOString() });
    } else {
      draft = {
        id: crypto.randomUUID(),
        userId: decoded.userId,
        ...data,
        isAutosaved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.data.editorDrafts.push(draft);
    }

    await saveDb();
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Draft save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const db = await getDb();
    let drafts = db.data.editorDrafts.filter((d: any) => d.userId === decoded.userId);

    if (contentId) {
      drafts = drafts.filter((d: any) => d.contentId === contentId);
    }

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Get drafts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    const db = await getDb();
    db.data.editorDrafts = db.data.editorDrafts.filter(
      (d: any) => !(d.userId === decoded.userId && d.contentId === contentId)
    );
    await saveDb();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
