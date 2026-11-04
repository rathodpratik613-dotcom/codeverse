'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Code2, User, Mail, Calendar, TrendingUp, Flame, Trophy, Edit, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const xpToNext = ((user.level + 1) * 1000);
  const totalXP = user.xp;

  const stats = [
    { label: 'Level', value: user.level, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'XP', value: totalXP.toLocaleString(), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Coins', value: user.coins, icon: Trophy, color: 'text-cyan-400' },
    { label: 'Streak', value: `${user.streak} days`, icon: Flame, color: 'text-red-400' }
  ];

  const stats = [
    { label: 'Level', value: user.level, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'XP', value: user.totalXP.toLocaleString(), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Coins', value: user.coins, icon: Trophy, color: 'text-cyan-400' },
    { label: 'Streak', value: `${user.streak} days`, icon: Flame, color: 'text-red-400' }
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
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-gray-400 text-sm mb-4">Level {user.level} Coder</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Joined {joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/achievements"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-all"
                >
                  <Trophy className="w-5 h-5" />
                  <span>View Achievements</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Level Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Current XP</span>
                  <span>{user.xp} / {xpToNext}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${(user.xp / xpToNext) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {xpToNext - user.xp} XP needed to reach Level {user.level + 1}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Learning Statistics</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-1">{user.totalLessons}</div>
                  <p className="text-gray-400">Lessons Completed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">{user.totalChallenges}</div>
                  <p className="text-gray-400">Challenges Solved</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{Math.floor(user.totalXP / user.totalLessons)}</div>
                  <p className="text-gray-400">Avg XP per Lesson</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{user.streak}</div>
                  <p className="text-gray-400">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">Completed "Python Variables" lesson</h4>
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                  </div>
                  <span className="text-purple-400 font-medium">+15 XP</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">Achieved 7-day streak</h4>
                    <p className="text-gray-400 text-sm">1 day ago</p>
                  </div>
                  <span className="text-purple-400 font-medium">+300 XP</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">Leveled up to Level 5</h4>
                    <p className="text-gray-400 text-sm">2 days ago</p>
                  </div>
                  <span className="text-purple-400 font-medium">Level Up!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
