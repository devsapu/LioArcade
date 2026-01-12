'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Client component to handle auth store hydration
 * This ensures the persisted state is loaded before rendering protected routes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're on the client
    if (typeof window === 'undefined') {
      return;
    }

    // Wait a tick for Zustand to finish hydrating from localStorage
    // Then mark as ready
    const timer = setTimeout(() => {
      setHasHydrated(true);
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [setHasHydrated]);

  // Show loading only on initial render
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
