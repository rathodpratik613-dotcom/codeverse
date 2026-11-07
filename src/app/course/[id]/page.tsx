'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Play, CheckCircle, ArrowRight, Trophy, BookOpen } from 'lucide-react';
import { pythonCourse, javascriptCourse } from '@/data/courses';
import { languages } from '@/data/languages';
import { useLessonProgress } from '@/lib/use-lesson-progress';
import type { Course } from '@/types';

export default function CoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    }>
      <CourseContent />
    </Suspense>
  );
}

function CourseContent() {
  const params = useParams();
  const courseId = params.id as string;

  const courses: Record<string, Course> = { 'python-basics': pythonCourse, 'javascript-basics': javascriptCourse };
  const course = courses[courseId];

  const lessonIds = course
    ? course.modules.flatMap((m) => m.lessons.map((l) => l.id))
    : [];
  const progress = useLessonProgress(course?.languageId, lessonIds);

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
          <Link href="/languages" className="text-purple-400 hover:text-purple-300">
            Browse Languages
          </Link>
        </div>
      </div>
    );
  }

  const language = languages.find(l => l.id === course.languageId);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstIncomplete = allLessons.find((l) => !progress.completedIds.has(l.id));
  const continueLesson = firstIncomplete || allLessons[0];
  const courseComplete = progress.totalCount > 0 && progress.completedCount === progress.totalCount;

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

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/languages" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Languages
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{language?.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-400">{course.description}</p>
            </div>
          </div>

          {/* Progress summary + resume */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Your progress</span>
                <span>{progress.completedCount}/{progress.totalCount} lessons · {progress.percent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            {continueLesson && (
              <Link
                href={`/lesson/${continueLesson.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                {progress.completedCount > 0 && !courseComplete ? 'Continue' : 'Start'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Certificate */}
        {courseComplete && (
          <div className="mb-8 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-xl p-6 flex items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-amber-300">Course Complete!</h2>
              <p className="text-gray-300">
                Congratulations — you finished every lesson in {course.title}. Your certificate is on your profile.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {course.modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold">{moduleIndex + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{module.title}</h2>
                </div>

                <div className="space-y-3">
                  {module.lessons.map((lesson) => {
                    const orderNumber = lessonIds.indexOf(lesson.id) + 1;
                    const done = progress.completedIds.has(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              done ? 'bg-green-500/20' : 'bg-purple-500/20'
                            }`}>
                              {done ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <span className="text-purple-400 text-sm font-bold">{orderNumber}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  lesson.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                  lesson.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {lesson.difficulty}
                                </span>
                                <span className="text-gray-500 text-sm">{lesson.exercises.length} exercises</span>
                              </div>
                            </div>
                          </div>
                          <Play className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Course Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Completion</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Lessons Completed</span>
                  <span className="text-white font-medium">{progress.completedCount}/{progress.totalCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Modules</span>
                  <span className="text-white font-medium">{course.modules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Lessons</span>
                  <span className="text-white font-medium">{progress.totalCount}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Course Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language</span>
                    <span className="text-white">{language?.name || course.languageId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
