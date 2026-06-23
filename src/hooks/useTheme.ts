import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_KEY = 'meetingflow-theme';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let dark = false;
      if (themeMode === 'dark') {
        dark = true;
      } else if (themeMode === 'light') {
        dark = false;
      } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_KEY, mode);
  }, []);

  return { themeMode, isDark, setTheme };
}
