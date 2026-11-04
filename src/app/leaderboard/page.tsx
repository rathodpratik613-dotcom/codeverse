'use client';

import Link from 'next/link';
import { Code2, Trophy, Medal, TrendingUp } from 'lucide-react';

export default function LeaderboardPage() {
  const leaderboard = [
    { rank: 1, username: 'CodeMaster99', xp: 15420, level: 25, streak: 30 },
    { rank: 2, username: 'PythonWizard', xp: 14250, level: 24, streak: 28 },
    { rank: 3, username: 'JSNinja', xp: 13800, level: 23, streak: 25 },
    { rank: 4, username: 'AlgorithmKing', xp: 12500, level: 22, streak: 20 },
    { rank: 5, username: 'DataSciencePro', xp: 11800, level: 21, streak: 18 },
    { rank: 6, username: 'WebDevStar', xp: 10500, level: 20, streak: 15 },
    { rank: 7, username: 'FullStackHero', xp: 9800, level: 19, streak: 12 },
    { rank: 8, username: 'BackendBoss', xp: 9200, level: 18, streak: 10 },
    { rank: 9, username: 'FrontendExpert', xp: 8500, level: 17, streak: 8 },
    { rank: 10, username: 'CloudArchitect', xp: 7800, level: 16, streak: 7 },
  ];

  const currentUser = { rank: 42, username: 'CodeWarrior', xp: 2450, level: 5, streak: 7 };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'from-yellow-900/20 to-orange-900/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-800/20 to-gray-700/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-900/20 to-red-900/20 border-orange-500/30';
    return 'from-purple-900/20 to-blue-900/20 border-purple-500/20';
  };

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400">Compete with coders worldwide</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h2 className="text-xl font-bold text-white">Top Coders</h2>
              </div>

              <div className="divide-y divide-white/10">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-all ${getRankBg(user.rank)}`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white font-medium">{user.username}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Level {user.level}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {user.streak} day streak
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-400">{user.xp.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Rank</h3>

              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-purple-400 mb-2">#{currentUser.rank}</div>
                  <div className="text-gray-400">Global Rank</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP</span>
                    <span className="text-white font-medium">{currentUser.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white font-medium">{currentUser.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-white font-medium">{currentUser.streak} days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">To rank #{currentUser.rank - 1}</span>
                    <span className="text-purple-400">350 XP</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">To top 10</span>
                    <span className="text-purple-400">5,350 XP</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '46%' }} />
                  </div>
                </div>
              </div>

              <Link
                href="/languages"
                className="mt-6 block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold text-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
