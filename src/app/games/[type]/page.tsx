'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Code2, Zap, Heart, Trophy, Loader2, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { languages } from '@/data/languages';
import { useAuth } from '@/lib/auth-context';

const GAME_TYPES = ['code-puzzle', 'bug-hunter', 'match-pairs', 'fill-blank'] as const;
type GameType = typeof GAME_TYPES[number];

const META: Record<GameType, { name: string; desc: string }> = {
  'code-puzzle': { name: 'Code Puzzle', desc: 'Arrange the code lines in the correct order' },
  'bug-hunter': { name: 'Bug Hunter', desc: 'Find the line that fixes the bug' },
  'match-pairs': { name: 'Match Pairs', desc: 'Match each question to its answer' },
  'fill-blank': { name: 'Fill in the Blank', desc: 'Complete the missing keyword' },
};

const QUESTIONS_PER_ROUND = 10;
const MAX_LIVES = 3;

interface Item {
  id: string;
  difficulty?: string;
  // code-puzzle
  lines?: string[]; answer?: string[];
  // bug-hunter
  code?: string | null; buggyLine?: number; options?: string[];
  // match-pairs
  pairs?: { left: string; right: string }[]; distractors?: string[];
  // fill-blank
  prompt?: string; answerText?: string;
  explanation?: string;
  lesson?: string;
}

