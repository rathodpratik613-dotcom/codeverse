'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code2, Users, BookOpen, Target, TrendingUp, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalXP: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data.users || []);
          setStats(data.stats || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load admin data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">{error}</p>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-400">Manage users, content, and view analytics</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-3xl font-bold text-white">{stats.totalUsers}</h3>
              <p className="text-gray-400 text-sm">Total Users</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-6">
              <Target className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-3xl font-bold text-white">{stats.activeUsers}</h3>
              <p className="text-gray-400 text-sm">Active Players</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-xl p-6">
              <BookOpen className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-3xl font-bold text-white">{stats.totalGames}</h3>
              <p className="text-gray-400 text-sm">Games Played</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-3xl font-bold text-white">{stats.totalXP.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">Total XP Earned</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-4">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Level</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">XP</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Coins</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white font-medium">{user.username}</td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-white">{user.level}</td>
                      <td className="px-6 py-4 text-purple-400">{user.xp}</td>
                      <td className="px-6 py-4 text-cyan-400">{user.coins}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
