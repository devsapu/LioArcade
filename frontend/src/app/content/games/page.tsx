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

// ============================================
// GAMES CATALOG
// ============================================
// To add a new game:
// 1. Add a new object to this array with the required fields
// 2. Create the game page at /games/[game-id]/page.tsx
// 3. The game will automatically appear in the grid below
// ============================================
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
  // Example:
  // {
  //   id: 'memory',
  //   title: 'Memory Game',
  //   description: 'Test your memory with card matching games',
  //   icon: '🧠',
  //   difficulty: 'Medium',
  //   href: '/games/memory',
  //   color: 'from-purple-500 to-purple-600',
  // },
  // {
  //   id: 'word-search',
  //   title: 'Word Search',
  //   description: 'Find hidden words in a grid puzzle',
  //   icon: '🔍',
  //   difficulty: 'Easy',
  //   href: '/games/word-search',
  //   color: 'from-orange-500 to-orange-600',
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LioArcade</h1>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <span className="text-gray-600 dark:text-gray-300">Mini-Games</span>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎮 Mini-Games</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Learn through play! Challenge yourself with fun, educational games and earn points.
          </p>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold mb-2 dark:text-white">No games available yet</h2>
            <p className="text-gray-600 dark:text-gray-300">Check back soon for exciting new games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                className="group block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full border border-gray-200 dark:border-gray-700">
                  {/* Game Header with Gradient */}
                  <div className={`bg-gradient-to-r ${game.color} dark:opacity-90 p-6 text-white`}>
                    <div className="text-5xl mb-2">{game.icon}</div>
                    <h2 className="text-2xl font-bold mb-1">{game.title}</h2>
                    <div className="flex items-center space-x-2 text-sm opacity-90">
                      <span>📊</span>
                      <span>{game.difficulty}</span>
                    </div>
                  </div>
                  
                  {/* Game Description */}
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{game.description}</p>
                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-500">
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
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">How Mini-Games Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2 dark:text-white">Play & Learn</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Engage with fun, educational games that make learning enjoyable
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2 dark:text-white">Earn Points</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Score points based on your performance and difficulty level
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold mb-2 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your scores are saved and contribute to your overall progress
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">🚀 More Games Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            We're working on adding more exciting mini-games. Stay tuned for updates!
          </p>
        </div>
      </main>
    </div>
  );
}
