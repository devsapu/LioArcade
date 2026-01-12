'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  username: string | undefined | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

/**
 * Generate default avatar URL using UI Avatars service
 */
const getDefaultAvatarUrl = (username: string | undefined | null, size: number = 200) => {
  // Handle undefined/null username
  if (!username) {
    return `https://ui-avatars.com/api/?name=U&size=${size}&background=6366f1&color=fff&bold=true&font-size=0.5`;
  }
  
  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=6366f1&color=fff&bold=true&font-size=0.5`;
};

export function Avatar({ src, username, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = useState(false);
  
  // Get the image URL - handle both local uploads and external URLs
  const getImageUrl = () => {
    if (!src || imageError) {
      return getDefaultAvatarUrl(username);
    }
    
    // If it's already a full URL, use it as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Otherwise, it's a local upload path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${src}`;
  };

  return (
    <div className={`${sizeClass} ${className} relative rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0`}>
      <img
        src={getImageUrl()}
        alt={username || 'User'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
