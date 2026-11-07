import { NextRequest, NextResponse } from 'next/server';

// Code execution happens in the browser (Monaco + client-side runners).
// This endpoint previously ran user code through server-side eval(), which was
// a remote code execution vulnerability. It now only returns guidance.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Server-side execution is disabled. JavaScript runs in the browser playground; other languages are not yet supported.',
    },
    { status: 400 }
  );
}
