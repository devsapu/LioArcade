'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { ScoreSubmissionModal } from '@/components/ScoreSubmissionModal';
import { useSound } from '@/hooks/useSound';
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
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    pointsEarned?: number;
    levelUp?: boolean;
    newLevel?: number;
    errorMessage?: string;
  }>({
    isOpen: false,
    type: 'success',
  });
  const { playSound, startGameMusic, stopGameMusic } = useSound();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchQuiz();
    
    // Cleanup: stop game music when component unmounts
    return () => {
      stopGameMusic();
    };
  }, [user, router, params.id, stopGameMusic]);

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
        // Start game music when quiz starts
        startGameMusic();
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
    playSound('click');
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setAnswers([...answers, selectedAnswer]);

    // Play sound effect
    if (isCorrect) {
      playSound('correct');
      setScore(score + 1);
    } else {
      playSound('incorrect');
    }

    // Show feedback for 1.5 seconds, then move to next question
    setTimeout(() => {
      setFeedback(null);
      setSelectedAnswer(null);
      
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setGameState('finished');
        // Stop game music and play victory sound
        stopGameMusic();
        playSound('victory');
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
      
      // Play game complete sound
      playSound('gameComplete');
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        pointsEarned: response.data?.pointsEarned,
        levelUp: response.data?.levelUp,
        newLevel: response.data?.newLevel,
      });
      
      // Trigger a custom event to refresh progress/leaderboard if those pages are open
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('scoreSubmitted'));
      }
    } catch (error: any) {
      console.error('Failed to submit score:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to submit score';
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        errorMessage,
      });
      
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content/quizzes">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LioArcade</h1>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <span className="text-gray-600 dark:text-gray-300">{quiz?.title || 'Quiz'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/content/quizzes" className="group relative">
                <div className="relative px-4 py-2 bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 text-gray-800 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-gray-300 hover:border-blue-400 overflow-hidden">
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg blur-sm"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 rounded-md group-hover:from-white group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-500"></div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1 left-2 text-blue-400 text-sm animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                    <div className="absolute bottom-1 right-2 text-purple-400 text-sm animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300">←</span>
                    <span className="group-hover:font-semibold transition-all duration-300">Back to Quizzes</span>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center transform transition-all duration-500 animate-scale-in overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Animated Confetti Background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                >
                  {['🎉', '⭐', '✨', '🎊', '🌟'][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Celebration Icon with Animation */}
              <div className="mb-6 flex justify-center animate-bounce-in">
                <div className="relative">
                  <div className="text-7xl animate-bounce-slow">🎉</div>
                  <div className="absolute inset-0 text-7xl animate-ping opacity-75">🎉</div>
                </div>
              </div>

              {/* Title with Slide-in Animation */}
              <h2 className="text-4xl font-bold mb-6 text-gray-900 animate-slide-down">
                Quiz Complete!
              </h2>
              
              {!showResult ? (
                <>
                  {/* Score Display with Staggered Animation */}
                  <div className="space-y-4 mb-8 animate-fade-in-up">
                    <div className="text-2xl font-semibold text-gray-800 animate-slide-up delay-100">
                      <span className="text-gray-600">Your Score:</span>{' '}
                      <span className="text-primary-600 text-3xl">{score}/{totalQuestions}</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 animate-slide-up delay-200">
                      <span className="text-gray-600">Accuracy:</span>{' '}
                      <span className="text-green-600 text-3xl">{percentage}%</span>
                    </div>
                    {percentage === 100 && (
                      <div className="text-3xl text-yellow-600 font-bold animate-scale-bounce delay-300 mt-4">
                        🏆 Perfect Score! 🏆
                      </div>
                    )}
                    {percentage >= 80 && percentage < 100 && (
                      <div className="text-2xl text-green-600 font-semibold animate-scale-bounce delay-300 mt-4">
                        🌟 Great Job! 🌟
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button with Enhanced Styling */}
                  <Button
                    variant="primary"
                    className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up delay-400"
                    onClick={submitScore}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">📤</span>
                        Submit Score
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Success State with Enhanced Animations */}
                  <div className="space-y-4 mb-8">
                    <div className="text-2xl font-semibold text-gray-800 animate-slide-up delay-100">
                      <span className="text-gray-600">Final Score:</span>{' '}
                      <span className="text-primary-600 text-3xl">{score}/{totalQuestions}</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 animate-slide-up delay-200">
                      <span className="text-gray-600">Accuracy:</span>{' '}
                      <span className="text-green-600 text-3xl">{percentage}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-lg text-green-600 font-semibold animate-slide-up delay-300 mt-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <span className="text-2xl animate-bounce">✅</span>
                      <span>Score submitted successfully!</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Action Buttons with Colorful Animations */}
                  <div className="space-y-4 animate-fade-in-up delay-400">
                    <Link 
                      href="/content/quizzes"
                      className="block group relative"
                    >
                      <div className="relative w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-white/50 overflow-hidden animate-gradient-shift">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Sparkle effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 left-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
                          <div className="absolute top-2 right-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
                          <div className="absolute bottom-2 left-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '400ms' }}>💫</div>
                          <div className="absolute bottom-2 right-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '600ms' }}>✨</div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <span className="text-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 animate-bounce-slow">🎯</span>
                          <span className="group-hover:font-bold transition-all duration-300">Take Another Quiz</span>
                          <span className="text-xl group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300">→</span>
                        </div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>
                      </div>
                    </Link>
                    <Link 
                      href="/dashboard"
                      className="block group relative"
                    >
                      <div className="relative w-full py-4 px-6 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 text-gray-800 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gradient-to-r hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 overflow-hidden">
                        {/* Animated gradient border on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-sm"></div>
                        <div className="absolute inset-[2px] bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-lg group-hover:from-white group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-500"></div>
                        
                        {/* Sparkle effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 left-6 text-blue-400 text-lg animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                          <div className="absolute bottom-2 right-6 text-purple-400 text-lg animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <span className="text-xl group-hover:-translate-x-2 group-hover:scale-125 transition-all duration-300">←</span>
                          <span className="group-hover:font-bold transition-all duration-300">Back to Dashboard</span>
                          <span className="text-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">🏠</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Score Submission Modal */}
      <ScoreSubmissionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        pointsEarned={modalState.pointsEarned}
        levelUp={modalState.levelUp}
        newLevel={modalState.newLevel}
        errorMessage={modalState.errorMessage}
      />
    </div>
  );
}
