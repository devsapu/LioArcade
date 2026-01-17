'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useSound } from '@/hooks/useSound';

export function ThemeToggle() {
  const { theme, toggleTheme, hasHydrated, setHasHydrated } = useThemeStore();
  const { playSound } = useSound();

  useEffect(() => {
    if (!hasHydrated) {
      setHasHydrated(true);
    }
  }, [hasHydrated, setHasHydrated]);

  const handleToggle = () => {
    toggleTheme();
    playSound('click');
  };

  if (!hasHydrated) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:scale-110 group overflow-hidden"
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300"></div>
      
      {/* Icon */}
      <div className="relative z-10 transform transition-all duration-500">
        {theme === 'light' ? (
          <span className="text-lg group-hover:rotate-180 transition-transform duration-500">🌙</span>
        ) : (
          <span className="text-lg group-hover:rotate-180 transition-transform duration-500">☀️</span>
        )}
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-0.5 right-0.5 text-yellow-400 text-[10px] animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
        <div className="absolute bottom-0.5 left-0.5 text-orange-400 text-[10px] animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
      </div>
    </button>
  );
}
