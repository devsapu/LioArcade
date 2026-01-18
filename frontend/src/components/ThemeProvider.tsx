'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, hasHydrated, setHasHydrated } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      setHasHydrated(true);
    }
  }, [theme, setHasHydrated]);

  // Prevent flash of wrong theme
  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
