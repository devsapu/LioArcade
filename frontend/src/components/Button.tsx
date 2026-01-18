'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'relative px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-transparent hover:border-white/50 animate-gradient-shift',
          overlay: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
          sparkles: ['text-yellow-300', 'text-yellow-300'],
        };
      case 'secondary':
        return {
          container: 'bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500',
          overlay: 'bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500',
          sparkles: ['text-blue-400', 'text-indigo-400'],
        };
      case 'danger':
        return {
          container: 'bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-transparent hover:border-white/50',
          overlay: 'bg-gradient-to-r from-red-600 via-orange-600 to-pink-600',
          sparkles: ['text-yellow-300', 'text-yellow-300'],
        };
      default:
        return {
          container: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-transparent hover:border-white/50',
          overlay: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
          sparkles: ['text-yellow-300', 'text-yellow-300'],
        };
    }
  };

  const variantStyles = getVariantClasses();

  return (
    <button
      className={`${baseClasses} ${variantStyles.container} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Animated background gradient overlay */}
      <div className={`absolute inset-0 ${variantStyles.overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg`}></div>
      
      {/* Sparkle effects */}
      {!disabled && !isLoading && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className={`absolute top-1 left-2 text-xs ${variantStyles.sparkles[0]} animate-pulse`} style={{ animationDelay: '0ms' }}>✨</div>
          <div className={`absolute bottom-1 right-2 text-xs ${variantStyles.sparkles[1]} animate-pulse`} style={{ animationDelay: '300ms' }}>⭐</div>
        </div>
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <span className="group-hover:font-semibold transition-all duration-300">{children}</span>
        )}
      </span>
      
      {/* Shine effect */}
      {!disabled && !isLoading && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      )}
    </button>
  );
};



