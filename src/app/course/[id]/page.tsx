'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Lock, CheckCircle, Play } from 'lucide-react';
import { pythonCourse, javascriptCourse } from '@/data/courses';
import { languages } from '@/data/languages';

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

  const courses = { 'python-basics': pythonCourse, 'javascript-basics': javascriptCourse };
  const course = courses[courseId as keyof typeof courses];

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
        </div>

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
                  {module.lessons.map((lesson, lessonIndex) => (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 text-sm font-bold">{lessonIndex + 1}</span>
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
                  ))}
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
                  <span>0%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Lessons Completed</span>
                  <span className="text-white font-medium">0/8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">XP Earned</span>
                  <span className="text-purple-400 font-medium">0 XP</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time Spent</span>
                  <span className="text-white font-medium">0h 0m</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-medium mb-3">Course Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modules</span>
                    <span className="text-white">{course.modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Lessons</span>
                    <span className="text-white">
                      {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                    </span>
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
