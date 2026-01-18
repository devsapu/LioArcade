'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { ScoreSubmissionModal } from '@/components/ScoreSubmissionModal';
import { SocialShare } from '@/components/SocialShare';
import { useSound } from '@/hooks/useSound';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Content } from '@/types';

interface Flashcard {
  front: string;
  back: string;
}

type GameState = 'loading' | 'studying' | 'finished';

export default function FlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [flashcardSet, setFlashcardSet] = useState<Content | null>(null);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
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

    fetchFlashcardSet();
    
    // Cleanup: stop game music when component unmounts
    return () => {
      stopGameMusic();
    };
  }, [user, router, params.id, stopGameMusic]);

  const fetchFlashcardSet = async () => {
    try {
      const setId = params.id as string;
      
      // For sample flashcards, create them locally
      if (setId.startsWith('sample-flashcard-')) {
        const sampleSets: Record<string, Content> = {
          'sample-flashcard-1': {
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
          'sample-flashcard-2': {
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
        };
        
        setFlashcardSet(sampleSets[setId] || sampleSets['sample-flashcard-1']);
        setGameState('studying');
        // Start game music when flashcard study starts
        startGameMusic();
        return;
      }

      // Fetch from API
      const response = await apiClient.get<Content>(`/content/${setId}`);
      setFlashcardSet(response.data);
      setGameState('studying');
      // Start game music when flashcard study starts
      startGameMusic();
    } catch (err: any) {
      console.error('Failed to fetch flashcard set:', err);
      router.push('/content/flashcards');
    }
  };

  const cards: Flashcard[] = flashcardSet?.contentData?.cards || [];
  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSound('click');
  };

  const handleKnow = () => {
    if (!isFlipped) return;
    
    setFeedback('correct');
    playSound('correct');
    if (!studiedCards.includes(currentCardIndex)) {
      setStudiedCards([...studiedCards, currentCardIndex]);
    }

    setTimeout(() => {
      moveToNextCard();
    }, 1000);
  };

  const handleDontKnow = () => {
    if (!isFlipped) return;
    
    setFeedback('incorrect');
    playSound('incorrect');
    
    setTimeout(() => {
      moveToNextCard();
    }, 1000);
  };

  const moveToNextCard = () => {
    setFeedback(null);
    setIsFlipped(false);
    
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setGameState('finished');
      // Stop game music and play victory sound
      stopGameMusic();
      playSound('victory');
    }
  };

  const submitProgress = async () => {
    if (!flashcardSet || !user) return;

    setIsSubmitting(true);
    try {
      // Submit score: 5 points per card studied
      const cardsStudied = studiedCards.length;
      const maxScore = totalCards;
      
      // Prepare request payload
      const payload: any = {
        contentId: flashcardSet.id,
        score: cardsStudied,
        maxScore: maxScore,
      };
      
      // For sample flashcards, include the flashcard data so backend can create it
      if (flashcardSet.id.startsWith('sample-flashcard-')) {
        payload.sampleQuizData = {
          type: flashcardSet.type,
          title: flashcardSet.title,
          description: flashcardSet.description,
          contentData: flashcardSet.contentData,
          category: flashcardSet.category,
          difficultyLevel: flashcardSet.difficultyLevel,
        };
      }
      
      console.log('Submitting flashcard progress:', payload);
      const response = await apiClient.post('/gamification/submit-score', payload);
      console.log('Flashcard submission response:', response.data);

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
        console.log('Dispatching scoreSubmitted event');
        window.dispatchEvent(new CustomEvent('scoreSubmitted'));
      }
    } catch (error: any) {
      console.error('Failed to submit progress:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || error.message || 'Failed to submit progress';
      
      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        errorMessage,
      });
      
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const progress = totalCards > 0 ? Math.round((studiedCards.length / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content/flashcards">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LioArcade</h1>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <span className="text-gray-600 dark:text-gray-300">{flashcardSet?.title || 'Flashcards'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/content/flashcards" className="group relative">
                <div className="relative px-4 py-2 bg-gradient-to-r from-gray-100 via-green-50 to-emerald-50 text-gray-800 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-gray-300 hover:border-green-400 overflow-hidden">
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg blur-sm"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-r from-gray-100 via-green-50 to-emerald-50 rounded-md group-hover:from-white group-hover:via-green-100 group-hover:to-emerald-100 transition-all duration-500"></div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1 left-2 text-green-400 text-sm animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                    <div className="absolute bottom-1 right-2 text-emerald-400 text-sm animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300">←</span>
                    <span className="group-hover:font-semibold transition-all duration-300">Back to Flashcards</span>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading flashcards...</p>
          </div>
        )}

        {gameState === 'studying' && currentCard && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Card {currentCardIndex + 1} of {totalCards}
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Studied: {studiedCards.length}/{totalCards}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                />
              </div>
            </div>

            {/* Animated Rabbit Character */}
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
                    <span className="inline-block animate-bounce">🐰</span>
                  ) : feedback === 'incorrect' ? (
                    <span className="inline-block">😟</span>
                  ) : (
                    <span className="inline-block">🐰</span>
                  )}
                </div>
                {/* Celebration particles for correct */}
                {feedback === 'correct' && (
                  <>
                    <div className="absolute -top-4 -left-4 text-3xl animate-ping" style={{ animationDelay: '0ms' }}>🎉</div>
                    <div className="absolute -top-4 -right-4 text-3xl animate-ping" style={{ animationDelay: '150ms' }}>⭐</div>
                    <div className="absolute -bottom-4 -left-2 text-3xl animate-ping" style={{ animationDelay: '300ms' }}>✨</div>
                    <div className="absolute -bottom-4 -right-2 text-3xl animate-ping" style={{ animationDelay: '450ms' }}>🎊</div>
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
                <div className={`text-2xl font-bold text-center mb-2 ${
                  feedback === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {feedback === 'correct' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>🎉</span>
                      <span>Great! Keep it up!</span>
                      <span>🎉</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>💪</span>
                      <span>Review and try again next time!</span>
                      <span>💪</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Flashcard */}
            <div className="mb-8">
              <div
                className="relative w-full h-64 cursor-pointer"
                onClick={handleFlip}
                style={{
                  perspective: '1000px',
                }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front of Card */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <h2 className="text-3xl font-bold text-white mb-2">Question</h2>
                        <p className="text-2xl text-white font-semibold">{currentCard.front}</p>
                        <p className="text-white/80 mt-4 text-sm">Click to flip</p>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="text-4xl mb-4">💡</div>
                        <h2 className="text-3xl font-bold text-white mb-2">Answer</h2>
                        <p className="text-2xl text-white font-semibold">{currentCard.back}</p>
                        <p className="text-white/80 mt-4 text-sm">Click to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isFlipped && (
              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={handleDontKnow}
                  disabled={feedback !== null}
                  className="px-8 bg-red-500 hover:bg-red-600 text-white"
                >
                  😟 Don't Know
                </Button>
                <Button
                  variant="primary"
                  onClick={handleKnow}
                  disabled={feedback !== null}
                  className="px-8 bg-green-500 hover:bg-green-600"
                >
                  ✅ I Know This
                </Button>
              </div>
            )}

            {!isFlipped && (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Click the card to see the answer</p>
              </div>
            )}
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
                  <div className="text-7xl animate-bounce-slow">🎴</div>
                  <div className="absolute inset-0 text-7xl animate-ping opacity-75">🎴</div>
                </div>
              </div>

              {/* Title with Slide-in Animation */}
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white animate-slide-down">
                Study Complete!
              </h2>
              
              {!showResult ? (
                <>
                  {/* Progress Display with Staggered Animation */}
                  <div className="space-y-4 mb-8 animate-fade-in-up">
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 animate-slide-up delay-100">
                      <span className="text-gray-600 dark:text-gray-400">Cards Studied:</span>{' '}
                      <span className="text-primary-600 dark:text-primary-400 text-3xl">{studiedCards.length}/{totalCards}</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 animate-slide-up delay-200">
                      <span className="text-gray-600 dark:text-gray-400">Progress:</span>{' '}
                      <span className="text-green-600 dark:text-green-400 text-3xl">{progress}%</span>
                    </div>
                    {studiedCards.length === totalCards && (
                      <div className="text-3xl text-yellow-600 dark:text-yellow-400 font-bold animate-scale-bounce delay-300 mt-4">
                        🏆 Perfect! You studied all cards! 🏆
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button with Enhanced Styling */}
                  <Button
                    variant="primary"
                    className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up delay-400"
                    onClick={submitProgress}
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
                        Submit Progress
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Success State with Enhanced Animations */}
                  <div className="space-y-4 mb-8">
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 animate-slide-up delay-100">
                      <span className="text-gray-600 dark:text-gray-400">Cards Studied:</span>{' '}
                      <span className="text-primary-600 dark:text-primary-400 text-3xl">{studiedCards.length}/{totalCards}</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 animate-slide-up delay-200">
                      <span className="text-gray-600 dark:text-gray-400">Progress:</span>{' '}
                      <span className="text-green-600 dark:text-green-400 text-3xl">{progress}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-lg text-green-600 dark:text-green-400 font-semibold animate-slide-up delay-300 mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border-2 border-green-200 dark:border-green-700">
                      <span className="text-2xl animate-bounce">✅</span>
                      <span>Progress submitted successfully!</span>
                    </div>
                  </div>
                  
                  {/* Social Share Button */}
                  {showResult && (
                    <div className="mb-6 flex justify-center animate-fade-in-up delay-300">
                      <SocialShare
                        title={`Flashcards Completed: ${flashcardSet?.title || 'Flashcards'}`}
                        text={`🎴 I just studied flashcards on LioArcade!`}
                        score={studiedCards.length}
                        total={totalCards}
                        username={user?.username}
                        achievementType="flashcard"
                      />
                    </div>
                  )}
                  
                  {/* Enhanced Action Buttons with Colorful Animations */}
                  <div className="space-y-4 animate-fade-in-up delay-400">
                    <Link 
                      href="/content/flashcards"
                      className="block group relative"
                    >
                      <div className="relative w-full py-4 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-white/50 overflow-hidden animate-gradient-shift">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Sparkle effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 left-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
                          <div className="absolute top-2 right-4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
                          <div className="absolute bottom-2 left-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '400ms' }}>💫</div>
                          <div className="absolute bottom-2 right-1/4 text-yellow-300 text-xl animate-ping" style={{ animationDelay: '600ms' }}>✨</div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <span className="text-2xl group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 animate-bounce-slow">🎴</span>
                          <span className="group-hover:font-bold transition-all duration-300">Study Another Set</span>
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
                      <div className="relative w-full py-4 px-6 bg-gradient-to-r from-gray-50 via-green-50 to-emerald-50 text-gray-800 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gradient-to-r hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 overflow-hidden">
                        {/* Animated gradient border on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-sm"></div>
                        <div className="absolute inset-[2px] bg-gradient-to-r from-gray-50 via-green-50 to-emerald-50 rounded-lg group-hover:from-white group-hover:via-green-100 group-hover:to-emerald-100 transition-all duration-500"></div>
                        
                        {/* Sparkle effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 left-6 text-green-400 text-lg animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
                          <div className="absolute bottom-2 right-6 text-emerald-400 text-lg animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
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
