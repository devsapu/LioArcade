'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchFlashcardSet();
  }, [user, router, params.id]);

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
        return;
      }

      // Fetch from API
      const response = await apiClient.get<Content>(`/content/${setId}`);
      setFlashcardSet(response.data);
      setGameState('studying');
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
  };

  const handleKnow = () => {
    if (!isFlipped) return;
    
    setFeedback('correct');
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
    }
  };

  const submitProgress = async () => {
    if (!flashcardSet || !user) return;

    setIsSubmitting(true);
    try {
      // Submit score: 5 points per card studied
      const cardsStudied = studiedCards.length;
      const maxScore = totalCards;
      
      const response = await apiClient.post('/gamification/submit-score', {
        contentId: flashcardSet.id,
        score: cardsStudied,
        maxScore: maxScore,
      });

      setShowResult(true);
      
      // Show success message
      if (response.data?.pointsEarned) {
        alert(`🎉 Progress submitted! You earned ${response.data.pointsEarned} points! ${response.data.levelUp ? 'Level up! 🚀' : ''}`);
      }
      
      // Trigger a custom event to refresh progress/leaderboard if those pages are open
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('scoreSubmitted'));
      }
    } catch (error: any) {
      console.error('Failed to submit progress:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit progress';
      alert(`Error: ${errorMessage}`);
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/content/flashcards">
                <h1 className="text-xl font-bold text-gray-900">LioArcade</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{flashcardSet?.title || 'Flashcards'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/content/flashcards">
                <Button variant="secondary">Back to Flashcards</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gameState === 'loading' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600">Loading flashcards...</p>
          </div>
        )}

        {gameState === 'studying' && currentCard && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Card {currentCardIndex + 1} of {totalCards}
                </span>
                <span className="text-sm font-medium text-primary-600">
                  Studied: {studiedCards.length}/{totalCards}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
                  feedback === 'correct' ? 'text-green-600' : 'text-orange-600'
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
                <p className="text-gray-600 mb-4">Click the card to see the answer</p>
              </div>
            )}
          </div>
        )}

        {gameState === 'finished' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Study Complete!</h2>
            
            {!showResult ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="text-xl">
                    <span className="font-semibold">Cards Studied:</span> {studiedCards.length}/{totalCards}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold">Progress:</span> {progress}%
                  </div>
                  {studiedCards.length === totalCards && (
                    <div className="text-2xl text-yellow-600 font-bold">
                      🏆 Perfect! You studied all cards! 🏆
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="w-full mb-3"
                  onClick={submitProgress}
                  isLoading={isSubmitting}
                >
                  Submit Progress
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="text-xl">
                    <span className="font-semibold">Cards Studied:</span> {studiedCards.length}/{totalCards}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold">Progress:</span> {progress}%
                  </div>
                  <div className="text-lg text-green-600 font-semibold">
                    ✅ Progress submitted successfully!
                  </div>
                </div>
                <div className="space-y-3">
                  <Link href="/content/flashcards">
                    <Button variant="primary" className="w-full">
                      Study Another Set
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
