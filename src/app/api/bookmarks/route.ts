import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const bookmarkSchema = z.object({
  contentId: z.string(),
  contentType: z.string(),
  title: z.string(),
  languageSlug: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = bookmarkSchema.parse(body);

    const db = await getDb();
    let bookmark = db.data.bookmarks.find(
      (b: any) => b.userId === auth.userId && b.contentId === data.contentId
    );

    if (bookmark) {
      Object.assign(bookmark, data, { updatedAt: new Date().toISOString() });
    } else {
      bookmark = {
        id: crypto.randomUUID(),
        userId: auth.userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.data.bookmarks.push(bookmark);
    }

    await saveDb();
    return NextResponse.json({ success: true, bookmark });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Bookmark error:', error);
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
    let bookmarks = db.data.bookmarks.filter((b: any) => b.userId === auth.userId);

    if (contentId) {
      bookmarks = bookmarks.filter((b: any) => b.contentId === contentId);
    }

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    const auth = token ? await getSessionAuth(token) : null;
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    const db = await getDb();
    db.data.bookmarks = db.data.bookmarks.filter(
      (b: any) => !(b.userId === auth.userId && b.contentId === contentId)
    );
    await saveDb();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
