'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Lock, CheckCircle, Trophy, AlertCircle } from 'lucide-react';
import { LessonNavigation } from '@/lib/lesson-navigation';
import { useAuth } from '@/lib/auth-context';

interface LessonNavigationProps {
  navigation: LessonNavigation;
  completedIds: Set<string>;
  onMarkComplete: (lessonId: string) => void | Promise<void>;
  onLessonComplete?: (lessonId: string) => void;
}

export default function LessonNavigationComponent({
  navigation,
  completedIds,
  onMarkComplete,
  onLessonComplete,
}: LessonNavigationProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const {
    currentLesson,
    previousLesson,
    nextLesson,
    isFirstLesson,
    isLastLesson,
    lessonIndex,
    totalLessons,
    moduleIndex,
    totalModules,
    courseIndex,
    totalCourses,
    courseLessonIds,
  } = navigation;

  const isCompleted = completedIds.has(currentLesson.id);
  const completedInCourse = courseLessonIds.filter((id) => completedIds.has(id)).length;
  const courseProgressPercent = courseLessonIds.length
    ? Math.round((completedInCourse / courseLessonIds.length) * 100)
    : 0;

  // Next lesson is locked until the current one is completed
  const isNextLocked = !isCompleted && nextLesson !== null;

  const handleCompleteAndNext = async () => {
    if (!user || isCompleting) return;

    setIsCompleting(true);

    try {
      // Persist completion server-side (or localStorage for guests)
      await onMarkComplete(currentLesson.id);

      // Award XP (server-side idempotent via /api/xp)
      const xpAwarded = localStorage.getItem(`xp_awarded_${currentLesson.id}`);
      const lessonXP = currentLesson.exercises?.[0]?.xpReward || 10;
      if (!xpAwarded) {
        await fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: lessonXP,
            sourceType: 'lesson',
            sourceId: currentLesson.id,
            description: `Completed lesson: ${currentLesson.title}`,
          }),
        });
        await fetch('/api/xp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: 5,
            sourceType: 'lesson',
            sourceId: currentLesson.id,
            description: `Coins for lesson: ${currentLesson.title}`,
          }),
        });
        localStorage.setItem(`xp_awarded_${currentLesson.id}`, 'true');
      }

      // Show success toast
      setToastMessage(`Lesson completed! +${lessonXP} XP`);
      setShowToast(true);

      // Call callback if provided
      onLessonComplete?.(currentLesson.id);

      // Navigate to next lesson after short delay
      setTimeout(() => {
        if (nextLesson) {
          router.push(`/lesson/${nextLesson.id}`);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      setToastMessage('Failed to complete lesson. Please try again.');
      setShowToast(true);
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePrevious = () => {
    if (previousLesson) {
      router.push(`/lesson/${previousLesson.id}`);
    }
  };

  const handleNext = () => {
    if (nextLesson && !isNextLocked) {
      router.push(`/lesson/${nextLesson.id}`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in editor or input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.closest('.monaco-editor'))
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && previousLesson) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && nextLesson && !isNextLocked) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousLesson, nextLesson, isNextLocked]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const progressText = `Lesson ${lessonIndex + 1} of ${totalLessons}`;
  const moduleText = `Module ${moduleIndex + 1} of ${totalModules}`;
  const courseText = `Course ${courseIndex + 1} of ${totalCourses}`;

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="mt-8 border-t border-white/10 pt-6">
        {/* Course Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{completedInCourse} of {courseLessonIds.length} lessons completed</span>
            <span>{courseProgressPercent}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${courseProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
          <span>{progressText}</span>
          <span>{moduleText}</span>
          <span>{courseText}</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Previous Button */}
          <div className="flex-1">
            {isFirstLesson ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
                aria-label="Previous lesson (disabled - first lesson)"
              >
                <ChevronLeft className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="font-medium">First Lesson</div>
                </div>
              </button>
            ) : previousLesson ? (
              <button
                onClick={handlePrevious}
                className="w-full flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                aria-label={`Go to previous lesson: ${previousLesson.title}`}
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Previous</div>
                  <div className="font-medium group-hover:text-purple-400 transition-colors">
                    {previousLesson.title}
                  </div>
                </div>
              </button>
            ) : null}
          </div>

          {/* Complete & Next Button */}
          <div className="flex-1">
            {isLastLesson ? (
              <Link
                href={`/course/${navigation.currentCourse.id}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                aria-label="Finish course"
              >
                <Trophy className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-xs opacity-80">Course Complete!</div>
                  <div className="font-medium">Finish Course</div>
                </div>
              </Link>
            ) : nextLesson ? (
              <div className="relative group">
                <button
                  onClick={isCompleted ? handleNext : handleCompleteAndNext}
                  disabled={isNextLocked && !isCompleted}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                      : isNextLocked
                      ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  }`}
                  aria-label={
                    isCompleted
                      ? `Go to next lesson: ${nextLesson.title}`
                      : isNextLocked
                      ? `Complete lesson to unlock next: ${nextLesson.title}`
                      : `Complete lesson and go to next: ${nextLesson.title}`
                  }
                >
                  {isNextLocked && !isCompleted ? (
                    <Lock className="w-5 h-5" />
                  ) : isCompleted ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <div className="text-center">
                    <div className="text-xs opacity-80">
                      {isCompleted ? 'Next' : isNextLocked ? 'Locked' : 'Complete & Next'}
                    </div>
                    <div className="font-medium">
                      {nextLesson.title}
                    </div>
                  </div>
                </button>

                {/* Tooltip for locked state */}
                {isNextLocked && !isCompleted && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Complete this lesson to continue
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <span className="hidden sm:inline">
            Tip: Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">←</kbd> and{' '}
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">→</kbd> arrow keys to navigate
          </span>
        </div>
      </div>
    </>
  );
}
