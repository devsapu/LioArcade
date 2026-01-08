'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  href: string;
  color: string;
}

const games: Game[] = [
  {
    id: 'math',
    title: 'Math Challenge',
    description: 'Test your math skills with addition, subtraction, and multiplication problems. Choose your difficulty and see how many you can solve!',
    icon: '🧮',
    difficulty: 'Easy to Hard',
    href: '/games/math',
    color: 'from-blue-500 to-blue-600',
  },
  // Add more games here as you create them
  // {
  //   id: 'memory',
  //   title: 'Memory Game',
  //   description: 'Test your memory with card matching games',
  //   icon: '🧠',
  //   difficulty: 'Medium',
  //   href: '/games/memory',
  //   color: 'from-purple-500 to-purple-600',
  // },
];

export default function MiniGamesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Mini-Games</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎮 Mini-Games</h1>
          <p className="text-gray-600 text-lg">
            Learn through play! Challenge yourself with fun, educational games and earn points.
          </p>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold mb-2">No games available yet</h2>
            <p className="text-gray-600">Check back soon for exciting new games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  {/* Game Header with Gradient */}
                  <div className={`bg-gradient-to-r ${game.color} p-6 text-white`}>
                    <div className="text-5xl mb-2">{game.icon}</div>
                    <h2 className="text-2xl font-bold mb-1">{game.title}</h2>
                    <div className="flex items-center space-x-2 text-sm opacity-90">
                      <span>📊</span>
                      <span>{game.difficulty}</span>
                    </div>
                  </div>
                  
                  {/* Game Description */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{game.description}</p>
                    <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                      <span>Play Now</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">How Mini-Games Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Play & Learn</h3>
              <p className="text-gray-600 text-sm">
                Engage with fun, educational games that make learning enjoyable
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2">Earn Points</h3>
              <p className="text-gray-600 text-sm">
                Score points based on your performance and difficulty level
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Your scores are saved and contribute to your overall progress
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">🚀 More Games Coming Soon</h3>
          <p className="text-gray-600 text-sm">
            We're working on adding more exciting mini-games. Stay tuned for updates!
          </p>
        </div>
      </main>
    </div>
  );
}
