'use client';

import Link from 'next/link';
import { Code2, Search, Filter } from 'lucide-react';
import { languages } from '@/data/languages';

export default function LanguagesPage() {
  const difficultyColors = {
    beginner: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    intermediate: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    advanced: 'from-red-500/20 to-purple-500/20 border-red-500/30'
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
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Language</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select a programming language to begin your learning journey. Each language offers a complete path from beginner to advanced.
          </p>
        </div>

        <div className="flex gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search languages..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <Link
              key={lang.id}
              href={`/course/${lang.id}-basics`}
              className={`bg-gradient-to-br ${difficultyColors[lang.difficulty]} border rounded-xl p-6 hover:scale-105 transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{lang.icon}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lang.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  lang.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {lang.difficulty}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{lang.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{lang.description}</p>
              <div className="flex flex-wrap gap-2">
                {lang.topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300"
                  >
                    {topic}
                  </span>
                ))}
                {lang.topics.length > 3 && (
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                    +{lang.topics.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Can't Find Your Language?</h2>
            <p className="text-gray-400 mb-6">
              We're constantly adding new programming languages. Vote for your favorite or suggest a new one.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Suggest a Language
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
