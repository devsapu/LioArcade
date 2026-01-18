'use client';

import { useState, useEffect } from 'react';
import { useSound } from '@/hooks/useSound';

interface UsernameDisplayProps {
  username: string;
  className?: string;
}

// Color palettes for dynamic changes
const colorPalettes = [
  { from: 'from-orange-500', via: 'via-pink-500', to: 'to-purple-500', darkFrom: 'dark:from-orange-400', darkVia: 'dark:via-pink-400', darkTo: 'dark:to-purple-400' },
  { from: 'from-blue-500', via: 'via-cyan-500', to: 'to-teal-500', darkFrom: 'dark:from-blue-400', darkVia: 'dark:via-cyan-400', darkTo: 'dark:to-teal-400' },
  { from: 'from-green-500', via: 'via-emerald-500', to: 'to-green-600', darkFrom: 'dark:from-green-400', darkVia: 'dark:via-emerald-400', darkTo: 'dark:to-green-500' },
  { from: 'from-purple-500', via: 'via-indigo-500', to: 'to-blue-500', darkFrom: 'dark:from-purple-400', darkVia: 'dark:via-indigo-400', darkTo: 'dark:to-blue-400' },
  { from: 'from-red-500', via: 'via-pink-500', to: 'to-rose-500', darkFrom: 'dark:from-red-400', darkVia: 'dark:via-pink-400', darkTo: 'dark:to-rose-400' },
  { from: 'from-yellow-500', via: 'via-orange-500', to: 'to-red-500', darkFrom: 'dark:from-yellow-400', darkVia: 'dark:via-orange-400', darkTo: 'dark:to-red-400' },
];

export function UsernameDisplay({ username, className = '' }: UsernameDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [charColors, setCharColors] = useState<number[]>([]);
  const { playSound } = useSound();

  // Initialize character colors based on username
  useEffect(() => {
    if (username) {
      const colors = username.split('').map((_, i) => (i + Math.floor(Math.random() * colorPalettes.length)) % colorPalettes.length);
      setCharColors(colors);
    }
  }, [username]);

  // Rotate colors periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colorPalettes.length);
      // Update individual character colors
      if (username) {
        setCharColors((prev) => 
          prev.map((_, i) => (i + Math.floor(Math.random() * colorPalettes.length)) % colorPalettes.length)
        );
      }
    }, 3000); // Change colors every 3 seconds

    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    if (isHovered) {
      setShowSparkles(true);
      playSound('click');
      // Rapidly change colors on hover
      const hoverInterval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % colorPalettes.length);
        if (username) {
          setCharColors((prev) => 
            prev.map(() => Math.floor(Math.random() * colorPalettes.length))
          );
        }
      }, 200);
      
      const timer = setTimeout(() => {
        setShowSparkles(false);
        clearInterval(hoverInterval);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(hoverInterval);
      };
    }
  }, [isHovered, playSound, username]);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sparkle effects */}
      {showSparkles && (
        <div className="absolute -inset-2 pointer-events-none">
          <div className="absolute top-0 left-1/2 text-yellow-400 text-xs animate-ping" style={{ animationDelay: '0ms' }}>✨</div>
          <div className="absolute top-0 right-0 text-pink-400 text-xs animate-ping" style={{ animationDelay: '200ms' }}>⭐</div>
          <div className="absolute bottom-0 left-0 text-blue-400 text-xs animate-ping" style={{ animationDelay: '400ms' }}>💫</div>
          <div className="absolute bottom-0 right-1/2 text-purple-400 text-xs animate-ping" style={{ animationDelay: '600ms' }}>✨</div>
        </div>
      )}

      {/* Username with dynamic gradient colors */}
      <span
        className={`
          relative inline-block
          font-bold
          transition-all duration-300
          ${isHovered ? 'scale-110' : 'scale-100'}
          cursor-default
          ${className || 'text-sm'}
        `}
      >
        {username ? username.split('').map((char, index) => {
          const paletteIndex = charColors[index] ?? colorIndex;
          const palette = colorPalettes[paletteIndex] || colorPalettes[0];
          
          return (
            <span
              key={index}
              className={`
                inline-block
                bg-gradient-to-r ${palette.from} ${palette.via} ${palette.to}
                ${palette.darkFrom} ${palette.darkVia} ${palette.darkTo}
                bg-clip-text text-transparent
                animate-gradient-shift
              `}
              style={{
                backgroundSize: '200% 200%',
                animation: `gradient-shift 3s ease infinite`,
                animationDelay: `${index * 100}ms`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transform: isHovered ? 'translateY(-2px) scale(1.1)' : 'translateY(0) scale(1)',
                transition: 'transform 0.3s ease, background-position 0.3s ease',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        }) : (
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            User
          </span>
        )}
      </span>

      {/* Shine effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 overflow-hidden rounded pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full animate-shine-sweep"></div>
        </div>
      )}
    </div>
  );
}
