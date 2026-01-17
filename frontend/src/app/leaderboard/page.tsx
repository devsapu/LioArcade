'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { LeaderboardEntry } from '@/types';
import { Avatar } from '@/components/Avatar';

type CategoryFilter = 'OVERALL' | 'QUIZ' | 'FLASHCARD' | 'MINI_GAME';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [champions, setChampions] = useState<Record<string, LeaderboardEntry | null>>({
    OVERALL: null,
    QUIZ: null,
    FLASHCARD: null,
    MINI_GAME: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'level'>('points');
  const [limit, setLimit] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('OVERALL');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const contentType = categoryFilter === 'OVERALL' ? undefined : categoryFilter;
      console.log(`[Leaderboard] Fetching leaderboard - Category: ${categoryFilter}, ContentType: ${contentType}, SortBy: ${sortBy}`);
      
      const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>('/gamification/leaderboard', {
        params: {
          by: sortBy,
          limit: limit,
          contentType: contentType,
        },
      });
      
      console.log(`[Leaderboard] Received ${response.data?.leaderboard?.length || 0} entries`);
      
      // Ensure we have valid data before setting
      if (response.data && Array.isArray(response.data.leaderboard)) {
        setLeaderboard(response.data.leaderboard);
        console.log(`[Leaderboard] Leaderboard updated with ${response.data.leaderboard.length} entries`);
      } else {
        console.warn('[Leaderboard] Invalid response data:', response.data);
        setLeaderboard([]);
      }
    } catch (err: any) {
      console.error('[Leaderboard] Failed to fetch leaderboard:', err);
      console.error('[Leaderboard] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.error || 'Failed to load leaderboard');
      setLeaderboard([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, limit, categoryFilter]);

  // Fetch champions for each category
  const fetchChampions = useCallback(async () => {
    try {
      const categories: CategoryFilter[] = ['OVERALL', 'QUIZ', 'FLASHCARD', 'MINI_GAME'];
      const championsData: Record<string, LeaderboardEntry | null> = {};

      for (const category of categories) {
        try {
          const contentType = category === 'OVERALL' ? undefined : category;
          const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>('/gamification/leaderboard', {
            params: {
              by: 'points',
              limit: 1,
              contentType: contentType,
            },
          });
          championsData[category] = response.data?.leaderboard?.[0] || null;
        } catch (err) {
          championsData[category] = null;
        }
      }

      setChampions(championsData);
    } catch (err) {
      console.error('Failed to fetch champions:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchLeaderboard();
    fetchChampions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sortBy, limit, categoryFilter, fetchLeaderboard, fetchChampions]); // Removed router from deps

  // Listen for score submission events to refresh leaderboard
  useEffect(() => {
    const handleScoreSubmitted = () => {
      console.log('Score submitted event received, refreshing leaderboard...');
      fetchLeaderboard();
      fetchChampions();
    };

    window.addEventListener('scoreSubmitted', handleScoreSubmitted);
    return () => {
      window.removeEventListener('scoreSubmitted', handleScoreSubmitted);
    };
  }, [fetchLeaderboard, fetchChampions]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.findIndex(entry => entry.user.id === user.id) + 1;
  };

  const userRank = getUserRank();
  const userEntry = leaderboard.find(entry => entry.user.id === user?.id);

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
              <span className="text-gray-600">Leaderboard</span>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏆 {categoryFilter === 'OVERALL' ? 'Overall' : 
                   categoryFilter === 'QUIZ' ? 'Quiz' :
                   categoryFilter === 'FLASHCARD' ? 'Flashcard' : 'Game'} Leaderboard
            </h1>
            <p className="text-gray-600 text-lg">
              {categoryFilter === 'OVERALL' 
                ? 'See how you rank overall across all categories'
                : `See how you rank in ${categoryFilter === 'QUIZ' ? 'quizzes' : categoryFilter === 'FLASHCARD' ? 'flashcards' : 'mini-games'}`}
            </p>
          </div>
          <Button variant="secondary" onClick={() => { fetchLeaderboard(); fetchChampions(); }} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>

        {/* Champion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Overall Champion */}
          <div 
            className={`bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
              categoryFilter === 'OVERALL' ? 'ring-4 ring-yellow-300' : ''
            }`}
            onClick={() => setCategoryFilter('OVERALL')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👑</span>
              <span className="text-xs font-semibold bg-white/30 px-2 py-1 rounded">Overall</span>
            </div>
            {champions.OVERALL ? (
              <>
                <div className="text-white font-bold text-lg mb-1">{champions.OVERALL.user.username}</div>
                <div className="text-white/90 text-sm">{champions.OVERALL.points.toLocaleString()} pts</div>
              </>
            ) : (
              <div className="text-white/80 text-sm">No champion yet</div>
            )}
          </div>

          {/* Quiz Champion */}
          <div 
            className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
              categoryFilter === 'QUIZ' ? 'ring-4 ring-blue-300' : ''
            }`}
            onClick={() => setCategoryFilter('QUIZ')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📝</span>
              <span className="text-xs font-semibold bg-white/30 px-2 py-1 rounded">Quizzes</span>
            </div>
            {champions.QUIZ ? (
              <>
                <div className="text-white font-bold text-lg mb-1">{champions.QUIZ.user.username}</div>
                <div className="text-white/90 text-sm">{champions.QUIZ.points.toLocaleString()} pts</div>
              </>
            ) : (
              <div className="text-white/80 text-sm">No champion yet</div>
            )}
          </div>

          {/* Flashcard Champion */}
          <div 
            className={`bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
              categoryFilter === 'FLASHCARD' ? 'ring-4 ring-green-300' : ''
            }`}
            onClick={() => setCategoryFilter('FLASHCARD')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎴</span>
              <span className="text-xs font-semibold bg-white/30 px-2 py-1 rounded">Flashcards</span>
            </div>
            {champions.FLASHCARD ? (
              <>
                <div className="text-white font-bold text-lg mb-1">{champions.FLASHCARD.user.username}</div>
                <div className="text-white/90 text-sm">{champions.FLASHCARD.points.toLocaleString()} pts</div>
              </>
            ) : (
              <div className="text-white/80 text-sm">No champion yet</div>
            )}
          </div>

          {/* Game Champion */}
          <div 
            className={`bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg p-4 cursor-pointer transition-transform hover:scale-105 ${
              categoryFilter === 'MINI_GAME' ? 'ring-4 ring-purple-300' : ''
            }`}
            onClick={() => setCategoryFilter('MINI_GAME')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎮</span>
              <span className="text-xs font-semibold bg-white/30 px-2 py-1 rounded">Games</span>
            </div>
            {champions.MINI_GAME ? (
              <>
                <div className="text-white font-bold text-lg mb-1">{champions.MINI_GAME.user.username}</div>
                <div className="text-white/90 text-sm">{champions.MINI_GAME.points.toLocaleString()} pts</div>
              </>
            ) : (
              <div className="text-white/80 text-sm">No champion yet</div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {(['OVERALL', 'QUIZ', 'FLASHCARD', 'MINI_GAME'] as CategoryFilter[]).map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'OVERALL' ? '🌟 Overall' : 
                 category === 'QUIZ' ? '📝 Quizzes' :
                 category === 'FLASHCARD' ? '🎴 Flashcards' : '🎮 Games'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => setSortBy('points')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'points'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setSortBy('level')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'level'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Level
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
        </div>

        {/* User's Rank Card */}
        {userEntry && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Your Rank</p>
                <p className="text-3xl font-bold">
                  {userRank ? `${getRankIcon(userRank)} Rank #${userRank}` : 'Not Ranked'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Your Stats</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-2xl font-bold">{userEntry.points}</p>
                    <p className="text-xs opacity-90">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userEntry.level}</p>
                    <p className="text-xs opacity-90">Level</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Array.isArray(userEntry.badges) ? userEntry.badges.length : 0}
                    </p>
                    <p className="text-xs opacity-90">Badges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-2">Error Loading Leaderboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button variant="primary" onClick={fetchLeaderboard}>
                Try Again
              </Button>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold mb-2">No Rankings Yet</h2>
            <p className="text-gray-600 mb-6">Be the first to play and earn points!</p>
            <Link href="/content/games">
              <Button variant="primary">Start Playing</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badges
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.user.id === user?.id;
                    return (
                      <tr
                        key={entry.user.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getRankIcon(entry.rank)}</span>
                            <span className={`text-lg font-semibold ${
                              entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-700'
                            }`}>
                              {entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={entry.user.profileImage}
                              username={entry.user.username}
                              size="sm"
                            />
                            <div className={`text-sm font-medium ${
                              isCurrentUser ? 'text-primary-700 font-bold' : 'text-gray-900'
                            }`}>
                              {entry.user.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-1">⭐</span>
                            <span className={`text-lg font-semibold ${
                              isCurrentUser ? 'text-primary-700' : 'text-gray-900'
                            }`}>
                              {entry.points.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-1">🎯</span>
                            <span className={`text-lg font-semibold ${
                              isCurrentUser ? 'text-primary-700' : 'text-gray-900'
                            }`}>
                              {entry.level}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {Array.isArray(entry.badges) && entry.badges.length > 0 ? (
                              <>
                                {entry.badges.slice(0, 3).map((badge: any, idx: number) => (
                                  <span key={idx} className="text-2xl" title={badge.name}>
                                    {badge.icon || '🏅'}
                                  </span>
                                ))}
                                {entry.badges.length > 3 && (
                                  <span className="text-sm text-gray-500 ml-1">
                                    +{entry.badges.length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 How Rankings Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Category Rankings</p>
              <p>
                {categoryFilter === 'OVERALL' 
                  ? 'Overall rankings combine points from all categories (Quizzes, Flashcards, Games)'
                  : `This leaderboard shows rankings based on points earned from ${categoryFilter === 'QUIZ' ? 'quizzes' : categoryFilter === 'FLASHCARD' ? 'flashcards' : 'mini-games'} only`}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Points Calculation</p>
              <p>
                {categoryFilter === 'QUIZ' 
                  ? 'Quizzes: 10-50 points based on score percentage'
                  : categoryFilter === 'FLASHCARD'
                  ? 'Flashcards: 5 points per card studied'
                  : categoryFilter === 'MINI_GAME'
                  ? 'Games: 20-100 points based on score percentage'
                  : 'Points vary by category: Quizzes (10-50), Flashcards (5 per card), Games (20-100)'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Top Performers</p>
              <p>The top 3 players get special medals 🥇🥈🥉. Click champion cards above to view category-specific rankings!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
