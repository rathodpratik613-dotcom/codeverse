'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, Check, X, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Suggestion {
  id: string;
  name: string;
  reason?: string;
  votes: number;
  status: string;
  createdAt: string;
}

export default function AdminSuggestionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    const res = await fetch('/api/suggestions', { credentials: 'include' });
    const data = await res.json();
    setItems(data.suggestions || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) load();
    else if (!isLoading) setLoading(false);
  }, [isLoading, isAuthenticated]);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, action: 'moderate', status }),
    });
    await load();
  };

  if (isLoading || loading) {
    return <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admins only</h1>
          <Link href="/" className="text-purple-400">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-purple-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">CODEVERSE</span>
        </Link>
        <Link href="/admin" className="text-gray-300 hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Admin</Link>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Language Suggestions</h1>
        <p className="text-gray-400 mb-8">Approve or reject community suggestions.</p>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {items.length === 0 && <p className="text-gray-400">No suggestions yet.</p>}

        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-xs text-purple-300">{s.votes} votes</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{s.status}</span>
                </div>
                {s.reason && <p className="text-gray-400 text-sm truncate mt-1">{s.reason}</p>}
              </div>
              {s.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => moderate(s.id, 'approved')} aria-label={`Approve ${s.name}`}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check className="w-4 h-4" /></button>
                  <button onClick={() => moderate(s.id, 'rejected')} aria-label={`Reject ${s.name}`}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
