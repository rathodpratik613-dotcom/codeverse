'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ThumbsUp, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Suggestion {
  id: string;
  name: string;
  reason?: string;
  votes: number;
  status: string;
  hasVoted: boolean;
}

export default function SuggestLanguagePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/suggestions', { credentials: 'include' });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load suggestions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Language name must be at least 2 characters' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to submit' });
      } else {
        setMessage({ type: 'success', text: `Thanks! "${data.suggestion.name}" was suggested.` });
        setName(''); setReason('');
        await load();
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (id: string) => {
    const res = await fetch('/api/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, action: 'vote' }),
    });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href="/languages" className="text-gray-300 hover:text-white transition-colors">Languages</Link>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-4">Suggest a Language</h1>
        <p className="text-gray-400 mb-8">Missing a language you want to learn? Suggest it and vote for others.</p>

        {!authLoading && !isAuthenticated ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-10">
            <p className="text-gray-300 mb-4">You need to be logged in to suggest or vote.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold">Log In</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-10">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lang-name">Language name</label>
            <input id="lang-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
              placeholder="e.g. Lua, Zig, Haskell"
              className="w-full px-4 py-3 mb-4 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lang-reason">Why should we add it? (optional)</label>
            <textarea id="lang-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3}
              placeholder="What will you build with it?"
              className="w-full px-4 py-3 mb-4 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            {message && (
              <div className={`flex items-center gap-2 mb-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            <button type="submit" disabled={submitting || !isAuthenticated}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Suggestion
            </button>
          </form>
        )}

        <h2 className="text-2xl font-bold text-white mb-4">Most Requested</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
        ) : suggestions.length === 0 ? (
          <p className="text-gray-400">No suggestions yet — be the first!</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                <button onClick={() => vote(s.id)} disabled={!isAuthenticated}
                  aria-label={`Vote for ${s.name}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    s.hasVoted ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  } disabled:opacity-50`}>
                  <ThumbsUp className="w-4 h-4" />
                  {s.votes}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{s.name}</div>
                  {s.reason && <div className="text-gray-400 text-sm truncate">{s.reason}</div>}
                </div>
                {s.status === 'pending' && <span className="text-xs text-yellow-400">pending</span>}
                {s.status === 'approved' && <span className="text-xs text-green-400">approved</span>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
