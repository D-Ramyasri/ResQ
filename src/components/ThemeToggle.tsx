import React from 'react';
import { useApp } from '../context/AppContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
  size = 'md',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3 text-xs gap-2',
    lg: 'h-10 px-3.5 text-sm gap-2.5',
  }[size];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      className={`relative inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all duration-200 border cursor-pointer select-none active:scale-95 ${sizeClasses} ${className}`}
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-primary)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* Icon with smooth rotation transition */}
      <span className="relative flex items-center justify-center w-4 h-4">
        {isDark ? (
          // Moon icon with glow
          <svg
            className="w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-12"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon with rays
          <svg
            className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </span>

      {showLabel && (
        <span className="tracking-wide uppercase">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}

      {/* Mode Indicator Pill */}
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: isDark ? '#38bdf8' : '#f59e0b',
        }}
      />
    </button>
  );
}
