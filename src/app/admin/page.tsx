'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, Users, BookOpen, Target, TrendingUp, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'challenges' | 'stats'>('stats');

  const mockUsers = [
    { id: '1', username: 'CodeWarrior', email: 'codewarrior@example.com', level: 5, xp: 2450, joined: '2026-01-15' },
    { id: '2', username: 'PythonMaster', email: 'python@example.com', level: 12, xp: 12400, joined: '2026-01-10' },
    { id: '3', username: 'JSNinja', email: 'js@example.com', level: 8, xp: 7800, joined: '2026-01-12' },
  ];

  const mockCourses = [
    { id: 'python-basics', title: 'Python Fundamentals', language: 'Python', lessons: 8, students: 234 },
    { id: 'javascript-basics', title: 'JavaScript Basics', language: 'JavaScript', lessons: 6, students: 189 },
  ];

  const mockChallenges = [
    { id: '1', title: 'FizzBuzz', difficulty: 'easy', submissions: 456, successRate: 78 },
    { id: '2', title: 'Two Sum', difficulty: 'medium', submissions: 234, successRate: 45 },
  ];

  const stats = {
    totalUsers: 1523,
    activeUsers: 892,
    totalCourses: 18,
    totalChallenges: 156,
    totalXP: 2450000,
    avgCompletion: 67
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            CODEVERSE
          </span>
          <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
            ADMIN
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
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, courses, and challenges</p>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Target className="w-5 h-5" />
            Challenges
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-gray-400 text-sm">Total Users</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-gray-400 text-sm">Active Users</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/20 to-green-900/20 border border-cyan-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.totalCourses}</div>
              <p className="text-gray-400 text-sm">Total Courses</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalChallenges}</div>
              <p className="text-gray-400 text-sm">Total Challenges</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{(stats.totalXP / 1000000).toFixed(1)}M</div>
              <p className="text-gray-400 text-sm">Total XP Earned</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">{stats.avgCompletion}%</div>
              <p className="text-gray-400 text-sm">Avg Completion</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Users</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">XP</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{user.username}</td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-purple-400">{user.level}</td>
                    <td className="px-6 py-4 text-gray-400">{user.xp.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Courses</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Course
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Language</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Lessons</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Students</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {mockCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{course.title}</td>
                    <td className="px-6 py-4 text-gray-400">{course.language}</td>
                    <td className="px-6 py-4 text-purple-400">{course.lessons}</td>
                    <td className="px-6 py-4 text-gray-400">{course.students}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Challenges</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Challenge
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Difficulty</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Submissions</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Success Rate</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {mockChallenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{challenge.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{challenge.submissions}</td>
                    <td className="px-6 py-4 text-purple-400">{challenge.successRate}%</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
