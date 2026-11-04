'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, User, Mail, Lock, Bell, Palette, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    username: 'CodeWarrior',
    email: 'codewarrior@example.com',
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      challenges: true,
      achievements: true
    }
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement save logic
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
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences</p>
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Profile Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Security
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notifications
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Email Notifications</div>
                  <div className="text-gray-400 text-sm">Receive updates via email</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-600 bg-white/5"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Push Notifications</div>
                  <div className="text-gray-400 text-sm">Receive push notifications</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-600 bg-white/5"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Challenge Reminders</div>
                  <div className="text-gray-400 text-sm">Get notified about new challenges</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.challenges}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, challenges: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-600 bg-white/5"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Achievement Alerts</div>
                  <div className="text-gray-400 text-sm">Get notified when you unlock achievements</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.achievements}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, achievements: e.target.checked }
                  })}
                  className="w-5 h-5 rounded border-gray-600 bg-white/5"
                />
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/profile"
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-all"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
