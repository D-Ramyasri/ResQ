import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';
import ThemeToggle from '../../components/ThemeToggle';

interface NavItem {
  icon: string;
  label: string;
  key: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  fire: [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '🔥', label: 'Incidents', key: 'incidents' },
    { icon: '🗺', label: 'Live Map', key: 'map' },
    { icon: '🚒', label: 'Resources', key: 'resources' },
    { icon: '📋', label: 'Assignments', key: 'assignments' },
    { icon: '🔔', label: 'Notifications', key: 'notifications' },
    { icon: '📈', label: 'Analytics', key: 'analytics' },
  ],
  medical: [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '🚨', label: 'Incidents', key: 'incidents' },
    { icon: '🗺', label: 'Live Map', key: 'map' },
    { icon: '🚑', label: 'Ambulances', key: 'resources' },
    { icon: '🏥', label: 'Hospitals', key: 'hospitals' },
    { icon: '📋', label: 'Assignments', key: 'assignments' },
    { icon: '🔔', label: 'Notifications', key: 'notifications' },
    { icon: '📈', label: 'Analytics', key: 'analytics' },
  ],
  police: [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '🚨', label: 'Incidents', key: 'incidents' },
    { icon: '🗺', label: 'Live Map', key: 'map' },
    { icon: '🚓', label: 'Police Units', key: 'resources' },
    { icon: '📋', label: 'Assignments', key: 'assignments' },
    { icon: '⚠️', label: 'Alerts', key: 'alerts' },
    { icon: '📈', label: 'Analytics', key: 'analytics' },
  ],
  accident: [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '🚗', label: 'Incidents', key: 'incidents' },
    { icon: '🗺', label: 'Live Map', key: 'map' },
    { icon: '🚧', label: 'Traffic', key: 'traffic' },
    { icon: '🛟', label: 'Resources', key: 'resources' },
    { icon: '📋', label: 'Assignments', key: 'assignments' },
    { icon: '📈', label: 'Analytics', key: 'analytics' },
  ],
  disaster: [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '🌪️', label: 'Incidents', key: 'incidents' },
    { icon: '🗺', label: 'Live Map', key: 'map' },
    { icon: '🛟', label: 'Rescue', key: 'resources' },
    { icon: '📋', label: 'Assignments', key: 'assignments' },
    { icon: '⚠️', label: 'Alerts', key: 'alerts' },
    { icon: '📈', label: 'Analytics', key: 'analytics' },
  ],
  citizen: [],
  command: [],
};

const ROLE_META: Record<Role, { label: string; color: string; emoji: string }> = {
  fire: { label: 'Fire Response', color: '#f97316', emoji: '🔥' },
  medical: { label: 'Medical Response', color: '#ef4444', emoji: '🚑' },
  police: { label: 'Police Command', color: '#3b82f6', emoji: '👮' },
  accident: { label: 'Traffic & Rescue', color: '#f59e0b', emoji: '🚗' },
  disaster: { label: 'Disaster Response', color: '#8b5cf6', emoji: '🌪️' },
  citizen: { label: 'Citizen', color: '#94a3b8', emoji: '👤' },
  command: { label: 'Command Center', color: '#10b981', emoji: '🧑‍💼' },
};

interface Props {
  children: (activeNav: string, setActiveNav: (v: string) => void) => React.ReactNode;
}

export default function ResponderLayout({ children }: Props) {
  const { state, dispatch, getMyNotifications } = useApp();
  const { currentUser } = state;
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = currentUser?.role ?? 'police';
  const meta = ROLE_META[role];
  const navItems = NAV_BY_ROLE[role] ?? [];
  const unreadNotifs = getMyNotifications().filter(n => !n.read).length;

  return (
    <div className="h-full flex transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-200"
        style={{
          width: sidebarOpen ? 220 : 60,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm"
            style={{ background: meta.color, color: 'white' }}>R</div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-display text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>ResQ</div>
              <div className="font-mono text-xs font-semibold truncate" style={{ color: meta.color }}>{meta.label}</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="flex-shrink-0 text-xs w-6 h-6 flex items-center justify-center rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-3 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: 14 }}>
            {currentUser?.avatar}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</div>
              <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{role.toUpperCase()}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-auto space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative cursor-pointer select-none"
              style={{
                background: activeNav === item.key ? `${meta.color}18` : 'transparent',
                color: activeNav === item.key ? meta.color : 'var(--text-secondary)',
                borderRight: activeNav === item.key ? `3px solid ${meta.color}` : '3px solid transparent',
                fontWeight: activeNav === item.key ? '600' : '500',
              }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {item.key === 'notifications' && unreadNotifs > 0 && (
                <span
                  className="absolute right-3 top-2 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#ef4444', color: 'white', fontSize: 9 }}
                >
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions & Theme Toggle */}
        <div className="p-3 space-y-2 transition-colors" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle size="sm" showLabel className="flex-1" />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeToggle size="sm" />
            </div>
          )}

          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>⇐</span>
            {sidebarOpen && <span>Switch Role</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children(activeNav, setActiveNav)}
      </div>
    </div>
  );
}
