'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Content } from '@/types';

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [flashcards, setFlashcards] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchFlashcards();
  }, [user, router]);

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/content', {
        params: {
          type: 'FLASHCARD',
          limit: 50,
        },
      });
      setFlashcards(response.data.content || []);
    } catch (err: any) {
      console.error('Failed to fetch flashcards:', err);
      setError(err.response?.data?.error || 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Sample flashcards if none exist
  const sampleFlashcards: Content[] = [
    {
      id: 'sample-flashcard-1',
      type: 'FLASHCARD',
      title: 'Basic Vocabulary',
      description: 'Learn essential vocabulary words',
      category: 'Language',
      difficultyLevel: 'BEGINNER',
      contentData: {
        cards: [
          {
            front: 'Hello',
            back: 'A greeting used when meeting someone',
          },
          {
            front: 'Thank you',
            back: 'An expression of gratitude',
          },
          {
            front: 'Please',
            back: 'A polite way to ask for something',
          },
        ],
      },
      createdById: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-flashcard-2',
      type: 'FLASHCARD',
      title: 'Math Terms',
      description: 'Learn important math terminology',
      category: 'Mathematics',
      difficultyLevel: 'BEGINNER',
      contentData: {
        cards: [
          {
            front: 'Addition',
            back: 'The process of combining two or more numbers',
          },
          {
            front: 'Subtraction',
            back: 'The process of taking away one number from another',
          },
          {
            front: 'Multiplication',
            back: 'The process of adding a number to itself a certain number of times',
          },
        ],
      },
      createdById: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayFlashcards = flashcards.length > 0 ? flashcards : sampleFlashcards;

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
              <span className="text-gray-600 dark:text-gray-300">Flashcards</span>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎴 Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Study efficiently with spaced repetition!</p>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading flashcards...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">Error Loading Flashcards</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <Button variant="primary" onClick={fetchFlashcards}>
                Try Again
              </Button>
            </div>
          </div>
        ) : displayFlashcards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold mb-2 dark:text-white">No Flashcards Available</h2>
            <p className="text-gray-600 dark:text-gray-300">Check back soon for new flashcards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFlashcards.map((flashcard) => (
              <Link
                key={flashcard.id}
                href={`/content/flashcards/${flashcard.id}`}
                className="group block"
                onClick={(e) => {
                  console.log(`[Flashcards] Clicked flashcard: ${flashcard.id}, navigating to: /content/flashcards/${flashcard.id}`);
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full border border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 text-white">
                    <div className="text-5xl mb-2">🎴</div>
                    <h2 className="text-2xl font-bold mb-1">{flashcard.title}</h2>
                    {flashcard.difficultyLevel && (
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <span>📊</span>
                        <span>{flashcard.difficultyLevel}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{flashcard.description || 'Study and memorize!'}</p>
                    {flashcard.category && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category: {flashcard.category}</p>
                    )}
                    {flashcard.contentData?.cards && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {Array.isArray(flashcard.contentData.cards) 
                          ? `${flashcard.contentData.cards.length} cards`
                          : 'Multiple cards'}
                      </p>
                    )}
                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-500">
                      <span>Start Studying</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
