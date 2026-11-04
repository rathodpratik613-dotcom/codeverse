import Link from "next/link";
import { Code2, Play, Trophy, Target, Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      <Navbar />

      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Level Up Your Coding Skills</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Learn Coding
            </span>
            <br />
            <span className="text-white">Through Gaming</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Master Python, JavaScript, Java, and 15+ programming languages through interactive gameplay, real code execution, and competitive challenges.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Free
            </Link>
            <Link
              href="/languages"
              className="px-8 py-4 border border-purple-500/50 rounded-full text-white font-semibold text-lg hover:bg-purple-500/10 transition-all"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Coding Adventure</h3>
            <p className="text-gray-400">
              Progress through a world map of coding challenges. Unlock new levels as you master concepts.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Code2 className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real Code Editor</h3>
            <p className="text-gray-400">
              Write and execute real code in a professional browser-based editor with syntax highlighting.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Earn Rewards</h3>
            <p className="text-gray-400">
              Collect XP, coins, badges, and achievements. Compete on leaderboards with coders worldwide.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Supported Languages</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {['Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'TypeScript', 'SQL', 'HTML', 'CSS', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'R', 'Dart', 'Bash'].map((lang) => (
              <span
                key={lang}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-default"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
            <div className="text-gray-400">Lessons</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-gray-400">Challenges</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
            <div className="text-gray-400">Active Learners</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">4.9</div>
            <div className="text-gray-400">User Rating</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500">
          <p>&copy; 2026 CODEVERSE. Learn coding through gaming.</p>
        </div>
      </footer>
    </div>
  );
}
