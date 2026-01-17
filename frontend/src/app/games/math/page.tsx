'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { ScoreSubmissionModal } from '@/components/ScoreSubmissionModal';
import { useSound } from '@/hooks/useSound';
import Link from 'next/link';
import apiClient from '@/lib/api';

type Operation = '+' | '-' | '*';
type GameState = 'menu' | 'playing' | 'finished';

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

export default function MathGamePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Generate random problem based on difficulty
  const generateProblem = useCallback((): Problem => {
    let num1: number, num2: number, operation: Operation;

    switch (difficulty) {
      case 'easy':
        operation = Math.random() > 0.5 ? '+' : '-';
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        break;
      case 'medium':
        operation = ['+', '-', '*'][Math.floor(Math.random() * 3)] as Operation;
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        break;
      case 'hard':
        operation = ['+', '-', '*'][Math.floor(Math.random() * 3)] as Operation;
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
        break;
    }

    let answer: number;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    return { num1, num2, operation, answer };
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setTotalProblems(0);
    setCorrectAnswers(0);
    setUserAnswer('');
    setFeedback(null);
    setCurrentProblem(generateProblem());
    // Start game music when game starts
    startGameMusic();
  };

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentProblem || !userAnswer) return;

    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentProblem.answer;

    setTotalProblems(prev => prev + 1);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Play sound effect
    if (isCorrect) {
      playSound('correct');
      const pointsEarned = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
      setScore(prev => prev + pointsEarned);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
    }

    // Clear feedback after 1 second and generate new problem
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      setCurrentProblem(generateProblem());
    }, 1000);
  }, [currentProblem, userAnswer, difficulty, generateProblem]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameState === 'playing' && userAnswer) {
        handleSubmit();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameState, userAnswer, handleSubmit]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          // Stop game music and play victory sound
          stopGameMusic();
          playSound('victory');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Submit score to backend
  const submitScore = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;
      
      // Create math game content data for submission
      const mathGameContent = {
        type: 'MINI_GAME' as const,
        title: `Math Challenge - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
        description: `Math game with ${difficulty} difficulty. Score: ${correctAnswers}/${totalProblems} (${accuracy.toFixed(1)}% accuracy)`,
        contentData: {
          gameType: 'math',
          difficulty: difficulty,
          totalProblems: totalProblems,
          correctAnswers: correctAnswers,
          score: score,
          timeLimit: 60,
        },
        category: 'Mathematics',
        difficultyLevel: difficulty === 'easy' ? 'BEGINNER' : difficulty === 'medium' ? 'INTERMEDIATE' : 'ADVANCED' as const,
      };

      // Submit score with content creation (like sample quizzes)
      const payload: any = {
        contentId: `math-game-${difficulty}-${Date.now()}`, // Temporary ID
        score: correctAnswers,
        maxScore: totalProblems,
        sampleQuizData: mathGameContent, // Backend accepts this for any content type
      };

      console.log('Submitting math game score:', payload);
      const response = await apiClient.post('/gamification/submit-score', payload);
      console.log('Score submission response:', response.data);

      // Play game complete sound
      playSound('gameComplete');
      
      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        pointsEarned: response.data?.pointsEarned,
        levelUp: response.data?.levelUp,
        newLevel: response.data?.newLevel,
        message: response.data?.pointsEarned 
          ? undefined 
          : `You earned points with ${accuracy.toFixed(1)}% accuracy!`,
      });
      
      // Trigger a custom event to refresh progress/leaderboard if those pages are open
      if (typeof window !== 'undefined') {
        console.log('Dispatching scoreSubmitted event');
        window.dispatchEvent(new CustomEvent('scoreSubmitted'));
      }
    } catch (error: any) {
      console.error('Failed to submit score:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || error.message || 'Failed to submit score';
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    
    // Cleanup: stop game music when component unmounts
    return () => {
      stopGameMusic();
    };
  }, [user, router, stopGameMusic]);

  if (!user) {
    return null;
  }

  const getOperationSymbol = (op: Operation) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
    }
  };

  const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="group relative">
                <div className="relative px-4 py-2 bg-gradient-to-r from-gray-100 via-purple-50 to-pink-50 text-gray-800 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-gray-300 hover:border-purple-400 overflow-hidden">
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg blur-sm"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-r from-gray-100 via-purple-50 to-pink-50 rounded-md group-hover:from-white group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-500"></div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1 left-2 text-purple-400 text-sm animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                    <div className="absolute bottom-1 right-2 text-pink-400 text-sm animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300">←</span>
                    <span className="group-hover:font-semibold transition-all duration-300">Back to Dashboard</span>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧮 Math Challenge</h1>
          <p className="text-gray-600">Test your math skills and earn points!</p>
        </div>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Choose Difficulty</h2>
            <div className="space-y-4">
              <button
                onClick={() => setDifficulty('easy')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'easy'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-xl font-semibold mb-1">Easy</div>
                <div className="text-sm text-gray-600">Numbers 1-20, Addition & Subtraction</div>
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'medium'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-xl font-semibold mb-1">Medium</div>
                <div className="text-sm text-gray-600">Numbers 1-50, All Operations</div>
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'hard'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-xl font-semibold mb-1">Hard</div>
                <div className="text-sm text-gray-600">Numbers 1-100, All Operations</div>
              </button>
            </div>
            <Button
              variant="primary"
              className="w-full mt-6"
              onClick={startGame}
            >
              Start Game
            </Button>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{timeLeft}s</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{streak}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalProblems}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
            </div>

            {/* Problem Display */}
            {currentProblem && (
              <div className="text-center mb-8">
                {/* Animated Teddy Bear */}
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
                        <span className="inline-block animate-bounce">🐻</span>
                      ) : feedback === 'incorrect' ? (
                        <span className="inline-block">😢</span>
                      ) : (
                        <span className="inline-block">🧸</span>
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
                  <div className={`mb-4 transition-all duration-300 ${
                    feedback === 'correct' 
                      ? 'animate-fade-in' 
                      : 'animate-shake'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {feedback === 'correct' ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span>🎉</span>
                          <span>Excellent! Great job!</span>
                          <span>🎉</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>😢</span>
                          <span>Don't worry, try again!</span>
                          <span>💪</span>
                        </span>
                      )}
                    </div>
                    {feedback === 'correct' && streak > 1 && (
                      <div className="text-xl text-orange-600 font-semibold">
                        🔥 {streak} in a row! Keep it up! 🔥
                      </div>
                    )}
                  </div>
                )}

                <div className="text-6xl font-bold text-gray-900 mb-4">
                  {currentProblem.num1} {getOperationSymbol(currentProblem.operation)} {currentProblem.num2} = ?
                </div>
                <div className="flex justify-center items-center space-x-4">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    className={`text-4xl font-bold text-center w-32 px-4 py-2 border-2 rounded-lg focus:outline-none transition-all ${
                      feedback === 'correct' 
                        ? 'border-green-500 bg-green-50' 
                        : feedback === 'incorrect' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-primary-500'
                    }`}
                    autoFocus
                    disabled={feedback !== null}
                  />
                </div>
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={handleSubmit}
                  disabled={!userAnswer || feedback !== null}
                >
                  Submit Answer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Finished Screen */}
        {gameState === 'finished' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <div className="space-y-3 mb-6">
              <div className="text-xl">
                <span className="font-semibold">Final Score:</span> {score} points
              </div>
              <div className="text-xl">
                <span className="font-semibold">Accuracy:</span> {accuracy.toFixed(1)}%
              </div>
              <div className="text-xl">
                <span className="font-semibold">Problems Solved:</span> {correctAnswers}/{totalProblems}
              </div>
              {streak > 0 && (
                <div className="text-xl text-orange-600">
                  <span className="font-semibold">Best Streak:</span> {streak}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <button
                onClick={submitScore}
                disabled={isSubmitting}
                className="relative w-full py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-white/50 overflow-hidden animate-gradient-shift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
                  <div className="absolute top-2 right-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
                  <div className="absolute bottom-2 left-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '400ms' }}>💫</div>
                  <div className="absolute bottom-2 right-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '600ms' }}>✨</div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl hover:rotate-12 hover:scale-125 transition-all duration-300 animate-bounce-slow">📤</span>
                      <span className="hover:font-bold transition-all duration-300">Submit Score</span>
                    </>
                  )}
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="relative w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-white/50 overflow-hidden animate-gradient-shift"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
                  <div className="absolute top-2 right-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  <span className="text-2xl hover:rotate-12 hover:scale-125 transition-all duration-300 animate-bounce-slow">🎮</span>
                  <span className="hover:font-bold transition-all duration-300">Play Again</span>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </button>
              <Link href="/dashboard" className="block group relative">
                <div className="relative w-full py-4 px-6 bg-gradient-to-r from-gray-50 via-purple-50 to-pink-50 text-gray-800 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gradient-to-r hover:from-purple-400 hover:via-pink-400 hover:to-red-400 overflow-hidden">
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-sm"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-r from-gray-50 via-purple-50 to-pink-50 rounded-lg group-hover:from-white group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-500"></div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 left-6 text-purple-400 text-lg animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                    <div className="absolute bottom-2 right-6 text-pink-400 text-lg animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
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
        message={modalState.message}
        errorMessage={modalState.errorMessage}
      />
    </div>
  );
}
