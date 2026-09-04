import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import ThemeToggle from '../components/ThemeToggle';

const ROLE_DETAILS: Record<string, {
  title: string; subtitle: string; desc: string; color: string; gradientDark: string; gradientLight: string; capabilities: string[];
}> = {
  citizen: {
    title: 'Citizen', subtitle: 'Emergency Reporter',
    desc: 'Report emergencies and track real-time response status.',
    color: '#3b82f6', gradientDark: '#1a2236', gradientLight: '#eff6ff',
    capabilities: ['Submit emergency report', 'Live ETA tracking', 'Safety notifications', 'Response progress'],
  },
  fire: {
    title: 'Fire Manager', subtitle: 'Fire Response Command',
    desc: 'Command fire suppression and rescue operations.',
    color: '#f97316', gradientDark: '#1f1208', gradientLight: '#fff7ed',
    capabilities: ['Active fire incidents', 'Engine deployment', 'Hazmat coordination', 'Live map tracking'],
  },
  medical: {
    title: 'Medical Manager', subtitle: 'EMS Operations',
    desc: 'Coordinate ambulance dispatch and hospital readiness.',
    color: '#ef4444', gradientDark: '#1f0a0a', gradientLight: '#fef2f2',
    capabilities: ['Ambulance dispatch', 'Hospital capacity', 'Patient triage', 'Critical case management'],
  },
  police: {
    title: 'Police Manager', subtitle: 'Law Enforcement Command',
    desc: 'Manage crime incidents and coordinate patrol response.',
    color: '#2563eb', gradientDark: '#0a1220', gradientLight: '#eff6ff',
    capabilities: ['Crime incident management', 'Unit coordination', 'Evidence tracking', 'Multi-agency liaison'],
  },
  accident: {
    title: 'Accident Manager', subtitle: 'Traffic & Rescue Ops',
    desc: 'Handle crash scenes and manage road impact.',
    color: '#f59e0b', gradientDark: '#1f1608', gradientLight: '#fffbeb',
    capabilities: ['Accident scene control', 'Traffic management', 'Rescue coordination', 'Multi-domain routing'],
  },
  disaster: {
    title: 'Disaster Manager', subtitle: 'Rescue & Relief Director',
    desc: 'Lead large-scale disaster response and mass rescue.',
    color: '#8b5cf6', gradientDark: '#140a1f', gradientLight: '#f5f3ff',
    capabilities: ['Mass rescue operations', 'Safe zone mapping', 'Resource coordination', 'Relief deployment'],
  },
  command: {
    title: 'Command Center', subtitle: 'System-Wide Operations',
    desc: 'Full situational awareness across all domains.',
    color: '#10b981', gradientDark: '#0a1f0a', gradientLight: '#ecfdf5',
    capabilities: ['All incidents overview', 'Real-time resource map', 'AI alert monitoring', 'Cross-domain coordination'],
  },
};

const LIVE_STATS = [
  { label: 'ACTIVE INCIDENTS', value: '3', color: '#ef4444' },
  { label: 'CRITICAL (P1)', value: '1', color: '#ef4444' },
  { label: 'RESPONDERS ACTIVE', value: '37', color: '#3b82f6' },
  { label: 'AVAILABLE UNITS', value: '18', color: '#10b981' },
  { label: 'AVG RESPONSE', value: '5m 42s', color: '#f59e0b' },
  { label: 'RESOLVED TODAY', value: '42', color: '#10b981' },
];

const FLOW_STEPS = [
  { label: 'REPORT', icon: '📱' },
  { label: 'UNDERSTAND', icon: '🤖' },
  { label: 'FUSE', icon: '🔗' },
  { label: 'PRIORITIZE', icon: '⚡' },
  { label: 'ROUTE', icon: '📡' },
  { label: 'ALLOCATE', icon: '🚒' },
  { label: 'APPROVE', icon: '✓' },
  { label: 'DISPATCH', icon: '🚨' },
  { label: 'TRACK', icon: '🗺' },
  { label: 'RESOLVE', icon: '✅' },
];

