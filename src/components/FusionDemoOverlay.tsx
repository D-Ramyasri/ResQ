import React from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  { label: 'Report #1 received', sub: 'Morgan K. — accident with entrapment', icon: '📱', color: '#94a3b8' },
  { label: 'Report #2 received', sub: 'Taylor R. — same area, fire risk noted', icon: '📱', color: '#94a3b8' },
  { label: 'Report #3 received', sub: 'Jamie S. — 3+ injuries confirmed', icon: '📱', color: '#94a3b8' },
  { label: 'AI duplicate detection', sub: 'GPS proximity + category + time window matched', icon: '🤖', color: '#3b82f6' },
  { label: 'Reports fused — 1 unified incident', sub: 'Severity upgraded: P1 CRITICAL — 4 casualties', icon: '🔗', color: '#a855f7' },
];

export default function FusionDemoOverlay() {
  const { state, theme } = useApp();
  const isDark = theme === 'dark';
  if (!state.fusionDemoActive) return null;

  const currentStep = state.fusionDemoStep;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl overflow-hidden animate-slide-up shadow-2xl transition-colors duration-200"
        style={{ width: 480, maxWidth: '100%', background: 'var(--bg-card)', border: '1px solid #a855f7', boxShadow: 'var(--shadow-elevation)' }}>
        <div className="px-6 py-5 transition-colors" style={{ background: isDark ? '#0a0d1a' : '#faf5ff', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="live-dot w-2.5 h-2.5 rounded-full" style={{ background: '#a855f7' }} />
            <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              🔗 AI Duplicate Fusion Demo
            </div>
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Riverside Drive & 3rd Ave — Multi-vehicle accident
          </div>
        </div>

        <div className="p-6">
          {/* Report bubbles animating into one */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 transition-all duration-700"
                style={{ opacity: currentStep >= i ? 1 : 0.2, transform: currentStep >= 4 ? `translateX(${i === 0 ? 32 : i === 2 ? -32 : 0}px) scale(${currentStep >= 4 ? 0.6 : 1})` : 'none' }}
              >
                <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm"
                  style={{ background: currentStep >= i ? (isDark ? '#1a2236' : '#eff6ff') : 'var(--bg-surface)', border: `1px solid ${currentStep >= i ? '#3b82f6' : 'var(--border-subtle)'}` }}>
                  <span className="text-xl">📱</span>
                  <span className="font-mono text-xs font-bold" style={{ color: '#3b82f6' }}>REP {i + 1}</span>
                </div>
                <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {['Morgan K.', 'Taylor R.', 'Jamie S.'][i]}
                </span>
              </div>
            ))}

            {currentStep >= 3 && (
              <>
                <div className="flex flex-col items-center gap-1" style={{ opacity: currentStep >= 3 ? 1 : 0 }}>
                  <div className="font-mono text-2xl" style={{ color: '#a855f7' }}>→</div>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    style={{ background: isDark ? '#1a0a2e' : '#f5f3ff', border: '2px solid #a855f7', boxShadow: '0 0 20px #a855f744' }}>
                    <span className="text-2xl">🔗</span>
                    <span className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>FUSED</span>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>#INC-{1042 + state.incidents.length - 2}</span>
                </div>
              </>
            )}
          </div>

          {/* Step list */}
          <div className="space-y-2">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              const future = i > currentStep;
              return (
                <div key={i} className="flex items-center gap-3 transition-all duration-300"
                  style={{ opacity: future ? 0.3 : 1 }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold"
                    style={{
                      background: done ? (isDark ? '#14532d' : '#dcfce7') : current ? (isDark ? '#1e3a5f' : '#dbeafe') : 'var(--bg-surface)',
                      border: `1px solid ${done ? '#22c55e' : current ? step.color : 'var(--border-subtle)'}`,
                      color: done ? '#16a34a' : current ? step.color : 'var(--text-dim)',
                    }}>
                    {done ? '✓' : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: done ? 'var(--text-secondary)' : current ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {step.label}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.sub}</div>
                  </div>
                  {current && (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(j => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full animate-blink"
                          style={{ background: step.color, animationDelay: `${j * 200}ms` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {currentStep >= 4 && (
            <div className="mt-4 rounded-2xl p-4 animate-slide-up transition-colors"
              style={{ background: isDark ? '#0a1f2e' : '#f5f3ff', border: '1px solid #a855f7' }}>
              <div className="font-display text-base font-bold mb-2" style={{ color: '#9333ea' }}>
                ✓ 1 Unified Incident Created
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div><div style={{ color: 'var(--text-muted)' }}>REPORTS FUSED</div><div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>3</div></div>
                <div><div style={{ color: 'var(--text-muted)' }}>PRIORITY</div><div style={{ color: '#ef4444', fontWeight: 'bold' }}>P1 CRITICAL</div></div>
                <div><div style={{ color: 'var(--text-muted)' }}>CONFIDENCE</div><div style={{ color: '#16a34a', fontWeight: 'bold' }}>97%</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
