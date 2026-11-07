'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth-context';

interface ProgressRecord {
  contentId: string;
  contentType: string;
  status: string;
}

const STORAGE_KEY = 'completed_lessons';

function readLocalCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Per-user lesson completion state.
 * - Authenticated users: synced to /api/progress (survives refresh + re-login)
 * - Guests: falls back to localStorage
 */
export function useLessonProgress(languageSlug: string | undefined, lessonIds: string[]) {
  const { isAuthenticated } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const merged = readLocalCompleted();

      if (isAuthenticated) {
        try {
          const res = await fetch(
            `/api/progress${languageSlug ? `?language=${encodeURIComponent(languageSlug)}` : ''}`,
            { credentials: 'include' }
          );
          if (res.ok) {
            const { progress } = await res.json();
            for (const p of (progress || []) as ProgressRecord[]) {
              if (p.contentType === 'lesson' && p.status === 'completed') {
                merged.add(p.contentId);
              }
            }
          }
        } catch {
          // Network failure — local progress still applies
        }
      }

      if (!cancelled) {
        setCompletedIds(merged);
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, languageSlug]);

  const markComplete = useCallback(
    async (lessonId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(lessonId);
        return next;
      });

      const stored = readLocalCompleted();
      stored.add(lessonId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored]));

      if (isAuthenticated) {
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              contentId: lessonId,
              contentType: 'lesson',
              languageSlug: languageSlug || '',
              status: 'completed',
            }),
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    },
    [isAuthenticated, languageSlug]
  );

  const stats = useMemo(() => {
    const completedInScope = lessonIds.filter((id) => completedIds.has(id)).length;
    return {
      completedIds,
      completedCount: completedInScope,
      totalCount: lessonIds.length,
      percent: lessonIds.length ? Math.round((completedInScope / lessonIds.length) * 100) : 0,
      isLoading,
      markComplete,
    };
  }, [completedIds, lessonIds, isLoading, markComplete]);

  return stats;
}
