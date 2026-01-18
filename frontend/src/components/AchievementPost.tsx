'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

interface AchievementPostProps {
  username: string;
  title: string;
  score?: number;
  total?: number;
  level?: number;
  badge?: string;
  position?: number;
  achievementType: 'quiz' | 'flashcard' | 'game' | 'progress' | 'leaderboard';
  onImageGenerated?: (imageUrl: string) => void;
}

export function AchievementPost({
  username,
  title,
  score,
  total,
  level,
  badge,
  position,
  achievementType,
  onImageGenerated,
}: AchievementPostProps) {
  const postRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const getAchievementEmoji = () => {
    switch (achievementType) {
      case 'quiz': return '🎯';
      case 'flashcard': return '🎴';
      case 'game': return '🧮';
      case 'progress': return '📊';
      case 'leaderboard': return '🏆';
      default: return '🎉';
    }
  };

  const getGradientColors = () => {
    switch (achievementType) {
      case 'quiz': return 'from-blue-500 via-purple-500 to-pink-500';
      case 'flashcard': return 'from-green-500 via-emerald-500 to-teal-500';
      case 'game': return 'from-orange-500 via-red-500 to-pink-500';
      case 'progress': return 'from-purple-500 via-indigo-500 to-blue-500';
      case 'leaderboard': return 'from-yellow-500 via-orange-500 to-red-500';
      default: return 'from-blue-500 via-purple-500 to-pink-500';
    }
  };

  const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  const generateImage = useCallback(async () => {
    if (!postRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(postRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [onImageGenerated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateImage();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [generateImage]);

  return (
    <div className="space-y-4">
      <div
        ref={postRef}
        className="relative w-full max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-200"
        style={{ aspectRatio: '1/1.2' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColors()} opacity-90`}>
          <div 
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url("${patternUrl}")` }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce-slow">{getAchievementEmoji()}</div>
            <h3 className="text-2xl font-bold mb-1">LioArcade</h3>
            <p className="text-sm opacity-90">Gamified Learning Platform</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <p className="text-sm opacity-80 mb-2">Achievement Unlocked!</p>
              <h2 className="text-xl font-bold mb-4 line-clamp-2">{title}</h2>
            </div>

            <div className="text-center">
              <p className="text-sm opacity-80 mb-1">by</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                {username}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {score !== undefined && total !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30">
                  <p className="text-xs opacity-80 mb-1">Score</p>
                  <p className="text-xl font-bold">
                    {score}/{total}
                  </p>
                  <p className="text-xs opacity-80">
                    {Math.round((score / total) * 100)}%
                  </p>
                </div>
              )}

              {level !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30">
                  <p className="text-xs opacity-80 mb-1">Level</p>
                  <p className="text-xl font-bold">{level}</p>
                </div>
              )}

              {badge && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30 col-span-2">
                  <p className="text-xs opacity-80 mb-1">Badge Earned</p>
                  <p className="text-lg font-bold">🏆 {badge}</p>
                </div>
              )}

              {position !== undefined && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30 col-span-2">
                  <p className="text-xs opacity-80 mb-1">Leaderboard Rank</p>
                  <p className="text-2xl font-bold">#{position}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-80">Share your achievement!</p>
            <p className="text-xs opacity-60 mt-1">www.lioarcade.com</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {generatedImage && (
          <>
            <a
              href={generatedImage}
              download={`lioarcade-achievement-${Date.now()}.png`}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
            >
              📥 Download Image
            </a>
            <button
              onClick={async () => {
                if (navigator.share && generatedImage) {
                  try {
                    const response = await fetch(generatedImage);
                    const blob = await response.blob();
                    const file = new File([blob], 'achievement.png', { type: 'image/png' });
                    await navigator.share({
                      title: title,
                      text: 'Check out my achievement on LioArcade!',
                      files: [file],
                    });
                  } catch (error) {
                    console.error('Share failed:', error);
                  }
                } else if (generatedImage) {
                  try {
                    await navigator.clipboard.writeText(generatedImage);
                    alert('Image copied to clipboard!');
                  } catch (error) {
                    console.error('Copy failed:', error);
                  }
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              📤 Share Image
            </button>
          </>
        )}
        {isGenerating && (
          <div className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-semibold text-center">
            Generating image...
          </div>
        )}
      </div>
    </div>
  );
}
