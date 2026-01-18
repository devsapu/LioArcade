'use client';

import { useState, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import { AchievementPost } from './AchievementPost';
import html2canvas from 'html2canvas';

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { playSound } = useSound();
  const menuRef = useRef<HTMLDivElement>(null);
  const achievementPostRef = useRef<HTMLDivElement>(null);

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

  const handleShare = async (platform: string, link: string) => {
    playSound('click');
    
    // If we have a generated image, try to share it with the platform
    if (generatedImageUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
        
        // Try native share API first (works on mobile and some desktop browsers)
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: `${decodeURIComponent(encodedText)}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
              url: shareUrl,
              files: [file],
            });
            setShowShareMenu(false);
            return;
          } catch (error) {
            // User cancelled or share failed, fall through to URL sharing
            console.log('Native share cancelled or failed:', error);
          }
        }
        
        // For platforms that don't support file sharing via URL, open the share dialog
        // and user can manually attach the image
        if (platform === 'facebook' || platform === 'twitter') {
          // Open the platform's share dialog
          window.open(link, '_blank', 'width=600,height=400');
          // Show a message to remind user to attach the image
          setTimeout(() => {
            alert('💡 Tip: After the share window opens, you can download the branded image from the post preview and attach it manually for better engagement!');
          }, 500);
          setShowShareMenu(false);
          return;
        }
      } catch (error) {
        console.log('Image share failed, falling back to URL share:', error);
      }
    }
    
    // Fallback to URL-based sharing
    window.open(link, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    playSound('click');
    
    if (navigator.share) {
      try {
        // If we have a generated image, include it in the share
        if (generatedImageUrl) {
          const response = await fetch(generatedImageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
          await navigator.share({
            title: title,
            text: `${decodeURIComponent(encodedText)}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
            files: [file],
          });
        } else {
          await navigator.share({
            title: title,
            text: decodeURIComponent(encodedText),
            url: shareUrl,
          });
        }
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
            {/* Create Animated Post - Always show first */}
            {username && (
              <>
                <button
                  onClick={async () => {
                    playSound('click');
                    setShowPostPreview(true);
                    setShowShareMenu(false);
                    
                    // Auto-generate image when opening preview
                    if (!generatedImageUrl && !isGeneratingImage) {
                      setIsGeneratingImage(true);
                      // Wait for component to render, then generate
                      setTimeout(async () => {
                        if (achievementPostRef.current && !generatedImageUrl) {
                          try {
                            // Use requestAnimationFrame to ensure DOM is fully rendered
                            await new Promise(resolve => requestAnimationFrame(resolve));
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            const canvas = await html2canvas(achievementPostRef.current, {
                              backgroundColor: '#ffffff',
                              scale: 2,
                              logging: false,
                              useCORS: true,
                              allowTaint: false,
                              windowWidth: achievementPostRef.current.scrollWidth,
                              windowHeight: achievementPostRef.current.scrollHeight,
                            });
                            const imageUrl = canvas.toDataURL('image/png');
                            setGeneratedImageUrl(imageUrl);
                            setIsGeneratingImage(false);
                          } catch (error) {
                            console.error('Failed to generate image:', error);
                            setIsGeneratingImage(false);
                          }
                        }
                      }, 2000);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>🎨</span>
                  <span>Create Branded Post</span>
                  {generatedImageUrl && <span className="text-xs ml-1">✓</span>}
                </button>
                
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              </>
            )}
            
            {/* Quick Share with Image */}
            {username && generatedImageUrl && (
              <button
                onClick={async () => {
                  playSound('click');
                  try {
                    const response = await fetch(generatedImageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                    
                    if (navigator.share) {
                      await navigator.share({
                        title: title,
                        text: `${decodeURIComponent(encodedText)}\n\n🎮 Join me on LioArcade!`,
                        files: [file],
                      });
                      setShowShareMenu(false);
                    } else {
                      // Fallback: open post preview
                      setShowPostPreview(true);
                      setShowShareMenu(false);
                    }
                  } catch (error) {
                    console.error('Share failed:', error);
                    // Fallback: open post preview
                    setShowPostPreview(true);
                    setShowShareMenu(false);
                  }
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:bg-gradient-to-r hover:from-green-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>📤</span>
                <span>Share with Image</span>
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
              onClick={async () => {
                // If no image generated yet and username exists, prompt to create branded post
                if (!generatedImageUrl && username) {
                  const shouldCreate = confirm('💡 Create a branded post first? It will make your share more engaging with a beautiful image!');
                  if (shouldCreate) {
                    setShowPostPreview(true);
                    setShowShareMenu(false);
                    return;
                  }
                }
                await handleShare('twitter', shareLinks.twitter);
              }}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🐦</span>
              <span>Twitter/X</span>
              {generatedImageUrl && <span className="text-xs text-green-500 ml-1">✨</span>}
            </button>

            {/* Facebook */}
            <button
              onClick={async () => {
                // If no image generated yet and username exists, prompt to create branded post
                if (!generatedImageUrl && username) {
                  const shouldCreate = confirm('💡 Create a branded post first? It will make your share more engaging with a beautiful image!');
                  if (shouldCreate) {
                    setShowPostPreview(true);
                    setShowShareMenu(false);
                    return;
                  }
                }
                await handleShare('facebook', shareLinks.facebook);
              }}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-xl">📘</span>
              <span>Facebook</span>
              {generatedImageUrl && <span className="text-xs text-green-500 ml-1">✨</span>}
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
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold z-10"
            >
              ×
            </button>
            
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                🎨 Your Branded Achievement Post
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Share this beautiful branded image on social media to showcase your achievement!
              </p>
              <div ref={achievementPostRef} className="min-h-[400px]">
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
                    if (!generatedImageUrl) {
                      setGeneratedImageUrl(imageUrl);
                      setIsGeneratingImage(false);
                    }
                  }}
                  hideButtons={true}
                />
              </div>
              
              {isGeneratingImage && !generatedImageUrl && (
                <div className="mt-6 text-center py-8">
                  <div className="inline-flex flex-col items-center space-y-3">
                    <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Generating your branded image...</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">This may take a few seconds</span>
                  </div>
                </div>
              )}
              
              {generatedImageUrl && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-300 text-center font-medium">
                      ✨ Your branded post is ready! Share it to help spread the word about LioArcade!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImageUrl;
                        link.download = `lioarcade-achievement-${Date.now()}.png`;
                        link.click();
                        playSound('success');
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>📥</span>
                      <span>Download</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          playSound('success');
                          if (navigator.share) {
                            const response = await fetch(generatedImageUrl);
                            const blob = await response.blob();
                            const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                            await navigator.share({
                              title: title,
                              text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                              files: [file],
                            });
                            setShowPostPreview(false);
                          } else {
                            // Fallback: copy image to clipboard or show share options
                            await navigator.clipboard.writeText(generatedImageUrl);
                            alert('Image URL copied to clipboard! You can paste it anywhere.');
                          }
                        } catch (error) {
                          console.error('Share failed:', error);
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>📤</span>
                      <span>Share Now</span>
                    </button>
                  </div>
                  
                         <div className="text-center">
                           <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                             Share directly to your favorite platform:
                           </p>
                           <div className="flex flex-wrap gap-3 justify-center">
                             {/* Facebook */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening Facebook:', error);
                                       }
                                     }
                                     
                                     // Fallback: Open Facebook with image download prompt
                                     window.open(shareLinks.facebook, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After Facebook opens, download the image above and attach it to your post for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.facebook, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.facebook, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on Facebook"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                               </svg>
                               <span>Facebook</span>
                             </button>

                             {/* Twitter/X */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening Twitter:', error);
                                       }
                                     }
                                     
                                     // Fallback: Open Twitter with image download prompt
                                     window.open(shareLinks.twitter, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After Twitter opens, download the image above and attach it to your tweet for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.twitter, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.twitter, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-black hover:bg-gray-800 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on Twitter/X"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                               </svg>
                               <span>Twitter/X</span>
                             </button>

                             {/* LinkedIn */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening LinkedIn:', error);
                                       }
                                     }
                                     
                                     window.open(shareLinks.linkedin, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After LinkedIn opens, download the image above and attach it to your post for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.linkedin, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.linkedin, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-[#0077B5] hover:bg-[#006399] rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on LinkedIn"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                               </svg>
                               <span>LinkedIn</span>
                             </button>

                             {/* WhatsApp */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening WhatsApp:', error);
                                       }
                                     }
                                     
                                     window.open(shareLinks.whatsapp, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After WhatsApp opens, download the image above and attach it to your message for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.whatsapp, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.whatsapp, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-[#25D366] hover:bg-[#20BA5A] rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on WhatsApp"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                               </svg>
                               <span>WhatsApp</span>
                             </button>

                             {/* Telegram */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening Telegram:', error);
                                       }
                                     }
                                     
                                     window.open(shareLinks.telegram, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After Telegram opens, download the image above and attach it to your message for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.telegram, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.telegram, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-[#0088cc] hover:bg-[#0077B3] rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on Telegram"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.27-.913.4-1.302.4-.428 0-1.25-.154-1.87-.461-.754-.367-1.356-.56-1.304-1.18.017-.216.26-.437.714-.63 1.4-.64 4.338-1.87 5.773-2.51.577-.26 1.098-.39 1.198-.42z"/>
                               </svg>
                               <span>Telegram</span>
                             </button>

                             {/* Reddit */}
                             <button
                               onClick={async () => {
                                 playSound('click');
                                 if (generatedImageUrl) {
                                   try {
                                     const response = await fetch(generatedImageUrl);
                                     const blob = await response.blob();
                                     
                                     // Try native share first
                                     if (navigator.share) {
                                       try {
                                         const file = new File([blob], 'lioarcade-achievement.png', { type: 'image/png' });
                                         await navigator.share({
                                           title: title,
                                           text: `${text}\n\n🎮 Join me on LioArcade - Gamified Learning Platform!`,
                                           url: shareUrl,
                                           files: [file],
                                         });
                                         return;
                                       } catch (error) {
                                         console.log('Native share failed, opening Reddit:', error);
                                       }
                                     }
                                     
                                     window.open(shareLinks.reddit, '_blank', 'width=600,height=400');
                                     setTimeout(() => {
                                       alert('💡 After Reddit opens, download the image above and attach it to your post for maximum engagement!');
                                     }, 500);
                                   } catch (error) {
                                     console.error('Share failed:', error);
                                     window.open(shareLinks.reddit, '_blank', 'width=600,height=400');
                                   }
                                 } else {
                                   window.open(shareLinks.reddit, '_blank', 'width=600,height=400');
                                 }
                               }}
                               className="px-4 py-3 bg-[#FF4500] hover:bg-[#E03D00] rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                               title="Share on Reddit"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-2.597-.836-.836a1.25 1.25 0 0 1 0-1.768l.836-.836a1.25 1.25 0 0 1 1.768 0l.836.836 2.597 2.597a1.25 1.25 0 0 1 .345.768zm-10.02 0a1.25 1.25 0 0 1 1.768 0l.836.836 2.597 2.597a1.25 1.25 0 0 1-.345 1.768l-.836.836a1.25 1.25 0 0 1-1.768 0l-.836-.836-2.597-2.597a1.25 1.25 0 0 1 0-1.768l.836-.836a1.25 1.25 0 0 1 .768-.345zM12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z"/>
                               </svg>
                               <span>Reddit</span>
                             </button>
                           </div>
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
