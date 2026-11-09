import { NextRequest, NextResponse } from 'next/server';
import { getSessionAuth, findUserById } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const suggestSchema = z.object({
  name: z.string().trim().min(2).max(60),
  reason: z.string().trim().max(500).optional().default(''),
});

async function getAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? getSessionAuth(token) : null;
}

// GET — list suggestions (public: name, votes, status; voters not exposed)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    const db = await getDb();
    const user = auth ? await findUserById(auth.userId) : null;
    const isAdmin = user?.role === 'admin';
    const all = (db.data.languageSuggestions as any[]) || [];
    const visible = isAdmin ? all : all.filter((s) => s.status !== 'rejected');
    return NextResponse.json({
      suggestions: visible
        .map((s) => ({
          id: s.id,
          name: s.name,
          reason: s.reason,
          votes: (s.votes || []).length,
          status: s.status,
          createdAt: s.createdAt,
          hasVoted: auth ? (s.votes || []).includes(auth.userId) : false,
        }))
        .sort((a, b) => b.votes - a.votes || String(b.createdAt).localeCompare(String(a.createdAt))),
    });
  } catch (error) {
    console.error('Suggestions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — create a suggestion (auth required; dup + rate-limit protected)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) return NextResponse.json({ error: 'Login required to suggest a language' }, { status: 401 });

    const body = await request.json();
    const data = suggestSchema.parse(body);

    const db = await getDb();
    const list = db.data.languageSuggestions as any[];
    const nameKey = data.name.toLowerCase();

    // Duplicate: same name already suggested (pending or approved)
    if (list.some((s) => s.name.toLowerCase() === nameKey && s.status !== 'rejected')) {
      return NextResponse.json({ error: 'This language has already been suggested' }, { status: 409 });
    }
    // Spam: max 5 suggestions per user per day
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = list.filter((s) => s.suggestedBy === auth.userId && new Date(s.createdAt).getTime() > dayAgo);
    if (recent.length >= 5) {
      return NextResponse.json({ error: 'Too many suggestions. Try again tomorrow.' }, { status: 429 });
    }

    const suggestion = {
      id: crypto.randomUUID(),
      name: data.name,
      reason: data.reason,
      status: 'pending',
      suggestedBy: auth.userId,
      votes: [auth.userId], // suggester auto-votes
      createdAt: new Date().toISOString(),
    };
    list.push(suggestion);
    await saveDb();
    return NextResponse.json({ success: true, suggestion: { id: suggestion.id, name: suggestion.name, votes: 1 } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Suggestions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — vote {id} or admin moderate {id, status}
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuth(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const db = await getDb();
    const list = db.data.languageSuggestions as any[];
    const item = list.find((s) => s.id === body.id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.action === 'vote') {
      item.votes = item.votes || [];
      if (item.votes.includes(auth.userId)) {
        item.votes = item.votes.filter((v: string) => v !== auth.userId);
      } else {
        item.votes.push(auth.userId);
      }
      await saveDb();
      return NextResponse.json({ success: true, votes: item.votes.length, hasVoted: item.votes.includes(auth.userId) });
    }

    if (body.action === 'moderate') {
      const user = await findUserById(auth.userId);
      if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
      if (!['approved', 'rejected'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      item.status = body.status;
      await saveDb();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Suggestions PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
