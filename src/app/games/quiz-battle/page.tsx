'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Code2, Timer, Heart, Zap, Trophy, Loader2, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react';
import { languages } from '@/data/languages';
import { useAuth } from '@/lib/auth-context';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface RoundResult {
  question: Question;
  picked: string | null;
  correct: boolean;
  timedOut: boolean;
}

const QUESTION_TIME = 20;
const MAX_QUESTIONS = 10;
const MAX_LIVES = 3;

function QuizBattle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const lang = searchParams.get('lang') || 'python';

  const [phase, setPhase] = useState<'loading' | 'playing' | 'results'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [sound, setSound] = useState(true);
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const langName = languages.find((l) => l.id === lang)?.name || lang;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/content?type=quiz&language=${encodeURIComponent(lang)}`);
        const data = await res.json();
        const pool: Question[] = [];
        for (const quiz of data.items || []) {
          for (const q of quiz.questions || []) {
            if (q.type === 'mcq' && Array.isArray(q.options) && q.correctAnswer) {
              pool.push(q);
            }
          }
        }
        // Deterministic-ish shuffle per session
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, MAX_QUESTIONS);
        if (!cancelled) {
          setQuestions(shuffled);
          setPhase(shuffled.length ? 'playing' : 'results');
        }
      } catch {
        if (!cancelled) setPhase('results');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lang]);

  const current = questions[qIndex];

  const beep = (freq: number, dur = 0.08) => {
    if (!sound) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch { /* audio unavailable */ }
  };

  const finishQuestion = (picked: string | null, timedOut = false) => {
    if (!current || phase !== 'playing') return;
    const correct = picked === current.correctAnswer;
    const newCombo = correct ? combo + 1 : 0;
    const gained = correct ? 100 + Math.min(newCombo, 5) * 25 + Math.floor(timeLeft) * 2 : 0;
    setScore((s) => s + gained);
    setCombo(newCombo);
    if (!correct) setLives((l) => l - 1);
    setResults((r) => [...r, { question: current, picked, correct, timedOut }]);
    beep(correct ? 880 : 220);

    if (lives - (correct ? 0 : 1) <= 0 || qIndex + 1 >= questions.length) {
      setPhase('results');
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setTimeLeft(QUESTION_TIME);
    }
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishQuestion(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, selected, questions.length, lives, combo, timeLeft]);

  const correctCount = results.filter((r) => r.correct).length;
  const totalCount = results.length;

  // Save score once when results appear
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'results' || savedRef.current || totalCount === 0 || !isAuthenticated) return;
    savedRef.current = true;
    setSaving(true);
    (async () => {
      try {
        const res = await fetch('/api/games/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            game: 'quiz-battle', language: lang, score, correct: correctCount, total: totalCount,
          }),
        });
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
        if (data.newBadges?.length) setEarnedBadges(data.newBadges);
        if (data.id) {
          await fetch('/api/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              amount: Math.max(10, Math.floor(score / 10)),
              sourceType: 'quiz',
              sourceId: `quizbattle-${data.id}`,
              description: `Quiz Battle (${langName})`,
            }),
          });
        }
      } catch { /* score saving is best-effort */ }
      setSaving(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isAuthenticated]);

  const playAgain = () => {
    savedRef.current = false;
    setScore(0); setCombo(0); setLives(MAX_LIVES); setQIndex(0);
    setSelected(null); setResults([]); setTimeLeft(QUESTION_TIME);
    setPhase('loading');
    fetch(`/api/content?type=quiz&language=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((data) => {
        const pool: Question[] = [];
        for (const quiz of data.items || []) {
          for (const q of quiz.questions || []) {
            if (q.type === 'mcq' && Array.isArray(q.options) && q.correctAnswer) pool.push(q);
          }
        }
        setQuestions([...pool].sort(() => Math.random() - 0.5).slice(0, MAX_QUESTIONS));
        setPhase('playing');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <div className="flex items-center gap-4">
          <select value={lang} onChange={(e) => router.push(`/games/quiz-battle?lang=${e.target.value}`)}
            aria-label="Choose language"
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
            {languages.map((l) => <option key={l.id} value={l.id} className="bg-[#1a1f3a]">{l.name}</option>)}
          </select>
          <button onClick={() => setSound(!sound)} aria-label="Toggle sound" className="text-gray-300 hover:text-white">
            {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Quiz Battle — {langName}</h1>
          {phase === 'playing' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-400"><Zap className="w-4 h-4" />{score}</span>
              <span className="flex items-center gap-1 text-red-400">{Array.from({ length: lives }).map((_, i) => <Heart key={i} className="w-4 h-4 fill-current" />)}</span>
              <span className="text-gray-400">{combo > 1 && <span className="text-purple-400">x{combo} combo</span>}</span>
            </div>
          )}
        </div>

        {phase === 'loading' && (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>
        )}

        {phase === 'playing' && current && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-400">Question {qIndex + 1} of {questions.length}</span>
              <span className={`flex items-center gap-1 font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-cyan-400'}`}>
                <Timer className="w-4 h-4" />{timeLeft}s
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-6">
              <div className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }} />
            </div>
            <h2 className="text-xl text-white font-semibold mb-6">{current.question}</h2>
            <div className="grid gap-3">
              {current.options.map((opt) => (
                <button key={opt} onClick={() => { setSelected(opt); finishQuestion(opt); }}
                  className={`text-left px-5 py-4 rounded-xl border transition-all ${
                    selected === opt
                      ? opt === current.correctAnswer ? 'bg-green-500/20 border-green-500 text-green-200' : 'bg-red-500/20 border-red-500 text-red-200'
                      : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-purple-500/50'
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 text-center">
              <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">{correctCount}/{totalCount} Correct</h2>
              <p className="text-2xl text-purple-300 font-bold mb-1">{score} points</p>
              <p className="text-gray-400 text-sm">
                {isAuthenticated ? (saving ? 'Saving score…' : 'Score saved to leaderboard') : 'Log in to save your score'}
              </p>
              {streak !== null && <p className="text-orange-400 text-sm mt-1">🔥 {streak}-day streak</p>}
              {earnedBadges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {earnedBadges.map((b) => (
                    <span key={b} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full text-xs font-medium">🏅 {b.replace(/-/g, ' ')}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-4 justify-center mt-6">
                <button onClick={playAgain} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  Play Again
                </button>
                <Link href={`/games/leaderboard?game=quiz-battle&language=${lang}`}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">
                  Leaderboard
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border ${r.correct ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-start gap-3">
                    {r.correct ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-white font-medium">{r.question.question}</p>
                      {!r.correct && (
                        <p className="text-sm text-gray-400 mt-1">
                          {r.timedOut ? 'Time ran out. ' : `You picked: ${r.picked}. `}
                          Correct: <span className="text-green-400">{r.question.correctAnswer}</span>
                        </p>
                      )}
                      {r.question.explanation && <p className="text-sm text-gray-400 mt-1">{r.question.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function QuizBattlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>}>
      <QuizBattle />
    </Suspense>
  );
}
