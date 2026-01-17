'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { useSound } from '@/hooks/useSound';

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  pointsEarned?: number;
  levelUp?: boolean;
  newLevel?: number;
  message?: string;
  errorMessage?: string;
}

export function ScoreSubmissionModal({
  isOpen,
  onClose,
  type,
  pointsEarned,
  levelUp,
  newLevel,
  message,
  errorMessage,
}: ScoreSubmissionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen && type === 'success') {
      setShowConfetti(true);
      setAnimatePoints(true);
      
      // Play celebration sound
      if (levelUp) {
        playSound('levelUp');
      } else {
        playSound('celebration');
      }
      
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    } else if (isOpen && type === 'error') {
      playSound('error');
    }
  }, [isOpen, type, levelUp, playSound]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scale-in">
        {type === 'success' ? (
          <div className="text-center">
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`,
                    }}
                  >
                    {['🎉', '⭐', '✨', '🎊', '🌟'][Math.floor(Math.random() * 5)]}
                  </div>
                ))}
              </div>
            )}

            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce-in">
                  <span className="text-5xl">🎉</span>
                </div>
                {/* Ripple effect */}
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Score Submitted!
            </h2>

            {/* Points Earned */}
            {pointsEarned !== undefined && (
              <div className="my-6">
                <div className="inline-block">
                  <div
                    className={`text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent ${
                      animatePoints ? 'animate-scale-bounce' : ''
                    }`}
                  >
                    +{pointsEarned}
                  </div>
                  <div className="text-lg text-gray-600 mt-2">Points Earned</div>
                </div>
              </div>
            )}

            {/* Level Up Section */}
            {levelUp && newLevel && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300 animate-slide-up">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-4xl animate-bounce">🚀</span>
                  <div>
                    <div className="text-xl font-bold text-purple-900">
                      Level Up!
                    </div>
                    <div className="text-sm text-purple-700">
                      You reached Level {newLevel}!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <p className="text-gray-600 mb-6">{message}</p>
            )}

            {/* Close Button */}
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full py-3 text-lg"
            >
              Awesome! 🎯
            </Button>
          </div>
        ) : (
          <div className="text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">⚠️</span>
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Submission Failed
            </h2>

            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>

            {/* Close Button */}
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full py-3 text-lg"
            >
              Close
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes scale-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-scale-bounce {
          animation: scale-bounce 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
