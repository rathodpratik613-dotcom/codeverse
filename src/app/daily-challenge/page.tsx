'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Code2, Calendar, Trophy, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export default function DailyChallengePage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch('/api/daily-challenge')
      .then((r) => r.json())
      .then((data) => {
        if (data.completed) {
          setCompleted(true);
          setScore(data.score);
          setCorrect(data.correct);
        } else {
          setQuestions(data.questions || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const submitAnswer = async (questionId: string, selected: string) => {
    const newAnswers = { ...answers, [questionId]: selected };
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Submit all answers
      const res = await fetch('/api/daily-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: Object.entries(newAnswers).map(([questionId, selected]) => ({ questionId, selected })) }),
      });
      const data = await res.json();
      if (data.success) {
        setScore(data.score);
        setCorrect(data.correct);
        setCompleted(true);
      }
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
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
        <Link href="/games" className="text-gray-300 hover:text-white transition-colors">Games</Link>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Daily Challenge</h1>
          <p className="text-gray-400">One quiz per day. Same questions for everyone. Earn bonus XP!</p>
        </div>

        {completed ? (
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8 text-center">
            <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-4xl font-bold text-purple-300 mb-2">{score} points</p>
            <p className="text-gray-400">{correct}/{questions.length || 10} correct</p>
            <p className="text-sm text-gray-500 mt-4">Come back tomorrow for a new challenge!</p>
            <Link href="/games" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Back to Games
            </Link>
          </div>
        ) : questions.length > 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-400">Question {current + 1} of {questions.length}</span>
              <span className="text-sm text-purple-400">{Object.keys(answers).length} answered</span>
            </div>

            <h2 className="text-xl text-white font-semibold mb-6">{questions[current].question}</h2>

            <div className="grid gap-3">
              {questions[current].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => submitAnswer(questions[current].id, opt)}
                  className={`text-left px-5 py-4 rounded-xl border transition-all ${
                    answers[questions[current].id] === opt
                      ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                      : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-purple-500/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>No questions available. Check back later!</p>
          </div>
        )}
      </main>
    </div>
  );
}
