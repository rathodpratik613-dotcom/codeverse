'use client';

import Link from 'next/link';
import { Code2, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { achievements } from '@/data/languages';

export default function AchievementsPage() {
  const userAchievements = ['first_lesson', 'streak_master']; // Mock unlocked achievements

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
          <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-400">Unlock badges by completing challenges and reaching milestones</p>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Progress</h2>
                <p className="text-gray-400">
                  {userAchievements.length} of {achievements.length} achievements unlocked
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-400">
                  {userAchievements.length}/{achievements.length}
                </div>
                <div className="text-gray-400 text-sm">Unlocked</div>
              </div>
            </div>
            <div className="mt-4 w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${(userAchievements.length / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isUnlocked = userAchievements.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`bg-gradient-to-br ${
                  isUnlocked
                    ? 'from-yellow-900/20 to-orange-900/20 border-yellow-500/30'
                    : 'from-gray-900/20 to-gray-800/20 border-gray-700/30 opacity-60'
                } border rounded-xl p-6 transition-all hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-5xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{achievement.description}</p>

                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm mb-1">Requirement</p>
                  <p className="text-white text-sm">{achievement.requirement}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-purple-400 text-sm font-medium">
                    +{achievement.xpReward} XP
                  </span>
                  {isUnlocked && (
                    <span className="text-green-400 text-sm font-medium">Unlocked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Keep Learning!</h2>
            <p className="text-gray-400 mb-6">
              Complete more lessons and challenges to unlock all achievements and earn rewards.
            </p>
            <Link
              href="/languages"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
