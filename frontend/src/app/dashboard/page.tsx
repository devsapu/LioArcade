'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ProgressResponse } from '@/types';
import { CategoryTile } from '@/components/CategoryTile';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentCounts, setContentCounts] = useState({
    games: 1, // Math Challenge
    quizzes: 0,
    flashcards: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchProgress();
  }, [user, router]);

  const fetchProgress = async () => {
    try {
      const response = await apiClient.get<ProgressResponse>('/gamification/progress');
      setProgress(response.data);
    } catch (err) {
      // Silently fail - progress is optional
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentCounts = async () => {
    try {
      // Fetch quizzes count
      const quizzesResponse = await apiClient.get('/content', {
        params: { type: 'QUIZ', limit: 1 },
      });
      const quizzesCount = quizzesResponse.data?.total || quizzesResponse.data?.content?.length || 0;
      
      // Fetch flashcards count
      const flashcardsResponse = await apiClient.get('/content', {
        params: { type: 'FLASHCARD', limit: 1 },
      });
      const flashcardsCount = flashcardsResponse.data?.total || flashcardsResponse.data?.content?.length || 0;

      setContentCounts({
        games: 1, // Currently hardcoded - update when adding more games
        quizzes: quizzesCount || 2, // Fallback to sample count
        flashcards: flashcardsCount || 2, // Fallback to sample count
      });
    } catch (err) {
      // Use fallback counts if API fails
      setContentCounts({
        games: 1,
        quizzes: 2,
        flashcards: 2,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchContentCounts();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl transition-transform duration-200 hover:scale-125 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}.0)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      <nav className="bg-white shadow-sm">
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
          {/* Welcome Section with Animation */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.email?.split('@')[0]}! 👋
            </h2>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>

          {/* Quick Stats Cards */}
          {!isLoading && progress && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-primary-600">{progress.gamification.points}</p>
                  </div>
                  <div className="text-3xl">⭐</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Level</p>
                    <p className="text-2xl font-bold text-primary-600">{progress.gamification.level}</p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Badges</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {Array.isArray(progress.gamification.badges) ? progress.gamification.badges.length : 0}
                    </p>
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-primary-600">{progress.statistics.totalCompleted}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Category Tiles - Games, Quizzes, Flashcards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Learning Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="animate-tile-enter" style={{ animationDelay: '0ms' }}>
                <CategoryTile
                  title="Games"
                  description="Learn through play! Challenge yourself with fun, educational games and earn points as you progress."
                  icon="🎮"
                  href="/content/games"
                  gradientFrom="from-purple-500"
                  gradientTo="to-pink-600"
                  iconBg="bg-purple-100"
                  delay={0}
                  itemCount={contentCounts.games}
                  itemLabel={contentCounts.games === 1 ? 'game' : 'games'}
                />
              </div>
              <div className="animate-tile-enter" style={{ animationDelay: '150ms' }}>
                <CategoryTile
                  title="Quizzes"
                  description="Test your knowledge with interactive quizzes. Get instant feedback and track your progress over time."
                  icon="📝"
                  href="/content/quizzes"
                  gradientFrom="from-blue-500"
                  gradientTo="to-cyan-600"
                  iconBg="bg-blue-100"
                  delay={150}
                  itemCount={contentCounts.quizzes}
                  itemLabel={contentCounts.quizzes === 1 ? 'quiz' : 'quizzes'}
                />
              </div>
              <div className="animate-tile-enter" style={{ animationDelay: '300ms' }}>
                <CategoryTile
                  title="Flashcards"
                  description="Study efficiently with spaced repetition. Master new concepts through interactive flashcard sessions."
                  icon="🎴"
                  href="/content/flashcards"
                  gradientFrom="from-green-500"
                  gradientTo="to-emerald-600"
                  iconBg="bg-green-100"
                  delay={300}
                  itemCount={contentCounts.flashcards}
                  itemLabel={contentCounts.flashcards === 1 ? 'deck' : 'decks'}
                />
              </div>
            </div>
          </div>

          {/* Progress and Leaderboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <Link href="/progress" className="group">
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">📊 Your Progress</h3>
                    <p className="text-gray-600 mb-4">View detailed progress and achievements</p>
                    <span className="text-primary-600 font-semibold group-hover:text-primary-700 flex items-center">
                      View detailed progress
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                  <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📈</div>
                </div>
              </div>
            </Link>

            <Link href="/leaderboard" className="group">
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🏆 Leaderboard</h3>
                    <p className="text-gray-600 mb-4">See how you rank against other learners</p>
                    <span className="text-primary-600 font-semibold group-hover:text-primary-700 flex items-center">
                      See rankings
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                  <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🏅</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
