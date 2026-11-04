'use client';

import Link from 'next/link';
import { Code2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <Code2 className="w-8 h-8 text-purple-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          CODEVERSE
        </span>
      </Link>
      <div className="flex gap-6 items-center">
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
