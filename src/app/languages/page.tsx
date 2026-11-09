'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Code2, Search, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { languages } from '@/data/languages';

const CATEGORY_MAP: Record<string, string> = {
  python: 'data', javascript: 'web', typescript: 'web', java: 'systems',
  cpp: 'systems', c: 'systems', csharp: 'systems', sql: 'database',
  html: 'web', css: 'web', go: 'systems', rust: 'systems', php: 'web',
  ruby: 'web', swift: 'mobile', kotlin: 'mobile', r: 'data', dart: 'mobile',
  bash: 'scripting', assembly: 'systems',
};

const LEVEL_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const LAST_LANG_KEY = 'codeverse_last_language';

interface LangStats {
  lessons: number;
  modules: string[];
}

export default function LanguagesPage() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [stats, setStats] = useState<Record<string, LangStats>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [lessonRes, moduleRes, progressRes] = await Promise.all([
          fetch('/api/content?type=lesson'),
          fetch('/api/content?type=module'),
          fetch('/api/progress', { credentials: 'include' }),
        ]);
        const lessons = (await lessonRes.json()).items || [];
        const modules = (await moduleRes.json()).items || [];

        const s: Record<string, LangStats> = {};
        for (const l of lessons) {
          const lang = l.language;
          if (!lang) continue;
          if (!s[lang]) s[lang] = { lessons: 0, modules: [] };
          s[lang].lessons += 1;
        }
        for (const m of modules) {
          const lang = m.language;
          const dir = String(m.filePath || '').match(/courses\/([^/]+)/)?.[1] || '';
          if (lang && dir === 'complete-course') {
            if (!s[lang]) s[lang] = { lessons: 0, modules: [] };
            if (m.title && !s[lang].modules.includes(m.title)) s[lang].modules.push(m.title);
          }
        }
        for (const k of Object.keys(s)) s[k].modules.sort();

        const p: Record<string, number> = {};
        if (progressRes.ok) {
          const { progress: records } = await progressRes.json();
          for (const r of records || []) {
            if (r.contentType === 'lesson' && r.status === 'completed' && r.languageSlug) {
              p[r.languageSlug] = (p[r.languageSlug] || 0) + 1;
            }
          }
        }

        if (!cancelled) {
          setStats(s);
          setProgress(p);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load languages'); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = languages.filter((l) => {
      if (query && !`${l.name} ${l.description} ${l.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (level !== 'all' && l.difficulty !== level) return false;
      if (category !== 'all' && CATEGORY_MAP[l.id] !== category) return false;
      return true;
    });
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'level') list = [...list].sort((a, b) => LEVEL_ORDER[a.difficulty] - LEVEL_ORDER[b.difficulty]);
    else list = [...list].sort((a, b) => (stats[b.id]?.lessons || 0) - (stats[a.id]?.lessons || 0));
    return list;
  }, [query, level, category, sort, stats]);

  const difficultyColors = {
    beginner: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    intermediate: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    advanced: 'from-red-500/20 to-purple-500/20 border-red-500/30',
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Language</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select a programming language to begin your learning journey.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search languages..."
              aria-label="Search languages"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by level"
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
            <option value="all" className="bg-[#1a1f3a]">All levels</option>
            <option value="beginner" className="bg-[#1a1f3a]">Beginner</option>
            <option value="intermediate" className="bg-[#1a1f3a]">Intermediate</option>
            <option value="advanced" className="bg-[#1a1f3a]">Advanced</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
            <option value="all" className="bg-[#1a1f3a]">All categories</option>
            <option value="web" className="bg-[#1a1f3a]">Web</option>
            <option value="systems" className="bg-[#1a1f3a]">Systems</option>
            <option value="mobile" className="bg-[#1a1f3a]">Mobile</option>
            <option value="data" className="bg-[#1a1f3a]">Data</option>
            <option value="database" className="bg-[#1a1f3a]">Database</option>
            <option value="scripting" className="bg-[#1a1f3a]">Scripting</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort languages"
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500">
            <option value="popular" className="bg-[#1a1f3a]">Most popular</option>
            <option value="az" className="bg-[#1a1f3a]">A – Z</option>
            <option value="level" className="bg-[#1a1f3a]">Level</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-300">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No languages match your filters.</p>
            <button onClick={() => { setQuery(''); setLevel('all'); setCategory('all'); }}
              className="mt-4 text-purple-400 hover:text-purple-300">Clear filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lang) => {
              const s = stats[lang.id] || { lessons: 0, modules: [] };
              const done = progress[lang.id] || 0;
              const pct = s.lessons ? Math.min(100, Math.round((done / s.lessons) * 100)) : 0;
              const isExpanded = expanded === lang.id;
              return (
                <div key={lang.id}
                  className={`bg-gradient-to-br ${difficultyColors[lang.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner} border rounded-xl p-6 hover:scale-[1.02] transition-all duration-300`}>
                  <Link href={`/course/complete-course?lang=${lang.id}`}
                    onClick={() => { try { localStorage.setItem(LAST_LANG_KEY, lang.id); } catch {} }}
                    className="block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl" aria-hidden>{lang.icon}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lang.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        lang.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{lang.difficulty}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{lang.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{lang.description}</p>
                    <div className="text-xs text-gray-400 mb-2">
                      {s.modules.length} modules · {s.lessons} lessons
                      {done > 0 && <span className="text-green-400"> · {done}/{s.lessons} done</span>}
                    </div>
                    {s.lessons > 0 && (
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    <span className="inline-block px-4 py-2 bg-purple-600 rounded-lg text-white text-sm font-medium group-hover:bg-purple-500">
                      {done > 0 ? 'Continue' : 'Start'}
                    </span>
                  </Link>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : lang.id)}
                    aria-expanded={isExpanded}
                    className="mt-4 w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <span>{s.modules.length} modules{lang.topics.length > 3 ? ` · +${lang.topics.length - 3} topics` : ''}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                      {s.modules.map((m) => (
                        <div key={m} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">{m}</div>
                      ))}
                      {s.modules.length === 0 && lang.topics.map((t) => (
                        <div key={t} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">{t}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Can't Find Your Language?</h2>
            <p className="text-gray-400 mb-6">Vote for your favorite or suggest a new one.</p>
            <Link href="/languages/suggest" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Suggest a Language
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
