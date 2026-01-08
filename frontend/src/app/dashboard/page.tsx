'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.email}!
            </h2>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>

          {/* Featured Game */}
          <div className="mb-8">
            <Link href="/games/math" className="block p-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl mb-2">🧮</div>
                  <h3 className="text-2xl font-bold mb-2">Math Challenge</h3>
                  <p className="text-primary-100">Test your math skills! Solve problems and earn points</p>
                </div>
                <div className="text-4xl">→</div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/content/quizzes" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-2">📝</div>
              <h3 className="text-xl font-semibold mb-2">Quizzes</h3>
              <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
            </Link>

            <Link href="/content/flashcards" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-2">🎴</div>
              <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
              <p className="text-gray-600">Study efficiently with spaced repetition</p>
            </Link>

            <Link href="/content/games" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-xl font-semibold mb-2">Mini-Games</h3>
              <p className="text-gray-600">Make learning fun and engaging</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
              <Link href="/progress" className="text-primary-600 hover:text-primary-700">
                View detailed progress →
              </Link>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
              <Link href="/leaderboard" className="text-primary-600 hover:text-primary-700">
                See rankings →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



