'use client';

import { Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Play, RotateCcw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { pythonCourse, javascriptCourse } from '@/data/courses';
import { useAuth } from '@/lib/auth-context';

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}

function LessonContent() {
  const params = useParams();
  const lessonId = params.id as string;
  const { user } = useAuth();

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Find the lesson from courses
  const courses = { 'python-basics': pythonCourse, 'javascript-basics': javascriptCourse };
  let lesson = null;
  let language = 'python';

  for (const course of Object.values(courses)) {
    for (const module of course.modules) {
      const found = module.lessons.find(l => l.id === lessonId);
      if (found) {
        lesson = found;
        language = course.languageId;
        break;
      }
    }
    if (lesson) break;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Lesson Not Found</h1>
          <Link href="/languages" className="text-purple-400 hover:text-purple-300">
            Browse Languages
          </Link>
        </div>
      </div>
    );
  }

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResult(null);

    try {
      if (language === 'javascript') {
        // Execute JavaScript in browser
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        try {
          const result = eval(code);
          console.log = originalLog;
          setOutput(logs.join('\n') || (result !== undefined ? String(result) : 'No output'));

          // Check against expected output
          const exercise = lesson.exercises[0];
          if (exercise?.expectedOutput) {
            const cleanOutput = logs.join('\n').trim();
            if (cleanOutput === exercise.expectedOutput.trim()) {
              setTestResult('success');

              // Award XP if not already awarded
              if (!xpAwarded && user) {
                try {
                  await fetch(`/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ xp: exercise.xpReward, coins: exercise.coinReward }),
                  });
                  setXpAwarded(true);
                } catch (error) {
                  console.error('Failed to award XP:', error);
                }
              }
            } else {
              setTestResult('error');
            }
          }
        } catch (error) {
          console.log = originalLog;
          setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
          setTestResult('error');
        }
      } else if (language === 'python') {
        // For Python, we'll show a message about needing Pyodide
        setOutput('Python execution requires Pyodide integration. This will be implemented in the backend.\n\nFor now, JavaScript execution is fully supported.\n\nYour code:\n' + code);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setTestResult('error');
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(lesson.exercises[0]?.starterCode || lesson.codeExample || '');
    setOutput('');
    setTestResult(null);
  };

  const defaultCode = lesson.exercises[0]?.starterCode || lesson.codeExample || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            CODEVERSE
          </span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <Link href="/course/python-basics" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lesson.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  lesson.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {lesson.difficulty}
                </span>
                <span className="text-gray-400 text-sm">{lesson.exercises.length} exercises</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {lesson.content}
                </div>
              </div>
            </div>

            {lesson.exercises.length > 0 && (
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-400" />
                  Exercise
                </h2>
                <p className="text-gray-300 mb-4">{lesson.exercises[0].question}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-400">+{lesson.exercises[0].xpReward} XP</span>
                  <span className="text-cyan-400">+{lesson.exercises[0].coinReward} coins</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">main.{language === 'python' ? 'py' : 'js'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Reset Code"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>

              <div className="h-96">
                <Editor
                  height="100%"
                  defaultLanguage={language === 'python' ? 'python' : 'javascript'}
                  value={code || defaultCode}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <span className="text-gray-400 text-sm">Output</span>
              </div>
              <div className="p-4 min-h-[150px] max-h-[300px] overflow-auto">
                {testResult === 'success' && (
                  <div className="flex items-center gap-2 text-green-400 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Test Passed!</span>
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 mb-3">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Test Failed</span>
                  </div>
                )}
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                  {output || 'Click "Run" to execute your code'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
