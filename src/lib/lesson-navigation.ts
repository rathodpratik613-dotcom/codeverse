import { Course, Module, Lesson } from '@/types';

export interface LessonNavigation {
  currentLesson: Lesson;
  currentModule: Module;
  currentCourse: Course;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  lessonIndex: number;
  totalLessons: number;
  moduleIndex: number;
  totalModules: number;
  courseIndex: number;
  totalCourses: number;
  courseLessonIds: string[];
}

export function getLessonNavigation(
  courses: Record<string, Course>,
  lessonId: string
): LessonNavigation | null {
  // Find the current lesson
  let currentLesson: Lesson | null = null;
  let currentModule: Module | null = null;
  let currentCourse: Course | null = null;

  for (const course of Object.values(courses)) {
    for (const module of course.modules) {
      const found = module.lessons.find(l => l.id === lessonId);
      if (found) {
        currentLesson = found;
        currentModule = module;
        currentCourse = course;
        break;
      }
    }
    if (currentLesson) break;
  }

  if (!currentLesson || !currentModule || !currentCourse) {
    return null;
  }

  // Get all lessons in the CURRENT course, in order.
  // Navigation must never leak into a different course — the last lesson of
  // a course shows "Finish Course" instead of jumping to another language.
  const allLessons: Array<{
    lesson: Lesson;
    module: Module;
    course: Course;
    moduleIndex: number;
    lessonIndex: number;
    courseIndex: number;
  }> = [];

  const courseKeys = Object.keys(courses);
  const courseIndex = Math.max(0, courseKeys.indexOf(currentCourse.id));

  let moduleIndex = 0;
  for (const module of currentCourse.modules) {
    let lessonIndex = 0;
    for (const lesson of module.lessons) {
      allLessons.push({
        lesson,
        module,
        course: currentCourse,
        moduleIndex,
        lessonIndex,
        courseIndex,
      });
      lessonIndex++;
    }
    moduleIndex++;
  }

  // Find current lesson index in all lessons
  const currentIndex = allLessons.findIndex(
    (item) => item.lesson.id === lessonId
  );

  if (currentIndex === -1) {
    return null;
  }

  const previousItem = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextItem = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const currentItem = allLessons[currentIndex];
  const totalLessons = allLessons.length;

  return {
    currentLesson: currentItem.lesson,
    currentModule: currentItem.module,
    currentCourse: currentItem.course,
    previousLesson: previousItem?.lesson || null,
    nextLesson: nextItem?.lesson || null,
    isFirstLesson: currentIndex === 0,
    isLastLesson: currentIndex === totalLessons - 1,
    lessonIndex: currentItem.lessonIndex,
    totalLessons,
    moduleIndex: currentItem.moduleIndex,
    totalModules: currentItem.course.modules.length,
    courseIndex,
    totalCourses: courseKeys.length,
    courseLessonIds: allLessons.map((item) => item.lesson.id),
  };
}

export function getLessonProgress(
  completedLessons: string[],
  lessonId: string
): { isCompleted: boolean; isLocked: boolean } {
  const isCompleted = completedLessons.includes(lessonId);
  const isLocked = !isCompleted; // Simplified - in production, check prerequisites
  return { isCompleted, isLocked };
}
