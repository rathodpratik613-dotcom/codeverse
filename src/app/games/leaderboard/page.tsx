'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Code2, Swords, Loader2, Trophy } from 'lucide-react';

interface Entry {
  username: string;
  score: number;
  correct: number;
  total: number;
  playedAt: string;
}

const PERIODS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'all', label: 'All Time' },
] as const;

function Leaderboard() {
  const searchParams = useSearchParams();
  const game = searchParams.get('game') || 'quiz-battle';
  const language = searchParams.get('language') || '';
  const [period, setPeriod] = useState<string>('all');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ game, period });
    if (language) params.set('language', language);
    fetch(`/api/games/score?${params}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setEntries(d.leaderboard || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [game, language, period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href={`/games/quiz-battle${language ? `?lang=${language}` : ''}`} className="text-purple-400 hover:text-purple-300 text-sm">Play Quiz Battle</Link>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Leaderboard{language ? ` — ${language}` : ''}</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <Swords className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No scores yet. Be the first!</p>
            <Link href={`/games/quiz-battle${language ? `?lang=${language}` : ''}`}
              className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold">
              Play Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${
                i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'
              }`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-300'
                }`}>{i + 1}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{e.username}</div>
                  <div className="text-gray-400 text-sm">{e.correct}/{e.total} correct</div>
                </div>
                <span className="text-purple-300 font-bold">{e.score} pts</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>}>
      <Leaderboard />
    </Suspense>
  );
}
