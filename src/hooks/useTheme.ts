import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'app-theme-mode';

type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark: themeMode === 'dark',
  };
};
