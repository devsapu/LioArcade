'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Content } from '@/types';

export default function QuizzesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQuizzes();
  }, [user, router]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/content', {
        params: {
          type: 'QUIZ',
          limit: 50,
        },
      });
      setQuizzes(response.data.content || []);
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.response?.data?.error || 'Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Sample quizzes if none exist
  const sampleQuizzes: Content[] = [
    {
      id: 'sample-1',
      type: 'QUIZ',
      title: 'General Knowledge Quiz',
      description: 'Test your knowledge with fun general knowledge questions',
      category: 'General',
      difficultyLevel: 'BEGINNER',
      contentData: {
        questions: [
          {
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 2,
          },
          {
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 1,
          },
          {
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
          },
        ],
      },
      createdById: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      type: 'QUIZ',
      title: 'Science Quiz',
      description: 'Challenge yourself with science questions',
      category: 'Science',
      difficultyLevel: 'INTERMEDIATE',
      contentData: {
        questions: [
          {
            question: 'What is the chemical symbol for water?',
            options: ['H2O', 'CO2', 'O2', 'NaCl'],
            correctAnswer: 0,
          },
          {
            question: 'Which gas do plants absorb from the atmosphere?',
            options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
            correctAnswer: 2,
          },
        ],
      },
      createdById: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayQuizzes = quizzes.length > 0 ? quizzes : sampleQuizzes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Quizzes</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Quizzes</h1>
          <p className="text-gray-600 text-lg">Test your knowledge and earn points!</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-2">Error Loading Quizzes</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button variant="primary" onClick={fetchQuizzes}>
                Try Again
              </Button>
            </div>
          </div>
        ) : displayQuizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold mb-2">No Quizzes Available</h2>
            <p className="text-gray-600">Check back soon for new quizzes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayQuizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/content/quizzes/${quiz.id}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="text-5xl mb-2">📝</div>
                    <h2 className="text-2xl font-bold mb-1">{quiz.title}</h2>
                    {quiz.difficultyLevel && (
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <span>📊</span>
                        <span>{quiz.difficultyLevel}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{quiz.description || 'Test your knowledge!'}</p>
                    {quiz.category && (
                      <p className="text-sm text-gray-500 mb-2">Category: {quiz.category}</p>
                    )}
                    {quiz.contentData?.questions && (
                      <p className="text-sm text-gray-500 mb-4">
                        {Array.isArray(quiz.contentData.questions) 
                          ? `${quiz.contentData.questions.length} questions`
                          : 'Multiple questions'}
                      </p>
                    )}
                    <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                      <span>Start Quiz</span>
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
