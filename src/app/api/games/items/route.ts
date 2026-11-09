import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GAMES_DIR = path.join(process.cwd(), 'content', 'games');
const TYPES = ['code-puzzle', 'bug-hunter', 'match-pairs', 'fill-blank'];
const LANG_RE = /^[a-z0-9-]+$/;

// GET /api/games/items?game=bug-hunter&language=python
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || '';
    const language = searchParams.get('language') || '';

    if (!TYPES.includes(game)) {
      return NextResponse.json({ error: `game must be one of: ${TYPES.join(', ')}` }, { status: 400 });
    }
    if (!LANG_RE.test(language)) {
      return NextResponse.json({ error: 'invalid language' }, { status: 400 });
    }

    const file = path.join(GAMES_DIR, language, `${game}.json`);
    if (!fs.existsSync(file)) {
      return NextResponse.json({ items: [] });
    }
    const items = JSON.parse(fs.readFileSync(file, 'utf8'));
    return NextResponse.json({ items, language, game });
  } catch (error) {
    console.error('Game items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
