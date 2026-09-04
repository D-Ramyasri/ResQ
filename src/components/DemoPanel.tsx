import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import ThemeToggle from './ThemeToggle';

const SCENARIOS = [
  {
    id: 'crime_medical',
    emoji: '👮',
    title: 'Crime + Medical',
    desc: 'Attack victim with bleeding — Police + Medical response. Shows multi-domain routing.',
    color: '#3b82f6',
    flow: ['Submit crime report', 'AI: Police + Medical domains triggered', 'Both managers receive alert', 'Resources recommended', 'Manager approves → dispatched'],
  },
  {
    id: 'accident',
    emoji: '🚗',
    title: 'Multi-Vehicle Accident',
    desc: 'Crash with entrapment — 4 domains: Accident + Fire + Medical + Police.',
    color: '#f59e0b',
    flow: ['Submit accident report', 'AI: 4 domains triggered', 'All 4 managers notified', 'Full resource recommendation', 'Coordinated multi-domain dispatch'],
  },
  {
    id: 'fusion',
    emoji: '🔗',
    title: 'Duplicate Fusion',
    desc: '3 citizens report same accident → AI detects duplicates → 1 unified incident with 3 sources.',
    color: '#a855f7',
    flow: ['3 separate citizen reports', 'AI proximity + time matching', 'Fusion animation', '1 unified incident created', 'Severity upgraded from 3 sources'],
  },
  {
    id: 'reallocation',
    emoji: '🔄',
    title: 'Dynamic Reallocation',
    desc: 'Primary resource becomes unavailable → AI recalculates → new recommendation → manager approves.',
    color: '#ef4444',
    flow: ['Resource A initially recommended', 'Resource A becomes BUSY', 'AI detects unavailability', 'AI recalculates → Resource B', 'Manager approves new assignment'],
  },
];

const ROLE_SHORTCUT = [
  { role: 'citizen', label: '👤 Citizen', color: '#3b82f6' },
  { role: 'police', label: '👮 Police', color: '#2563eb' },
  { role: 'medical', label: '🚑 Medical', color: '#ef4444' },
  { role: 'fire', label: '🔥 Fire', color: '#f97316' },
  { role: 'accident', label: '🚗 Accident', color: '#f59e0b' },
  { role: 'command', label: '🧑‍💼 Command', color: '#10b981' },
];

export default function DemoPanel() {
  const { state, dispatch, login, triggerDemoScenario, triggerFusionDemo, triggerReallocationDemo, addToast } = useApp();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'scenarios' | 'roles'>('scenarios');

  const handleScenario = (id: string) => {
    if (id === 'fusion') {
      triggerFusionDemo();
      addToast('🔗 Fusion demo triggered — 3 reports being merged...', 'info');
      setOpen(false);
    } else if (id === 'reallocation') {
      triggerReallocationDemo();
      setOpen(false);
    } else {
      triggerDemoScenario(id as 'crime_medical' | 'accident');
      // Navigate to citizen report if not citizen
      if (state.currentUser?.role !== 'citizen') {
        const citizen = DEMO_USERS.find(u => u.role === 'citizen');
        if (citizen) {
          login(citizen);
          setTimeout(() => dispatch({ type: 'SET_VIEW', payload: 'citizen_report' }), 100);
        }
      } else {
        dispatch({ type: 'SET_VIEW', payload: 'citizen_report' });
      }
      setOpen(false);
    }
  };

  const handleRoleSwitch = (role: string) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) { login(user); setOpen(false); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-mono text-sm font-bold transition-all shadow-xl cursor-pointer select-none active:scale-95"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          color: '#10b981',
          boxShadow: 'var(--shadow-elevation)',
        }}
      >
        <span className="text-base">{open ? '✕' : '⚡'}</span>
        {open ? 'CLOSE' : 'DEMO'}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 left-6 z-50 rounded-2xl overflow-hidden animate-slide-up shadow-2xl transition-colors duration-200"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevation)',
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Demo Control Panel</div>
              </div>
              <ThemeToggle size="sm" />
            </div>
            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              ResQ Hackathon Demo — Trigger scenarios or switch roles
            </div>
          </div>

          {/* Tabs */}
          <div className="flex transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            {(['scenarios', 'roles'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-bold transition-all cursor-pointer"
                style={{
                  color: tab === t ? '#10b981' : 'var(--text-muted)',
                  borderBottom: tab === t ? '2px solid #10b981' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                {t === 'scenarios' ? '🎬 Scenarios' : '👥 Switch Role'}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {tab === 'scenarios' && (
              <div className="space-y-2">
                {SCENARIOS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleScenario(s.id)}
                    className="w-full text-left rounded-xl p-3 transition-all cursor-pointer hover:border-emerald-500"
                    style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-subtle)` }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl flex-shrink-0">{s.emoji}</span>
                      <div className="flex-1">
                        <div className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.flow.map((step, i) => (
                        <span key={i} className="font-mono text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}33` }}>
                          {i + 1}. {step}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === 'roles' && (
              <div className="space-y-2">
                <div className="font-mono text-xs mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  CURRENT: {state.currentUser?.role?.toUpperCase() ?? 'NONE'} — {state.currentUser?.name}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_SHORTCUT.map(r => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r.role)}
                      className="rounded-xl py-2.5 px-3 text-sm font-bold transition-all cursor-pointer shadow-sm"
                      style={{
                        background: state.currentUser?.role === r.role ? `${r.color}22` : 'var(--bg-surface)',
                        border: `1px solid ${state.currentUser?.role === r.role ? r.color : 'var(--border-subtle)'}`,
                        color: state.currentUser?.role === r.role ? r.color : 'var(--text-secondary)',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono text-xs mb-2 font-bold" style={{ color: 'var(--text-dim)' }}>DEMO TIP</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Open multiple browser tabs to simulate different roles simultaneously.
                    Actions in one role update all other dashboards in real-time.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 flex items-center justify-between transition-colors"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
            <div className="font-mono text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
              <span className="live-dot w-1.5 h-1.5 rounded-full mr-1" style={{ background: '#22c55e' }} />
              LIVE DEMO MODE
            </div>
            <button
              onClick={() => dispatch({ type: 'RESET_STATE' })}
              className="font-mono text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              Reset State
            </button>
          </div>
        </div>
      )}
    </>
  );
}
