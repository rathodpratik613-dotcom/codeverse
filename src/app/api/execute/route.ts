import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    let output = '';
    let error = null;

    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));

        const result = eval(code);
        console.log = originalLog;

        output = logs.join('\n') || (result !== undefined ? String(result) : 'Code executed successfully');
      } catch (err) {
        console.log = console.log;
        error = err instanceof Error ? err.message : String(err);
      }
    } else if (language === 'python') {
      // Python execution requires Pyodide or backend service
      output = 'Python execution is not yet implemented in the API. Please use JavaScript for now.\n\nFuture implementation will use Pyodide for browser-based Python execution.';
    } else {
      error = `Language '${language}' is not supported yet`;
    }

    return NextResponse.json({
      success: !error,
      output,
      error
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
