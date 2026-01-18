'use client';

import { useState, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import { AchievementPost } from './AchievementPost';

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  score?: number;
  total?: number;
  level?: number;
  badge?: string;
  position?: number;
  username?: string;
  achievementType?: 'quiz' | 'flashcard' | 'game' | 'progress' | 'leaderboard';
}

export function SocialShare({ title, text, url, score, total, level, badge, position, username, achievementType = 'quiz' }: SocialShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { playSound } = useSound();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  // Construct share text with emojis
  const shareText = () => {
    let message = text;
    
    if (score !== undefined && total !== undefined) {
      message += `\n\n🎯 Score: ${score}/${total} (${Math.round((score / total) * 100)}%)`;
    }
    
    if (level !== undefined) {
      message += `\n\n⭐ Level: ${level}`;
    }
    
    if (badge) {
      message += `\n\n🏆 Badge: ${badge}`;
    }
    
    if (position !== undefined) {
      message += `\n\n🏅 Rank: #${position}`;
    }
    
    message += '\n\n🎮 Play on LioArcade - Gamified Learning Platform!';
    
    return encodeURIComponent(message);
  };

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = shareText();

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };

  const handleShare = (platform: string, link: string) => {
    playSound('click');
    window.open(link, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    playSound('click');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: decodeURIComponent(encodedText),
          url: shareUrl,
        });
        setShowShareMenu(false);
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${decodeURIComponent(encodedText)}\n${shareUrl}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Copied to clipboard!');
        setShowShareMenu(false);
      });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Share Button */}
      <button
        onClick={() => {
          setShowShareMenu(!showShareMenu);
          playSound('click');
        }}
        className="relative px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 border-2 border-transparent hover:border-white/50 overflow-hidden group"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Sparkle effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1 left-2 text-yellow-300 text-sm animate-pulse" style={{ animationDelay: '0ms' }}>✨</div>
          <div className="absolute bottom-1 right-2 text-yellow-300 text-sm animate-pulse" style={{ animationDelay: '300ms' }}>⭐</div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center space-x-2">
          <span className="text-lg">📤</span>
          <span>Share Achievement</span>
        </div>
      </button>

      {/* Share Menu Dropdown */}
      {showShareMenu && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 min-w-[200px] border-2 border-gray-200 dark:border-gray-700 z-50 animate-slide-down">
          <div className="space-y-2">
            {/* Create Animated Post */}
            {username && (
              <button
                onClick={() => {
                  setShowPostPreview(true);
                  setShowShareMenu(false);
                  playSound('click');
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>🎨</span>
                <span>Create Post</span>
              </button>
            )}

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>📱</span>
                <span>Share</span>
              </button>
            )}

            {/* Twitter/X */}
            <button
              onClick={() => handleShare('twitter', shareLinks.twitter)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🐦</span>
              <span>Twitter/X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare('facebook', shareLinks.facebook)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">📘</span>
              <span>Facebook</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare('linkedin', shareLinks.linkedin)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">💼</span>
              <span>LinkedIn</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">💬</span>
              <span>WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram', shareLinks.telegram)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">✈️</span>
              <span>Telegram</span>
            </button>

            {/* Reddit */}
            <button
              onClick={() => handleShare('reddit', shareLinks.reddit)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🤖</span>
              <span>Reddit</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={async () => {
                playSound('click');
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                  setShowShareMenu(false);
                } catch (error) {
                  console.error('Failed to copy:', error);
                }
              }}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">📋</span>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Post Preview Modal */}
      {showPostPreview && username && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => {
                setShowPostPreview(false);
                setGeneratedImageUrl(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
            
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                🎨 Create Your Achievement Post
              </h3>
              <AchievementPost
                username={username}
                title={title}
                score={score}
                total={total}
                level={level}
                badge={badge}
                position={position}
                achievementType={achievementType}
                onImageGenerated={(imageUrl) => {
                  setGeneratedImageUrl(imageUrl);
                }}
              />
              
              {generatedImageUrl && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    You can now download or share this image on any platform!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImageUrl;
                        link.download = `lioarcade-achievement-${Date.now()}.png`;
                        link.click();
                        playSound('success');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      📥 Download
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (navigator.share) {
                            const response = await fetch(generatedImageUrl);
                            const blob = await response.blob();
                            const file = new File([blob], 'achievement.png', { type: 'image/png' });
                            await navigator.share({
                              title: title,
                              text: text,
                              files: [file],
                            });
                          } else {
                            await navigator.clipboard.writeText(generatedImageUrl);
                            alert('Image URL copied to clipboard!');
                          }
                          playSound('success');
                        } catch (error) {
                          console.error('Share failed:', error);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      📤 Share Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
