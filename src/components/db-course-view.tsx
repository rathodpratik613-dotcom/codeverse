'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ChevronRight, BookOpen, Loader2, Trophy, Award } from 'lucide-react';
import { useLessonProgress } from '@/lib/use-lesson-progress';

interface LessonItem {
  id: string;
  title: string;
  filePath: string;
}

interface CourseItem {
  id: string;
  title: string;
  description?: string;
  level?: string;
  language?: string;
  filePath?: string;
}

export default function DbCourseView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang') || '';
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let url = `/api/content?type=course&id=${encodeURIComponent(courseId)}`;
        if (langParam) url += `&language=${encodeURIComponent(langParam)}`;
        const res = await fetch(url);
        const data = await res.json();
        const found = (data.items || [])[0] as CourseItem | undefined;
        if (!found) {
          if (!cancelled) { setError('Course not found'); setLoading(false); }
          return;
        }
        if (!cancelled) setCourse(found);
        const lang = found.language;
        const dir = String(found.filePath || '').match(/courses\/([^/]+)/)?.[1] || '';
        const all = await fetch(`/api/content?type=lesson&language=${lang}`);
        const allData = await all.json();
        const scoped = (allData.items || []).filter((l: any) =>
          !dir || String(l.filePath || '').includes(`/courses/${dir}/`)
        );
        if (!cancelled) setLessons(scoped as LessonItem[]);
      } catch {
        if (!cancelled) setError('Failed to load course');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId, langParam]);

  const courseDir = useMemo(
    () => String(course?.filePath || '').match(/courses\/([^/]+)/)?.[1] || '',
    [course]
  );
  const pid = (id: string) => `${courseDir}/${id}`;
  const lessonIds = useMemo(() => lessons.map((l) => pid(l.id)), [lessons, courseDir]);
  const progress = useLessonProgress(course?.language, lessonIds);
  const { completedIds } = progress;

  const groups = useMemo(() => {
    const map = new Map<string, LessonItem[]>();
    for (const l of lessons) {
      const m = String(l.filePath || '').match(/modules\/([^/]+)/)?.[1] || 'lessons';
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(l);
    }
    return [...map.entries()];
  }, [lessons]);

  const firstIncomplete = lessons.find((l) => !completedIds.has(pid(l.id)));
  const continueId = firstIncomplete?.id || lessons[0]?.id;
  const completed = progress.completedCount;
  const total = progress.totalCount;
  const pct = progress.percent;
  const finished = total > 0 && completed >= total;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Course not found'}</h1>
          <Link href="/languages" className="text-purple-400 hover:text-purple-300">Browse Languages</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {finished && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 rounded-xl flex items-center gap-4">
            <Award className="w-10 h-10 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-yellow-300">Course Complete!</h2>
              <p className="text-gray-300 text-sm">You finished all {total} lessons. Certificate earned.</p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              {course.description && <p className="text-gray-400 mb-3">{course.description}</p>}
              <div className="flex gap-3 text-sm">
                {course.level && <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full capitalize">{course.level}</span>}
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">{course.language}</span>
              </div>
            </div>
            {continueId && (
              <button onClick={() => router.push(`/lesson/${continueId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                <BookOpen className="w-5 h-5" />
                {completed > 0 ? 'Continue' : 'Start Course'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{completed} of {total} lessons</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {groups.map(([moduleDir, items]) => (
          <div key={moduleDir} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-3 capitalize">
              {moduleDir.replace(/\d+-module-/, 'Module ').replace(/-/g, ' ')}
            </h2>
            <div className="space-y-2">
              {items.map((l, i) => {
                const done = completedIds.has(pid(l.id));
                return (
                  <button key={l.id} onClick={() => router.push(`/lesson/${l.id}`)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                      done
                        ? 'bg-green-500/10 border-green-500/30 text-green-200 hover:bg-green-500/20'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}>
                    {done
                      ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                      : <span className="w-5 h-5 rounded-full border-2 border-gray-500 shrink-0" />}
                    <span className="flex-1 font-medium">{l.title}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {lessons.length === 0 && !loading && (
          <p className="text-gray-400 text-center py-8">No lessons found for this course yet.</p>
        )}
      </main>
    </div>
  );
}
