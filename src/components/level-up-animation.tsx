'use client';

import { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface LevelUpAnimationProps {
  level: number;
  onComplete?: () => void;
}

export function LevelUpAnimation({ level, onComplete }: LevelUpAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto-hide after animation
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Main animation */}
        <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-2 border-purple-500/50 rounded-3xl p-12 text-center shadow-2xl shadow-purple-500/50 animate-bounce">
          <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-4xl font-bold text-white mb-2">Level Up!</h2>
          <p className="text-2xl text-purple-300 font-bold">Level {level}</p>
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
}
