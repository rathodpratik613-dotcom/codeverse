'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Lightbulb, AlertTriangle, Trophy, Loader2 } from 'lucide-react';
import { useLessonProgress } from '@/lib/use-lesson-progress';

interface Section {
  type: 'text' | 'code' | 'tip' | 'warning' | 'common-mistake';
  content: string;
  codeExample?: string;
  expectedOutput?: string;
  language?: string;
}

interface DbLesson {
  id: string;
  title: string;
  summary?: string;
  sections?: Section[];
  keyTakeaways?: string[];
  language?: string;
}

export default function DbLessonView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<DbLesson | null>(null);
  const [siblings, setSiblings] = useState<DbLesson[]>([]);
  const [courseId, setCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/content?type=lesson&id=${encodeURIComponent(lessonId)}`);
        const data = await res.json();
        const found = (data.items || [])[0];
        if (!found) {
          if (!cancelled) { setError('Lesson not found'); setLoading(false); }
          return;
        }
        setLesson(found);
        setCourseId(String(found.filePath || '').split('/courses/')[1]?.split('/')[0] || '');

        // Load all lessons for this language to build prev/next
        const lang = found.language;
        const all = await fetch(`/api/content?type=lesson&language=${lang}`);
        const allData = await all.json();
        if (!cancelled) setSiblings((allData.items || []) as DbLesson[]);
      } catch {
        if (!cancelled) setError('Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId]);

  const lessonIds = useMemo(() => siblings.map((l) => l.id), [siblings]);
  const progress = useLessonProgress(lesson?.language, lessonIds);

  const idx = siblings.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const isCompleted = progress.completedIds.has(lessonId);
  const completedCount = progress.completedCount;
  const totalCount = progress.totalCount;
  const pct = progress.percent;

  const markComplete = async () => {
    await progress.markComplete(lessonId);
    if (next) router.push(`/lesson/${next.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{error || 'Lesson not found'}</h1>
          <Link href="/languages" className="text-purple-400 hover:text-purple-300">Browse Languages</Link>
        </div>
      </div>
    );
  }

  const isLast = !next;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Lesson {idx + 1} of {siblings.length}</span>
            <span>{completedCount}/{totalCount} completed · {pct}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">{lesson.title}</h1>
          {lesson.summary && <p className="text-gray-400 mb-4">{lesson.summary}</p>}

          <div className="space-y-4">
            {(lesson.sections || []).map((s, i) => {
              if (s.type === 'code') {
                return (
                  <div key={i} className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10 text-xs text-gray-400">{s.language || 'code'}</div>
                    <pre className="p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap font-mono">{s.codeExample}</pre>
                    {s.expectedOutput && (
                      <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-400">
                        Output: <span className="text-cyan-300">{s.expectedOutput}</span>
                      </div>
                    )}
                  </div>
                );
              }
              if (s.type === 'tip') {
                return (
                  <div key={i} className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-sm">{s.content}</p>
                  </div>
                );
              }
              if (s.type === 'warning' || s.type === 'common-mistake') {
                return (
                  <div key={i} className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-sm">{s.content}</p>
                  </div>
                );
              }
              return <p key={i} className="text-gray-300 leading-relaxed whitespace-pre-wrap">{s.content}</p>;
            })}
          </div>

          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">Key Takeaways</h3>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {lesson.keyTakeaways.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Prev / Next / Complete */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            {prev ? (
              <button onClick={() => router.push(`/lesson/${prev.id}`)}
                className="w-full flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Previous</div>
                  <div className="font-medium">{prev.title}</div>
                </div>
              </button>
            ) : (
              <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="font-medium">First Lesson</div>
                </div>
              </button>
            )}
          </div>

          <div className="flex-1">
            {isLast ? (
              <Link href={courseId ? `/course/${courseId}?lang=${lesson.language}` : '/languages'}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all">
                <Trophy className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-xs opacity-80">Course Complete!</div>
                  <div className="font-medium">Finish Course</div>
                </div>
              </Link>
            ) : isCompleted ? (
              <button onClick={() => router.push(`/lesson/${next!.id}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                <ChevronRight className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-xs opacity-80">Next</div>
                  <div className="font-medium">{next!.title}</div>
                </div>
              </button>
            ) : (
              <button onClick={markComplete}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                <CheckCircle className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-xs opacity-80">Complete & Next</div>
                  <div className="font-medium">{next!.title}</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
