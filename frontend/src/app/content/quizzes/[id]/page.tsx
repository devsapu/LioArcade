'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Content } from '@/types';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

type GameState = 'loading' | 'playing' | 'reviewing' | 'finished';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<Content | null>(null);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQuiz();
  }, [user, router, params.id]);

  const fetchQuiz = async () => {
    try {
      const quizId = params.id as string;
      
      // For sample quizzes, create them locally
      if (quizId.startsWith('sample-')) {
        const sampleQuizzes: Record<string, Content> = {
          'sample-1': {
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
          'sample-2': {
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
        };
        
        setQuiz(sampleQuizzes[quizId] || sampleQuizzes['sample-1']);
        setGameState('playing');
        return;
      }

      // Fetch from API
      const response = await apiClient.get<Content>(`/content/${quizId}`);
      setQuiz(response.data);
      setGameState('playing');
    } catch (err: any) {
      console.error('Failed to fetch quiz:', err);
      router.push('/content/quizzes');
    }
  };

  const questions: Question[] = quiz?.contentData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSelect = (index: number) => {
    if (feedback !== null) return; // Don't allow changing answer after feedback
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setAnswers([...answers, selectedAnswer]);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Show feedback for 1.5 seconds, then move to next question
    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setGameState('finished');
      }
    }, 1500);
  }, [selectedAnswer, currentQuestion, answers, score, currentQuestionIndex, totalQuestions]);

  const submitScore = async () => {
    if (!quiz || !user) return;

    setIsSubmitting(true);
    try {
      const percentage = (score / totalQuestions) * 100;
      
      // Prepare request payload
      const payload: any = {
        contentId: quiz.id,
        score: score,
        maxScore: totalQuestions,
      };
      
      // For sample quizzes, include the quiz data so backend can create it
      if (quiz.id.startsWith('sample-')) {
        payload.sampleQuizData = {
          type: quiz.type,
          title: quiz.title,
          description: quiz.description,
          contentData: quiz.contentData,
          category: quiz.category,
          difficultyLevel: quiz.difficultyLevel,
        };
      }
      
      const response = await apiClient.post('/gamification/submit-score', payload);

      setShowResult(true);
      
      // Show success message
      if (response.data?.pointsEarned) {
        alert(`🎉 Score submitted! You earned ${response.data.pointsEarned} points! ${response.data.levelUp ? 'Level up! 🚀' : ''}`);
      }
      
      // Trigger a custom event to refresh progress/leaderboard if those pages are open
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('scoreSubmitted'));
      }
    } catch (error: any) {
      console.error('Failed to submit score:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to submit score';
      alert(`Error: ${errorMessage}`);
      // Still show result even if submission fails
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content/quizzes">
                <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{quiz?.title || 'Quiz'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/content/quizzes">
                <Button variant="secondary">Back to Quizzes</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gameState === 'loading' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-sm font-medium text-primary-600">
                  Score: {score}/{totalQuestions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Animated Owl Character */}
            <div className="mb-6 flex justify-center">
              <div className={`relative transition-all duration-500 ${
                feedback === 'correct' 
                  ? 'animate-bounce' 
                  : feedback === 'incorrect' 
                  ? 'animate-shake' 
                  : ''
              }`}>
                <div className={`text-8xl transition-all duration-500 ${
                  feedback === 'correct' 
                    ? 'scale-125 rotate-12' 
                    : feedback === 'incorrect' 
                    ? 'scale-90 -rotate-12 opacity-75' 
                    : 'scale-100'
                }`}>
                  {feedback === 'correct' ? (
                    <span className="inline-block animate-bounce">🦉</span>
                  ) : feedback === 'incorrect' ? (
                    <span className="inline-block">😔</span>
                  ) : (
                    <span className="inline-block">🦉</span>
                  )}
                </div>
                {/* Celebration particles for correct */}
                {feedback === 'correct' && (
                  <>
                    <div className="absolute -top-4 -left-4 text-3xl animate-ping" style={{ animationDelay: '0ms' }}>🎉</div>
                    <div className="absolute -top-4 -right-4 text-3xl animate-ping" style={{ animationDelay: '150ms' }}>⭐</div>
                    <div className="absolute -bottom-4 -left-2 text-3xl animate-ping" style={{ animationDelay: '300ms' }}>✨</div>
                    <div className="absolute -bottom-4 -right-2 text-3xl animate-ping" style={{ animationDelay: '450ms' }}>🎊</div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>🎈</div>
                  </>
                )}
                {/* Encouragement for incorrect */}
                {feedback === 'incorrect' && (
                  <>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">💪</div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-2xl">💭</div>
                  </>
                )}
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`mb-6 transition-all duration-300 ${
                feedback === 'correct' 
                  ? 'animate-fade-in' 
                  : 'animate-shake'
              }`}>
                <div className={`text-3xl font-bold text-center mb-2 ${
                  feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedback === 'correct' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>🎉</span>
                      <span>Excellent! You got it right!</span>
                      <span>🎉</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>😔</span>
                      <span>Not quite, but keep trying!</span>
                      <span>💪</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = feedback !== null && isCorrect;
                  const showIncorrect = feedback !== null && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={feedback !== null}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        showCorrect
                          ? 'bg-green-100 border-2 border-green-500'
                          : showIncorrect
                          ? 'bg-red-100 border-2 border-red-500'
                          : isSelected
                          ? 'bg-primary-100 border-2 border-primary-500'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      } ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{option}</span>
                        {showCorrect && <span className="text-2xl">✓</span>}
                        {showIncorrect && <span className="text-2xl">✗</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || feedback !== null}
                className="px-8"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            
            {!showResult ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="text-xl">
                    <span className="font-semibold">Your Score:</span> {score}/{totalQuestions}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold">Accuracy:</span> {percentage}%
                  </div>
                  {percentage === 100 && (
                    <div className="text-2xl text-yellow-600 font-bold">
                      🏆 Perfect Score! 🏆
                    </div>
                  )}
                  {percentage >= 80 && percentage < 100 && (
                    <div className="text-xl text-green-600 font-semibold">
                      🌟 Great Job! 🌟
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="w-full mb-3"
                  onClick={submitScore}
                  isLoading={isSubmitting}
                >
                  Submit Score
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="text-xl">
                    <span className="font-semibold">Final Score:</span> {score}/{totalQuestions}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold">Accuracy:</span> {percentage}%
                  </div>
                  <div className="text-lg text-green-600 font-semibold">
                    ✅ Score submitted successfully!
                  </div>
                </div>
                <div className="space-y-3">
                  <Link href="/content/quizzes">
                    <Button variant="primary" className="w-full">
                      Take Another Quiz
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="secondary" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
