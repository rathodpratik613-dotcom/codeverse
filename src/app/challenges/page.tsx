'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code2, Target, Sword, Bug, Clock, Trophy, Zap } from 'lucide-react';

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'battle' | 'debug' | 'boss'>('battle');

  const battleChallenges = [
    {
      id: 1,
      title: 'FizzBuzz',
      difficulty: 'easy',
      language: 'javascript',
      xp: 30,
      coins: 15,
      timeLimit: 300,
      description: 'Print numbers 1-100, but print "Fizz" for multiples of 3, "Buzz" for 5, and "FizzBuzz" for both.'
    },
    {
      id: 2,
      title: 'Array Sum',
      difficulty: 'easy',
      language: 'javascript',
      xp: 25,
      coins: 10,
      timeLimit: 180,
      description: 'Write a function that returns the sum of all numbers in an array.'
    },
    {
      id: 3,
      title: 'Palindrome Check',
      difficulty: 'medium',
      language: 'javascript',
      xp: 50,
      coins: 25,
      timeLimit: 420,
      description: 'Check if a given string is a palindrome (reads the same forwards and backwards).'
    },
    {
      id: 4,
      title: 'Two Sum',
      difficulty: 'medium',
      language: 'javascript',
      xp: 60,
      coins: 30,
      timeLimit: 600,
      description: 'Find two numbers in an array that add up to a target sum.'
    },
    {
      id: 5,
      title: 'Binary Search',
      difficulty: 'hard',
      language: 'javascript',
      xp: 100,
      coins: 50,
      timeLimit: 900,
      description: 'Implement binary search algorithm to find an element in a sorted array.'
    }
  ];

  const debugChallenges = [
    {
      id: 1,
      title: 'Fix the Loop',
      difficulty: 'easy',
      language: 'javascript',
      xp: 35,
      coins: 15,
      description: 'This loop should print even numbers, but it has a bug. Find and fix it.',
      brokenCode: 'for (let i = 0; i <= 10; i++) {\n  if (i % 2 = 0) {\n    console.log(i);\n  }\n}'
    },
    {
      id: 2,
      title: 'Array Filter Bug',
      difficulty: 'medium',
      language: 'javascript',
      xp: 55,
      coins: 25,
      description: 'The filter function should return positive numbers, but it\'s not working correctly.',
      brokenCode: 'const numbers = [-1, 2, -3, 4, -5];\nconst positive = numbers.filter(n => n > 0);\nconsole.log(positive);'
    }
  ];

  const bossChallenges = [
    {
      id: 1,
      title: 'Algorithm Master',
      difficulty: 'expert',
      language: 'javascript',
      xp: 500,
      coins: 200,
      description: 'Complete a series of 5 algorithmic challenges without errors to defeat this boss.',
      requirements: ['Sorting', 'Searching', 'Recursion', 'Dynamic Programming', 'Graph Theory']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-4xl font-bold text-white mb-2">Coding Challenges</h1>
          <p className="text-gray-400">Test your skills and compete for rewards</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'battle'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Sword className="w-5 h-5" />
            Coding Battle
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'debug'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Bug className="w-5 h-5" />
            Debugging Arena
          </button>
          <button
            onClick={() => setActiveTab('boss')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'boss'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Boss Challenges
          </button>
        </div>

        {activeTab === 'battle' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {battleChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatTime(challenge.timeLimit)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-purple-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    +{challenge.xp} XP
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    +{challenge.coins} coins
                  </span>
                </div>

                <Link
                  href={`/playground`}
                  className="block w-full py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white font-medium hover:bg-white/10 transition-all group-hover:border-purple-500/50"
                >
                  Start Challenge
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="grid md:grid-cols-2 gap-6">
            {debugChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-xl p-6 hover:border-red-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <Bug className="w-5 h-5 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                    {challenge.brokenCode}
                  </pre>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-purple-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    +{challenge.xp} XP
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    +{challenge.coins} coins
                  </span>
                </div>

                <Link
                  href={`/playground`}
                  className="block w-full py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white font-medium hover:bg-white/10 transition-all"
                >
                  Start Debugging
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'boss' && (
          <div className="grid md:grid-cols-2 gap-6">
            {bossChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-gradient-to-br from-yellow-900/20 to-red-900/20 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {challenge.requirements.map((req) => (
                      <span key={req} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-purple-400 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    +{challenge.xp} XP
                  </span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    +{challenge.coins} coins
                  </span>
                </div>

                <Link
                  href={`/playground`}
                  className="block w-full py-3 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg text-center text-white font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                >
                  Face the Boss
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
