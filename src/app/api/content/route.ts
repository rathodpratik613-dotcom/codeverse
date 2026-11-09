import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Public read-only content API.
// GET /api/content?type=lesson&language=python
// GET /api/content?type=lesson&id=lesson-01&language=python
// GET /api/content?type=module|course|quiz|challenge&language=python
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const id = searchParams.get('id');

    const db = await getDb();
    let items = db.data.contentItems as any[];

    if (type) items = items.filter((i) => i.type === type);
    if (language) items = items.filter((i) => i.language === language);
    if (id) items = items.filter((i) => i.data?.id === id);

    // Deterministic ordering: lessons/quizzes/etc sort by file path so
    // module order (01-, 02-...) and lesson number are preserved.
    items = [...items].sort((a, b) =>
      String(a.filePath || '').localeCompare(String(b.filePath || ''))
    );

    return NextResponse.json({
      items: items.map((i) => ({
        id: i.data?.id,
        type: i.type,
        language: i.language,
        filePath: i.filePath,
        ...i.data,
      })),
    });
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