function Game() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (params.type as GameType) || 'code-puzzle';
  const lang = searchParams.get('lang') || 'python';
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<'loading' | 'playing' | 'results'>('loading');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [picked, setPicked] = useState<string[] | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [pairsDone, setPairsDone] = useState<Set<string>>(new Set());
  const [roundCorrect, setRoundCorrect] = useState<boolean[]>([]);
  const [roundExplanations, setRoundExplanations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const langName = languages.find((l) => l.id === lang)?.name || lang;
  const meta = META[type] || META['code-puzzle'];
  const item = items[idx];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/games/items?game=${type}&language=${encodeURIComponent(lang)}`);
        const data = await res.json();
        const pool = (data.items || []) as Item[];
        const round = [...pool].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
        if (!cancelled) {
          setItems(round);
          setPhase(round.length ? 'playing' : 'results');
        }
      } catch {
        if (!cancelled) setPhase('results');
      }
    })();
    return () => { cancelled = true; };
  }, [type, lang]);

  const advance = (correct: boolean) => {
    setRoundCorrect((r) => [...r, correct]);
    if (!correct) setLives((l) => l - 1);
    const newCombo = correct ? combo + 1 : 0;
    setCombo(newCombo);
    if (correct) setScore((s) => s + 100 + Math.min(newCombo, 5) * 25);
    if (lives - (correct ? 0 : 1) <= 0 || idx + 1 >= items.length) {
      setPhase('results');
    } else {
      setIdx((i) => i + 1);
      setPicked(null); setOrder([]); setPairsDone(new Set());
    }
  };

  const checkCurrent = () => {
    if (!item || phase !== 'playing') return;
    if (type === 'code-puzzle') {
      const expected = (item.answer || []);
      const got = order.map((i) => (item.lines || [])[i]);
      advance(JSON.stringify(got) === JSON.stringify(expected));
    } else if (type === 'match-pairs') {
      const all = (item.pairs || []).length;
      advance(pairsDone.size === all);
    } else {
      // bug-hunter / fill-blank handled at pick time
    }
  };

  const pickOption = (opt: string) => {
    if (!item || picked !== null) return;
    setPicked([opt]);
    const correct = type === 'bug-hunter' ? opt === (item as any).answer : opt === (item as any).answer;
    setTimeout(() => advance(correct), 600);
  };

  // match-pairs interaction
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const tryMatch = (side: 'l' | 'r', val: string) => {
    if (side === 'l') setSelLeft(val); else setSelRight(val);
    const l = side === 'l' ? val : selLeft;
    const r2 = side === 'r' ? val : selRight;
    if (l && r2) {
      const pair = (item?.pairs || []).find((p) => p.left === l);
      if (pair && pair.right === r2) {
        setPairsDone((s) => new Set(s).add(l));
      }
      setSelLeft(null); setSelRight(null);
    }
  };

  // save score on results
  useEffect(() => {
    if (phase !== 'results' || savedRef.current || roundCorrect.length === 0 || !isAuthenticated) return;
    savedRef.current = true;
    setSaving(true);
    (async () => {
      try {
        const res = await fetch('/api/games/score', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ game: type, language: lang, score, correct: roundCorrect.filter(Boolean).length, total: roundCorrect.length }),
        });
        const data = await res.json();
        if (data.id) {
          await fetch('/api/xp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ amount: Math.max(10, Math.floor(score / 10)), sourceType: 'quiz', sourceId: `game-${type}-${data.id}`, description: `${meta.name} (${langName})` }),
          });
        }
      } catch { /* best effort */ }
      setSaving(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isAuthenticated]);

  const correctCount = roundCorrect.filter(Boolean).length;
  const totalCount = roundCorrect.length;

  const reset = () => {
    savedRef.current = false; setScore(0); setCombo(0); setLives(MAX_LIVES);
    setIdx(0); setPicked(null); setOrder([]); setPairsDone(new Set()); setRoundCorrect([]); setPhase('loading');
    fetch(`/api/games/items?game=${type}&language=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((d) => {
        const pool = (d.items || []) as Item[];
        setItems([...pool].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND));
        setPhase('playing');
      });
  };

  const langSelect = (
    <select value={lang} onChange={(e) => router.push(`/games/${type}?lang=${e.target.value}`)} aria-label="Choose language"
      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500">
      {languages.map((l) => <option key={l.id} value={l.id} className="bg-[#1a1f3a]">{l.name}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <div className="flex items-center gap-3">{langSelect}
          <Link href="/games" className="text-gray-300 hover:text-white text-sm">All Games</Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{meta.name} — {langName}</h1>
            <p className="text-gray-400 text-sm">{meta.desc}</p>
          </div>
          {phase === 'playing' && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-400"><Zap className="w-4 h-4" />{score}</span>
              <span className="flex items-center gap-1 text-red-400">{Array.from({ length: lives }).map((_, i) => <Heart key={i} className="w-4 h-4 fill-current" />)}</span>
              {combo > 1 && <span className="text-purple-400">x{combo} combo</span>}
            </div>
          )}
        </div>

        {phase === 'loading' && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>}

        {phase === 'playing' && item && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-sm text-gray-400 mb-4">Round {Math.min(idx + 1, items.length)} of {items.length}</div>

            {type === 'code-puzzle' && (
              <>
                <p className="text-white font-medium mb-4">Click the lines in the correct order:</p>
                <div className="space-y-2 mb-4">
                  {order.map((li, pos) => (
                    <button key={pos} onClick={() => setOrder(order.filter((_, j) => j !== pos))}
                      className="w-full text-left px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-green-200 font-mono text-sm">
                      {pos + 1}. {(item.lines || [])[li]}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  {(item.lines || []).map((line, li) =>
                    order.includes(li) ? null : (
                      <button key={li} onClick={() => setOrder([...order, li])}
                        className="w-full text-left px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 font-mono text-sm hover:bg-white/10 hover:border-purple-500/50">
                        {(item.lines || []).indexOf(line) === li ? '' : ''}{line}
                      </button>
                    )
                  )}
                </div>
                <button onClick={checkCurrent} disabled={order.length !== (item.lines || []).length}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold disabled:opacity-40 flex items-center gap-2">
                  Check Order <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {type === 'bug-hunter' && (
              <>
                <p className="text-white font-medium mb-2">This code has a bug. Pick the line that fixes it:</p>
                {item.buggyLine && <p className="text-sm text-yellow-400 mb-3">Bug is on line {item.buggyLine}</p>}
                <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-green-300 overflow-x-auto mb-4 font-mono whitespace-pre-wrap">{item.code}</pre>
                <div className="grid gap-2">
                  {(item.options || []).map((opt) => (
                    <button key={opt} onClick={() => pickOption(opt)} disabled={picked !== null}
                      className={`text-left px-4 py-3 rounded-xl border font-mono text-sm transition-all ${
                        picked ? (opt === (item as any).answer ? 'bg-green-500/20 border-green-500 text-green-200' : opt === picked[0] ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-white/5 border-white/10 text-gray-400')
                        : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-purple-500/50'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {type === 'fill-blank' && (
              <>
                <p className="text-white font-medium mb-2">{item.prompt}</p>
                {item.code && <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-green-300 overflow-x-auto mb-4 font-mono whitespace-pre-wrap">{item.code}</pre>}
                <div className="grid gap-2">
                  {(item.options || []).map((opt) => (
                    <button key={opt} onClick={() => pickOption(opt)} disabled={picked !== null}
                      className={`text-left px-4 py-3 rounded-xl border font-mono text-sm transition-all ${
                        picked ? (opt === (item as any).answer ? 'bg-green-500/20 border-green-500 text-green-200' : opt === picked[0] ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-white/5 border-white/10 text-gray-400')
                        : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-purple-500/50'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {type === 'match-pairs' && (
              <>
                <p className="text-white font-medium mb-4">Match each question to its correct answer ({pairsDone.size}/{(item.pairs || []).length}):</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {(item.pairs || []).map((p) => (
                      <button key={p.left} onClick={() => tryMatch('l', p.left)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                          pairsDone.has(p.left) ? 'bg-green-500/20 border-green-500/50 text-green-300 line-through' : selLeft === p.left ? 'bg-purple-500/30 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                        }`}>
                        {p.left}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const rights = [...(item.pairs || []).map((p) => p.right), ...(item.distractors || [])];
                      return [...rights].sort(() => Math.random() - 0.5).map((right) => {
                        const matched = (item.pairs || []).some((p) => p.right === right && pairsDone.has(p.left));
                        const isSel = [...(item.pairs || [])].some((p) => p.right === right && p.left === selLeft);
                        return (
                          <button key={right} onClick={() => tryMatch('r', right)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                              matched ? 'bg-green-500/20 border-green-500/50 text-green-300 line-through' : isSel ? 'bg-purple-500/30 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                            }`}>
                            {right}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
                <button onClick={checkCurrent} disabled={pairsDone.size !== (item.pairs || []).length}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold disabled:opacity-40 flex items-center gap-2">
                  Check Matches <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {phase === 'results' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 text-center">
              <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">{correctCount}/{totalCount} Correct</h2>
              <p className="text-2xl text-purple-300 font-bold mb-1">{score} points</p>
              <p className="text-gray-400 text-sm">{isAuthenticated ? (saving ? 'Saving score…' : 'Score saved') : 'Log in to save your score'}</p>
              <div className="flex gap-4 justify-center mt-6">
                <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <Link href={`/games/leaderboard?game=${type}&language=${lang}`} className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20">Leaderboard</Link>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => {
                const ok = roundCorrect[i];
                return (
                  <div key={it.id || i} className={`p-3 rounded-xl border text-sm flex items-start gap-2 ${ok ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    {ok ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                    <span className="text-gray-300">{it.explanation || it.prompt || it.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>}>
      <Game />
    </Suspense>
  );
}
