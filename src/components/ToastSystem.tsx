import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastSystem() {
  const { state, dispatch, theme } = useApp();
  const isDark = theme === 'dark';

  const typeStyles = {
    success: {
      bg: isDark ? '#0a1f0a' : '#f0fdf4',
      border: '#22c55e',
      icon: '✓',
      color: '#16a34a',
      text: isDark ? '#f1f5f9' : '#14532d',
    },
    error: {
      bg: isDark ? '#1a0505' : '#fef2f2',
      border: '#ef4444',
      icon: '✕',
      color: '#ef4444',
      text: isDark ? '#f1f5f9' : '#7f1d1d',
    },
    info: {
      bg: isDark ? '#0a1628' : '#eff6ff',
      border: '#3b82f6',
      icon: 'ℹ',
      color: '#2563eb',
      text: isDark ? '#f1f5f9' : '#1e3a5f',
    },
    warning: {
      bg: isDark ? '#1a1200' : '#fffbeb',
      border: '#eab308',
      icon: '⚠',
      color: '#d97706',
      text: isDark ? '#f1f5f9' : '#713f12',
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 360 }}>
      {state.toasts.map(toast => {
        const s = typeStyles[toast.type] ?? typeStyles.info;
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-2xl px-4 py-3 pointer-events-auto animate-slide-up shadow-lg backdrop-blur-md transition-all"
            style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: `0 4px 20px ${s.border}22` }}
          >
            <span className="text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: s.color }}>
              {s.icon}
            </span>
            <span className="text-sm font-medium flex-1" style={{ color: s.text }}>{toast.message}</span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="text-xs flex-shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
              style={{ color: s.text }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
