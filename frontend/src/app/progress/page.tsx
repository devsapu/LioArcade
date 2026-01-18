'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { SocialShare } from '@/components/SocialShare';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ProgressResponse } from '@/types';

export default function ProgressPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<ProgressResponse>('/gamification/progress');
      // Ensure we have valid data before setting
      if (response.data) {
        setProgress(response.data);
      } else {
        setError('No progress data found. Start playing games to track your progress!');
      }
    } catch (err: any) {
      console.error('Failed to fetch progress:', err);
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error || '';
      
      if (status === 404) {
        setError('No progress data found. Start playing games to track your progress!');
      } else if (status === 401 || status === 403) {
        // Token issue - the interceptor should handle refresh, but if it fails, show message
        if (errorMessage.includes('token') || errorMessage.includes('Token') || errorMessage.includes('Invalid')) {
          setError('Authentication error. Please try refreshing the page or log in again.');
        } else {
          setError(errorMessage || 'Authentication required');
        }
      } else {
        setError(errorMessage || 'Failed to load progress');
      }
      setProgress(null); // Clear progress on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Only fetch once when component mounts or user changes
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Removed router and fetchProgress from deps to prevent loops

  // Listen for score submission events to refresh progress
  useEffect(() => {
    const handleScoreSubmitted = () => {
      fetchProgress();
    };

    window.addEventListener('scoreSubmitted', handleScoreSubmitted);
    return () => {
      window.removeEventListener('scoreSubmitted', handleScoreSubmitted);
    };
  }, [fetchProgress]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LioArcade</h1>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <span className="text-gray-600 dark:text-gray-300">Your Progress</span>
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
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 Your Progress</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Track your learning journey and achievements</p>
          </div>
          <div className="flex items-center space-x-3">
            {progress && user && (
              <SocialShare
                title="My Learning Progress on LioArcade"
                text={`📊 Check out my learning progress on LioArcade!`}
                level={progress.gamification.level}
                badge={Array.isArray(progress.gamification.badges) && progress.gamification.badges.length > 0 
                  ? progress.gamification.badges[0].name 
                  : undefined}
                username={user.username}
                achievementType="progress"
              />
            )}
            <Button variant="secondary" onClick={fetchProgress} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading your progress...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">No Progress Yet</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <div className="flex justify-center space-x-4">
                <Button variant="secondary" onClick={fetchProgress}>
                  Refresh
                </Button>
                <Link href="/content/games">
                  <Button variant="primary">Start Playing Games</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : progress ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {progress.gamification.points}
                    </p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Level</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {progress.gamification.level}
                    </p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Badges Earned</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {Array.isArray(progress.gamification.badges) 
                        ? progress.gamification.badges.length 
                        : 0}
                    </p>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {progress.statistics.totalCompleted}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            {Array.isArray(progress.gamification.badges) && progress.gamification.badges.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">🏅 Your Badges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {progress.gamification.badges.map((badge: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border-2 border-yellow-200 dark:border-yellow-700"
                    >
                      <div className="text-4xl">{badge.icon || '🏅'}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg dark:text-white">{badge.name}</p>
                        {badge.earnedAt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">📈 Statistics by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {progress.statistics.byType.QUIZ || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quizzes Completed</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-4xl mb-2">🎴</div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {progress.statistics.byType.FLASHCARD || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Flashcards Completed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-4xl mb-2">🎮</div>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {progress.statistics.byType.MINI_GAME || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mini-Games Completed</p>
                </div>
              </div>
            </div>

            {progress.recentProgress.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">🕐 Recent Activity</h2>
                <div className="space-y-3">
                  {progress.recentProgress.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {item.content?.type === 'QUIZ' ? '📝' : 
                           item.content?.type === 'FLASHCARD' ? '🎴' : '🎮'}
                        </div>
                        <div>
                          <p className="font-semibold text-lg dark:text-white">{item.content?.title || 'Unknown Content'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.content?.type} • {item.content?.category || 'Uncategorized'} • 
                            {' '}Attempts: {item.attempts}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.score !== null && item.score !== undefined && (
                          <p className="font-semibold text-primary-600 dark:text-primary-400 text-lg">
                            Score: {item.score}
                          </p>
                        )}
                        {item.completedAt && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.completedAt).toLocaleDateString()} at{' '}
                            {new Date(item.completedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">No Recent Activity</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Start playing games to see your activity here!</p>
                <Link href="/content/games">
                  <Button variant="primary">Browse Games</Button>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