export default function LoginView() {
  const { login, theme } = useApp();
  const isDark = theme === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % FLOW_STEPS.length), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full overflow-auto transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-20 backdrop-blur-md transition-colors duration-200"
        style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-sm"
            style={{ background: '#ef4444', color: 'white', fontFamily: 'Barlow Condensed, sans-serif' }}>R</div>
          <div>
            <div className="font-display text-2xl font-black tracking-wide" style={{ color: 'var(--text-primary)' }}>ResQ</div>
            <div className="font-mono text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>AI Emergency Response & Resource Coordination</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle showLabel size="sm" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="font-display text-4xl sm:text-5xl font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            One Emergency.<br />
            <span style={{ color: '#ef4444' }}>One Unified Incident.</span><br />
            Multiple Coordinated Responses.
          </div>
          <div className="text-base sm:text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 24px' }}>
            AI-assisted emergency coordination platform that converts fragmented citizen reports into real-time operational intelligence.
          </div>

          {/* Animated flow banner */}
          <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2"
            style={{ maxWidth: 900, margin: '0 auto' }}>
            {FLOW_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg flex-shrink-0 transition-all duration-300"
                  style={{
                    background: i === activeStep ? (isDark ? '#1a0505' : '#fee2e2') : 'transparent',
                    border: `1px solid ${i === activeStep ? '#ef4444' : 'transparent'}`,
                    transform: i === activeStep ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  <span className="text-base">{step.icon}</span>
                  <span className="font-mono text-xs font-bold"
                    style={{ color: i === activeStep ? '#ef4444' : i < activeStep ? '#22c55e' : 'var(--text-dim)' }}>
                    {step.label}
                  </span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="w-3 h-px flex-shrink-0 transition-all"
                    style={{ background: i < activeStep ? '#22c55e' : 'var(--border-subtle)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10 p-5 rounded-2xl transition-colors duration-200"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
          {LIVE_STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="font-mono text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Role selection header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Select Your Role</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Each role gets a dedicated dashboard. Actions are shared in real-time across all dashboards.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEMO_USERS.map(user => {
            const meta = ROLE_DETAILS[user.role];
            if (!meta) return null;
            const isHovered = hoveredRole === user.role;
            const activeBg = isDark ? meta.gradientDark : meta.gradientLight;
            return (
              <button
                key={user.id}
                onClick={() => login(user)}
                onMouseEnter={() => setHoveredRole(user.role)}
                onMouseLeave={() => setHoveredRole(null)}
                className="text-left rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between"
                style={{
                  background: isHovered ? activeBg : 'var(--bg-card)',
                  border: `1px solid ${isHovered ? meta.color : 'var(--border-subtle)'}`,
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isHovered ? `0 8px 30px ${meta.color}22` : 'var(--shadow-elevation)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  {/* Icon + role badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>
                      {user.avatar}
                    </div>
                    <div className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }}>
                      {user.role.toUpperCase()}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="font-display text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                    {meta.title}
                  </div>
                  <div className="font-mono text-xs mb-3 font-semibold" style={{ color: meta.color }}>{meta.subtitle}</div>
                  <div className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{meta.desc}</div>

                  {/* Capabilities */}
                  <div className="space-y-1 mb-4">
                    {meta.capabilities.map(cap => (
                      <div key={cap} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: meta.color }}>✓</span>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign in as */}
                <div className="pt-3 w-full" style={{ borderTop: `1px solid ${isHovered ? meta.color + '33' : 'var(--border-subtle)'}` }}>
                  <div className="font-mono text-xs mb-0.5" style={{ color: 'var(--text-dim)' }}>Login as</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-2">
          <div className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
            DEMO MODE — All state is shared across role dashboards in real-time. Use the ⚡ DEMO button to trigger scenarios.
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            ResQ AI Emergency Platform · Hackathon Edition
          </div>
        </div>
      </div>
    </div>
  );
}
