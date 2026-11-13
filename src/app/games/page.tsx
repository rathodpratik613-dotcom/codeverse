'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, Swords, Bug, Puzzle, GitCompare, Search, Trophy, Calendar } from 'lucide-react';
import { languages } from '@/data/languages';

const GAMES = [
  { id: 'quiz-battle', name: 'Quiz Battle', desc: 'Timed multiple-choice questions with combos and lives', icon: Swords, href: (l: string) => `/games/quiz-battle?lang=${l}`, live: true },
  { id: 'code-puzzle', name: 'Code Puzzle', desc: 'Arrange code lines in the right order', icon: Puzzle, href: (l: string) => `/games/code-puzzle?lang=${l}`, live: true },
  { id: 'bug-hunter', name: 'Bug Hunter', desc: 'Find and fix the buggy line in a snippet', icon: Bug, href: (l: string) => `/games/bug-hunter?lang=${l}`, live: true },
  { id: 'match-pairs', name: 'Match Pairs', desc: 'Match questions to their correct answers', icon: GitCompare, href: (l: string) => `/games/match-pairs?lang=${l}`, live: true },
  { id: 'fill-blank', name: 'Fill in the Blank', desc: 'Complete the missing keyword in code', icon: Search, href: (l: string) => `/games/fill-blank?lang=${l}`, live: true },
];

export default function GamesPage() {
  const [lang, setLang] = useState('python');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Game Arena</h1>
          <p className="text-gray-400">Compete, learn, and earn XP across every language.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Choose language"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none">
              {languages.map((l) => <option key={l.id} value={l.id} className="bg-[#1a1f3a]">{l.icon} {l.name}</option>)}
            </select>
          </div>
          <Link href={`/games/leaderboard?language=${lang}`}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
            <Trophy className="w-5 h-5 text-yellow-400" /> Leaderboard
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Link href="/daily-challenge" className="sm:col-span-2">
            <div className="bg-gradient-to-r from-orange-900/30 to-purple-900/30 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/60 transition-all">
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10 text-orange-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Challenge</h3>
                  <p className="text-gray-400 text-sm">One quiz per day — same questions for everyone. Bonus XP!</p>
                </div>
              </div>
            </div>
          </Link>
          {GAMES.map((g) => {
            const Icon = g.icon;
            const inner = (
              <div className={`h-full bg-white/5 border rounded-2xl p-6 transition-all ${g.live ? 'border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10' : 'border-white/10 opacity-70'}`}>
                <Icon className={`w-10 h-10 mb-4 ${g.live ? 'text-purple-400' : 'text-gray-500'}`} />
                <h3 className="text-xl font-bold text-white mb-2">{g.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{g.desc}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${g.live ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {g.live ? 'Live' : 'Coming soon'}
                </span>
              </div>
            );
            return g.live
              ? <Link key={g.id} href={g.href(lang)}>{inner}</Link>
              : <div key={g.id}>{inner}</div>;
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Five game types live across all {languages.length} languages — earn XP and climb the leaderboards.
        </p>
      </main>
    </div>
  );
}
