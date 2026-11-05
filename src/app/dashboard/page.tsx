'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Code2, TrendingUp, Flame, Target, Trophy, BookOpen, Zap, Calendar, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const xpToNext = ((user.level + 1) * 1000);

  const recentActivity = [
    { type: 'lesson', title: 'Python Variables', xp: 15, time: '2 hours ago' },
    { type: 'challenge', title: 'FizzBuzz Challenge', xp: 30, time: '5 hours ago' },
    { type: 'achievement', title: 'Streak Master', xp: 300, time: '1 day ago' }
  ];

  const dailyMissions = [
    { id: 1, title: 'Complete 3 lessons', progress: 2, target: 3, xp: 50, coins: 20 },
    { id: 2, title: 'Solve 5 challenges', progress: 3, target: 5, xp: 75, coins: 30 },
    { id: 3, title: 'Earn 100 XP', progress: 60, target: 100, xp: 25, coins: 10 }
  ];

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
          <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
            Profile
          </Link>
          <Link href="/settings" className="text-gray-300 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <button
            onClick={logout}
            className="text-gray-300 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-400">Continue your coding journey</p>
        </div>

        {!user && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400">Loading your data...</p>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Level {user.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>{user.xp}/{xpToNext}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(user.xp / xpToNext) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{user.xp}</span>
            </div>
            <p className="text-gray-400 text-sm">Total XP</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">{user.coins}</span>
            </div>
            <p className="text-gray-400 text-sm">Coins</p>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">{user.streak}</span>
            </div>
            <p className="text-gray-400 text-sm">Day Streak</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Daily Missions
            </h2>
            <div className="space-y-4">
              {dailyMissions.map((mission) => (
                <div key={mission.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{mission.title}</h3>
                    <div className="flex gap-2 text-sm">
                      <span className="text-purple-400">+{mission.xp} XP</span>
                      <span className="text-cyan-400">+{mission.coins} coins</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {mission.progress}/{mission.target} completed
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    {activity.type === 'lesson' && <BookOpen className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'challenge' && <Target className="w-5 h-5 text-blue-400" />}
                    {activity.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                  <span className="text-purple-400 font-medium">+{activity.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Continue Learning</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/course/python-basics"
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
            >
              <div className="text-4xl mb-4">🐍</div>
              <h3 className="text-xl font-bold text-white mb-2">Python Fundamentals</h3>
              <p className="text-gray-400 text-sm mb-4">Module 2: Control Flow</p>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
              <p className="text-gray-400 text-sm">45% complete</p>
            </Link>

            <Link
              href="/course/javascript-basics"
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">JavaScript Basics</h3>
              <p className="text-gray-400 text-sm mb-4">Module 1: Introduction</p>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
              <p className="text-gray-400 text-sm">20% complete</p>
            </Link>

            <Link
              href="/languages"
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Explore More</h3>
              <p className="text-gray-400 text-sm">Browse all available courses</p>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/challenges"
            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Coding Challenges</h3>
                <p className="text-gray-400 text-sm">Test your skills with competitive coding</p>
              </div>
            </div>
          </Link>

          <Link
            href="/achievements"
            className="bg-gradient-to-br from-yellow-900/20 to-purple-900/20 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Achievements</h3>
                <p className="text-gray-400 text-sm">View your badges and rewards</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
