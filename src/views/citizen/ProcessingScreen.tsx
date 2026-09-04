import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const STEPS = [
  { id: 1, label: 'Emergency report received', delay: 300, type: 'done' as const },
  { id: 2, label: 'GPS location captured', delay: 800, type: 'done' as const },
  { id: 3, label: 'Evidence received', delay: 1400, type: 'done' as const },
  { id: 4, label: 'Processing emergency context', delay: 2200, type: 'processing' as const },
  { id: 5, label: 'Assessing severity', delay: 3000, type: 'processing' as const },
  { id: 6, label: 'Assessing urgency', delay: 3600, type: 'processing' as const },
  { id: 7, label: 'Identifying people at risk', delay: 4200, type: 'processing' as const },
  { id: 8, label: 'Determining required response domains', delay: 4800, type: 'processing' as const },
  { id: 9, label: 'Checking for duplicate reports', delay: 5400, type: 'processing' as const },
  { id: 10, label: 'Emergency routed to responders', delay: 6200, type: 'done' as const },
];

export default function ProcessingScreen() {
  const { state, dispatch, theme } = useApp();
  const isDark = theme === 'dark';
  const [visibleStep, setVisibleStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const inc = state.processingIncidentId
    ? state.incidents.find(i => i.id === state.processingIncidentId)
    : null;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((step, idx) => {
      timers.push(setTimeout(() => setVisibleStep(idx + 1), step.delay));
    });
    timers.push(setTimeout(() => setCompleted(true), 7200));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (completed) {
      const t = setTimeout(() => {
        dispatch({ type: 'SET_VIEW', payload: 'citizen_active' });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [completed, dispatch]);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto mb-3 shadow-md"
          style={{ background: '#ef4444' }}>R</div>
        <div className="font-display text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>ResQ AI Processing</div>
        <div className="font-mono text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
          {inc?.incidentNumber ?? 'Processing...'} — {inc?.category?.toUpperCase() ?? ''}
        </div>
      </div>

      {/* Processing steps */}
      <div className="w-full max-w-md space-y-2 mb-8 p-5 rounded-2xl transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
        {STEPS.map((step, idx) => {
          const show = idx < visibleStep;
          const isCurrent = idx + 1 === visibleStep && !completed;
          if (!show) return null;

          const isDone = step.type === 'done' || (idx < visibleStep - 1) || (completed && step.type === 'processing');
          const isProcessing = isCurrent && step.type === 'processing';

          return (
            <div key={step.id} className="flex items-center gap-3 animate-slide-up">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isProcessing ? 'animate-spin-slow' : ''}`}
                style={{
                  background: isDone
                    ? (isDark ? '#14532d' : '#dcfce7')
                    : isProcessing
                      ? (isDark ? '#1e3a5f' : '#dbeafe')
                      : 'var(--bg-surface)',
                  border: `1px solid ${isDone ? '#22c55e' : isProcessing ? '#3b82f6' : 'var(--border-subtle)'}`,
                  color: isDone ? '#16a34a' : isProcessing ? '#2563eb' : 'var(--text-dim)',
                }}
              >
                {isDone ? '✓' : isProcessing ? '◌' : '○'}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: isDone ? 'var(--text-secondary)' : isProcessing ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {step.label}
              </span>
              {isProcessing && (
                <div className="flex gap-0.5 ml-auto">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-blink"
                      style={{ background: '#3b82f6', animationDelay: `${i * 300}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.round((visibleStep / STEPS.length) * 100)}%`,
            background: completed ? '#22c55e' : '#ef4444',
          }}
        />
      </div>

      {completed && (
        <div className="text-center animate-slide-up">
          <div className="font-display text-xl font-bold mb-1" style={{ color: '#16a34a' }}>
            ✓ Emergency Routed
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connecting to live response view...</div>
        </div>
      )}

      {!completed && (
        <div className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
          Powered by ResQ AI — Do not close this screen
        </div>
      )}
    </div>
  );
}
