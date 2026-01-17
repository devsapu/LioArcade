'use client';

import { useState, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

interface InteractiveCharacterProps {
  targetCard?: 'games' | 'quizzes' | 'flashcards' | null;
  onAnimationComplete?: () => void;
}

type CharacterState = 'idle' | 'running' | 'pointing' | 'celebrating' | 'thinking';

export function InteractiveCharacter({ targetCard, onAnimationComplete }: InteractiveCharacterProps) {
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const { playSound } = useSound();

  // Character messages for different cards
  const messages = {
    games: "🎮 Let's play some fun games! Click here to start!",
    quizzes: "📝 Ready for a quiz? Test your knowledge!",
    flashcards: "🎴 Time to study! Let's learn something new!",
    default: "👋 Hi! I'm your learning buddy! Click on any card to explore!",
  };

  useEffect(() => {
    // Show welcome message on first load
    const welcomeTimer = setTimeout(() => {
      if (!targetCard) {
        setShowSpeechBubble(true);
        setSpeechText(messages.default);
        setTimeout(() => setShowSpeechBubble(false), 3000);
      }
    }, 1000);

    if (targetCard) {
      // Character runs and points to the target card
      setCharacterState('running');
      setSpeechText(messages[targetCard]);
      playSound('characterRun');
      
      // After running animation, point
      const timer1 = setTimeout(() => {
        setCharacterState('pointing');
        setShowSpeechBubble(true);
        playSound('characterPoint');
      }, 800);

      // Keep character pointing as long as targetCard is set
      // Only hide speech bubble after a while, but keep pointing
      const timer2 = setTimeout(() => {
        setShowSpeechBubble(false);
        // Don't change state here - keep pointing while targetCard is active
      }, 5000);

      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // When targetCard is cleared, return to idle
      setCharacterState('idle');
      setShowSpeechBubble(false);
      
      // Idle animation with occasional messages
      const interval = setInterval(() => {
        if (Math.random() > 0.7 && !showSpeechBubble && !targetCard) {
          setShowSpeechBubble(true);
          setSpeechText(messages.default);
          setTimeout(() => setShowSpeechBubble(false), 2000);
        }
      }, 8000);

      return () => {
        clearTimeout(welcomeTimer);
        clearInterval(interval);
      };
    }
  }, [targetCard]);

  // Calculate position based on target card (responsive)
  useEffect(() => {
    if (targetCard && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Mobile: position above cards
        const cardPositions = {
          games: { x: 50, y: 45 },
          quizzes: { x: 50, y: 45 },
          flashcards: { x: 50, y: 45 },
        };
        setPosition(cardPositions[targetCard]);
      } else {
        // Desktop: position next to cards
        const cardPositions = {
          games: { x: 15, y: 60 },
          quizzes: { x: 50, y: 60 },
          flashcards: { x: 85, y: 60 },
        };
        setPosition(cardPositions[targetCard]);
      }
    } else {
      // Default position - bottom right
      setPosition({ x: 90, y: 85 });
    }
  }, [targetCard]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden hidden md:block">
      {/* Character Container */}
      <div
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Speech Bubble */}
        {showSpeechBubble && (
          <div className={`absolute mb-2 animate-bounce-in ${
            !targetCard 
              ? '-top-20 left-1/2 transform -translate-x-1/2' 
              : '-top-20 left-1/2 transform -translate-x-1/2'
          }`}>
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-primary-300 relative">
              <div className="text-sm font-medium text-gray-800 leading-relaxed">
                {speechText}
              </div>
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary-300"></div>
              </div>
            </div>
          </div>
        )}

        {/* Character (Friendly Teacher/Teddy) */}
        <div
          className={`relative transition-all duration-500 ${
            characterState === 'running' ? 'animate-run' :
            characterState === 'pointing' ? 'animate-point' :
            characterState === 'celebrating' ? 'animate-celebrate' :
            characterState === 'thinking' ? 'animate-think' :
            'animate-idle'
          }`}
        >
          {/* Main Character Body */}
          <div className="text-8xl relative">
            {characterState === 'pointing' ? (
              // Pointing animation
              <div className="relative">
                <div className="animate-bounce">🧑‍🏫</div>
                {/* Pointing hand effect */}
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-4xl animate-point-hand">
                  👉
                </div>
              </div>
            ) : characterState === 'running' ? (
              // Running animation
              <div className="animate-bounce-slow">🏃</div>
            ) : characterState === 'celebrating' ? (
              // Celebrating
              <div className="animate-bounce">🎉</div>
            ) : (
              // Idle - friendly teacher or teddy (alternate between teacher and teddy)
              <div className="relative">
                <div className="animate-float">🧸</div>
                {/* Occasional expressions */}
                <div className="absolute inset-0 animate-wink opacity-0">😊</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce-slow opacity-75">
                  👋
                </div>
              </div>
            )}
          </div>

          {/* Sparkle effects when pointing */}
          {characterState === 'pointing' && (
            <>
              <div className="absolute -top-4 -left-4 text-2xl animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
              <div className="absolute -top-4 -right-4 text-2xl animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-2xl animate-ping" style={{ animationDelay: '400ms' }}>💫</div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes run {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(5px) rotate(-5deg);
          }
          75% {
            transform: translateX(-5px) rotate(5deg);
          }
        }

        @keyframes point {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes point-hand {
          0%, 100% {
            transform: translateX(0) translateY(-50%);
          }
          50% {
            transform: translateX(10px) translateY(-50%);
          }
        }

        @keyframes celebrate {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.2) rotate(-10deg);
          }
          75% {
            transform: scale(1.2) rotate(10deg);
          }
        }

        @keyframes think {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes wink {
          0%, 90%, 100% {
            opacity: 0;
          }
          5%, 10% {
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-run {
          animation: run 0.5s ease-in-out infinite;
        }

        .animate-point {
          animation: point 0.6s ease-in-out infinite;
        }

        .animate-point-hand {
          animation: point-hand 0.8s ease-in-out infinite;
        }

        .animate-celebrate {
          animation: celebrate 0.8s ease-in-out infinite;
        }

        .animate-think {
          animation: think 2s ease-in-out infinite;
        }

        .animate-wink {
          animation: wink 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
