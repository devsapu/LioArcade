'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { InteractiveCharacter } from '@/components/InteractiveCharacter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UsernameDisplay } from '@/components/UsernameDisplay';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ProgressResponse } from '@/types';
import { CategoryTile } from '@/components/CategoryTile';
import { Avatar } from '@/components/Avatar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, hasHydrated, fetchUserProfile } = useAuthStore();
  const redirectingRef = useRef(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentCounts, setContentCounts] = useState({
    games: 1, // Math Challenge
    quizzes: 0,
    flashcards: 0,
  });
  const [activeCard, setActiveCard] = useState<'games' | 'quizzes' | 'flashcards' | null>(null);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!hasHydrated) {
      return;
    }

    if (!user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace('/login');
      return;
    }

    // Fetch progress and user profile when user is available and hydrated
    if (user && hasHydrated) {
      fetchProgress();
      // Fetch fresh user profile to ensure username is available
      if (!user.username) {
        fetchUserProfile();
      }
    }
  }, [user, hasHydrated, fetchUserProfile]); // Removed router and progress from deps

  const fetchProgress = async () => {
    if (isLoading === false) {
      setIsLoading(true);
    }
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

      setContentCounts(prev => {
        // Only update if values actually changed to prevent re-renders
        if (prev.quizzes === quizzesCount && prev.flashcards === flashcardsCount) {
          return prev;
        }
        return {
          games: 1, // Currently hardcoded - update when adding more games
          quizzes: quizzesCount || 2, // Fallback to sample count
          flashcards: flashcardsCount || 2, // Fallback to sample count
        };
      });
    } catch (err) {
      // Use fallback counts if API fails
      setContentCounts(prev => {
        if (prev.quizzes === 2 && prev.flashcards === 2) {
          return prev;
        }
        return {
          games: 1,
          quizzes: 2,
          flashcards: 2,
        };
      });
    }
  };

  useEffect(() => {
    // Only fetch once when user is available and hydrated
    if (user && hasHydrated && contentCounts.quizzes === 0 && contentCounts.flashcards === 0) {
      fetchContentCounts();
    }
  }, [user, hasHydrated]); // Only depend on user and hasHydrated

  // If not hydrated yet, AuthProvider will show loading
  if (!hasHydrated) {
    return null;
  }

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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LioArcade</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="flex items-center space-x-3 transition-all duration-300 group hover:scale-105">
                <div className="relative group-hover:ring-2 group-hover:ring-purple-400 group-hover:ring-offset-2 rounded-full transition-all duration-300">
                  <Avatar src={user.profileImage} username={user.username} size="sm" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                {user?.username ? (
                  <UsernameDisplay username={user.username} />
                ) : (
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">User</span>
                )}
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section with Enhanced Animations */}
          <div className="mb-8 relative">
            <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-500 overflow-hidden animate-fade-in">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>
              
              {/* Floating emojis */}
              <div className="absolute top-2 right-4 text-4xl animate-bounce-slow">👋</div>
              <div className="absolute bottom-2 left-4 text-3xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute top-1/2 right-8 text-2xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🌟</div>
              
              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-2 animate-slide-down flex items-center flex-wrap gap-2">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome back,
                  </span>
                  {user?.username ? (
                    <UsernameDisplay username={user.username} className="text-4xl" />
                  ) : (
                    <span className="text-4xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">User</span>
                  )}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">!</span>
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-medium animate-slide-up delay-100">
                  Continue your learning journey 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards with Enhanced Animations */}
          {!isLoading && progress && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total Points Card */}
              <div className="group relative bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-yellow-800/30 rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-yellow-200 dark:border-yellow-700 hover:border-yellow-400 dark:hover:border-yellow-500 overflow-hidden animate-slide-up delay-100">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Sparkles */}
                <div className="absolute top-2 right-2 text-yellow-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping">✨</div>
                <div className="absolute bottom-2 left-2 text-orange-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">⭐</div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Points</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {progress.gamification.points}
                    </p>
                    <div className="text-4xl animate-bounce-slow">⭐</div>
                  </div>
                </div>
              </div>

              {/* Level Card */}
              <div className="group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-800/30 rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden animate-slide-up delay-200">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Sparkles */}
                <div className="absolute top-2 right-2 text-blue-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping">💫</div>
                <div className="absolute bottom-2 left-2 text-indigo-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">✨</div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Level</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {progress.gamification.level}
                    </p>
                    <div className="text-4xl animate-bounce-slow">🎯</div>
                  </div>
                </div>
              </div>

              {/* Badges Card */}
              <div className="group relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-800/30 rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 overflow-hidden animate-slide-up delay-300">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Sparkles */}
                <div className="absolute top-2 right-2 text-purple-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping">🌟</div>
                <div className="absolute bottom-2 left-2 text-pink-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">💎</div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Badges</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {Array.isArray(progress.gamification.badges) ? progress.gamification.badges.length : 0}
                    </p>
                    <div className="text-4xl animate-bounce-slow">🏆</div>
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-800/30 rounded-xl shadow-lg p-5 hover:shadow-2xl transition-all duration-500 hover:scale-110 border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 overflow-hidden animate-slide-up delay-400">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Sparkles */}
                <div className="absolute top-2 right-2 text-green-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping">✨</div>
                <div className="absolute bottom-2 left-2 text-emerald-400 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">⭐</div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Completed</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {progress.statistics.totalCompleted}
                    </p>
                    <div className="text-4xl animate-bounce-slow">✅</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Category Tiles - Games, Quizzes, Flashcards */}
          <div className="mb-8 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Explore Learning Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="animate-tile-enter" 
                style={{ animationDelay: '0ms' }}
                onMouseEnter={() => setActiveCard('games')}
                onMouseLeave={() => setTimeout(() => setActiveCard(null), 5000)}
                onClick={() => {
                  setActiveCard('games');
                  setTimeout(() => setActiveCard(null), 5000);
                }}
              >
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
              <div 
                className="animate-tile-enter" 
                style={{ animationDelay: '150ms' }}
                onMouseEnter={() => setActiveCard('quizzes')}
                onMouseLeave={() => setTimeout(() => setActiveCard(null), 5000)}
                onClick={() => {
                  setActiveCard('quizzes');
                  setTimeout(() => setActiveCard(null), 5000);
                }}
              >
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
              <div 
                className="animate-tile-enter" 
                style={{ animationDelay: '300ms' }}
                onMouseEnter={() => setActiveCard('flashcards')}
                onMouseLeave={() => setTimeout(() => setActiveCard(null), 5000)}
                onClick={() => {
                  setActiveCard('flashcards');
                  setTimeout(() => setActiveCard(null), 5000);
                }}
              >
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
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">📊 Your Progress</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">View detailed progress and achievements</p>
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
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 dark:text-white">🏆 Leaderboard</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">See how you rank against other learners</p>
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

      {/* Interactive Character */}
      <InteractiveCharacter 
        targetCard={activeCard}
        onAnimationComplete={() => setActiveCard(null)}
      />
    </div>
  );
}
