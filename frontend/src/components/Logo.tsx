'use client';

import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
  href?: string;
  animated?: boolean;
}

export function Logo({ 
  size = 'md', 
  showIcon = true, 
  className = '',
  href,
  animated = true 
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: { text: 'text-lg', icon: 'w-6 h-6', spacing: 'gap-1.5' },
    md: { text: 'text-xl', icon: 'w-8 h-8', spacing: 'gap-2' },
    lg: { text: 'text-2xl', icon: 'w-10 h-10', spacing: 'gap-2.5' },
    xl: { text: 'text-4xl', icon: 'w-14 h-14', spacing: 'gap-3' },
  };

  const currentSize = sizeClasses[size];

  const LogoContent = () => (
    <div 
      className={`flex items-center ${currentSize.spacing} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon/Arcade Symbol */}
      {showIcon && (
        <div className={`relative ${currentSize.icon} flex-shrink-0`}>
          {/* Arcade Machine Icon */}
          <svg
            viewBox="0 0 100 100"
            className={`w-full h-full transition-transform duration-300 ${animated && isHovered ? 'rotate-12 scale-110' : ''}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Arcade Machine Body */}
            <rect
              x="20"
              y="30"
              width="60"
              height="50"
              rx="5"
              className="fill-gradient-to-br from-purple-500 to-blue-500"
              style={{
                fill: 'url(#arcadeGradient)',
              }}
            />
            {/* Screen */}
            <rect
              x="28"
              y="38"
              width="44"
              height="28"
              rx="3"
              className="fill-blue-900 dark:fill-blue-950"
            />
            {/* Screen Glow */}
            <rect
              x="30"
              y="40"
              width="40"
              height="24"
              rx="2"
              className="fill-blue-400 dark:fill-blue-500"
              opacity="0.6"
            />
            {/* Buttons */}
            <circle cx="38" cy="75" r="4" className="fill-red-500" />
            <circle cx="50" cy="75" r="4" className="fill-yellow-500" />
            <circle cx="62" cy="75" r="4" className="fill-green-500" />
            {/* Joystick */}
            <circle cx="75" cy="75" r="6" className="fill-gray-600 dark:fill-gray-400" />
            <rect x="73" y="70" width="4" height="8" rx="2" className="fill-gray-700 dark:fill-gray-500" />
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="arcadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Animated Sparkles */}
          {animated && (
            <>
              <div className={`absolute -top-1 -right-1 text-yellow-400 text-xs ${isHovered ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '0ms' }}>✨</div>
              <div className={`absolute -bottom-1 -left-1 text-pink-400 text-xs ${isHovered ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '300ms' }}>⭐</div>
            </>
          )}
        </div>
      )}

      {/* Text Logo */}
      <div className="flex items-baseline">
        <span
          className={`
            ${currentSize.text}
            font-bold
            bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600
            dark:from-purple-400 dark:via-blue-400 dark:to-pink-400
            bg-clip-text text-transparent
            ${animated ? 'animate-gradient-shift' : ''}
            transition-all duration-300
            ${isHovered ? 'scale-105' : ''}
          `}
          style={{
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lio
        </span>
        <span
          className={`
            ${currentSize.text}
            font-bold
            bg-gradient-to-r from-orange-500 via-pink-500 to-red-500
            dark:from-orange-400 dark:via-pink-400 dark:to-red-400
            bg-clip-text text-transparent
            ${animated ? 'animate-gradient-shift' : ''}
            transition-all duration-300
            ${isHovered ? 'scale-105' : ''}
          `}
          style={{
            backgroundSize: '200% 200%',
            animationDelay: '0.5s',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Arcade
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
