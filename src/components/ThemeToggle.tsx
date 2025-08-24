'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'header' | 'floating';
}

export default function ThemeToggle({ variant = 'floating' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'header') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full transition-all duration-300 bg-white/10 hover:bg-white/20 text-white hover:scale-110"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="relative w-5 h-5">
          <Sun 
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
              theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
            }`}
          />
          <Moon 
            className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
              theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-yellow-400 dark:to-orange-400 text-white dark:text-gray-900 hover:scale-110 hover:shadow-xl z-50"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <Sun 
          className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
            theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
        />
        <Moon 
          className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
          }`}
        />
      </div>
    </button>
  );
}
