'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('theme-dark');
  } else {
    root.classList.remove('theme-dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use light mode - dark mode toggle removed
  const [theme] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Always apply light theme
    applyTheme('light');
    setIsReady(true);
  }, []);

  // No-op functions to maintain compatibility with existing code
  const setTheme = useCallback(() => {
    // Theme is locked to light mode
  }, []);

  const toggleTheme = useCallback(() => {
    // Theme is locked to light mode
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      toggleTheme,
      setTheme,
      isReady,
    }),
    [theme, toggleTheme, setTheme, isReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
