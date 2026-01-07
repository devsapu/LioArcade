'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="secondary">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to LioArcade
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gamified Learning Platform - Learn through play
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button variant="primary" className="px-8 py-3 text-lg">
                Start Learning
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-3">Quizzes</h2>
            <p className="text-gray-600">Test your knowledge with interactive quizzes and get instant feedback</p>
          </div>
          
          <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎴</div>
            <h2 className="text-2xl font-semibold mb-3">Flashcards</h2>
            <p className="text-gray-600">Study efficiently with spaced repetition algorithms</p>
          </div>
          
          <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="text-2xl font-semibold mb-3">Mini-Games</h2>
            <p className="text-gray-600">Make learning fun and engaging with gamified content</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Earn Points & Badges</h2>
          <p className="text-gray-600 mb-6">
            Track your progress, climb the leaderboard, and unlock achievements as you learn
          </p>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">500+</div>
              <div className="text-sm text-gray-600">Points Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">20+</div>
              <div className="text-sm text-gray-600">Badges to Earn</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">10</div>
              <div className="text-sm text-gray-600">Levels to Unlock</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

