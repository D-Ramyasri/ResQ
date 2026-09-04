import React from 'react';
import type { Priority, IncidentStatus, ResourceStatus, IncidentCategory, Domain, TimelineEvent } from '../types';

export const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  fire: { emoji: '🔥', label: 'Fire', color: '#f97316' },
  medical: { emoji: '🚑', label: 'Medical', color: '#ef4444' },
  accident: { emoji: '🚗', label: 'Accident', color: '#f59e0b' },
  crime: { emoji: '👮', label: 'Crime', color: '#3b82f6' },
  disaster: { emoji: '🌪️', label: 'Disaster', color: '#8b5cf6' },
  other: { emoji: '🤖', label: 'Other / AI Detect', color: '#6b7280' },
  police: { emoji: '👮', label: 'Police / Law Enf.', color: '#3b82f6' },
};

export const DOMAIN_META: Record<string, { emoji: string; label: string; color: string }> = {
  fire: { emoji: '🔥', label: 'Fire', color: '#f97316' },
  medical: { emoji: '🚑', label: 'Medical', color: '#ef4444' },
  police: { emoji: '👮', label: 'Police', color: '#3b82f6' },
  accident: { emoji: '🚗', label: 'Accident/Traffic', color: '#f59e0b' },
  disaster: { emoji: '🌪️', label: 'Disaster/Rescue', color: '#8b5cf6' },
  crime: { emoji: '👮', label: 'Police', color: '#3b82f6' },
  other: { emoji: '🤖', label: 'AI Operations', color: '#6b7280' },
};

export function getDomainMeta(d?: string) {
  if (!d) return { emoji: '🚨', label: 'General', color: '#3b82f6' };
  const key = d.toLowerCase();
  return DOMAIN_META[key] || { emoji: '🚨', label: d.toUpperCase(), color: '#3b82f6' };
}

export function getCategoryMeta(c?: string) {
  if (!c) return { emoji: '🚨', label: 'Emergency', color: '#ef4444' };
  const key = c.toLowerCase();
  return CATEGORY_META[key] || { emoji: '🚨', label: c.toUpperCase(), color: '#ef4444' };
}

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string; label: string }> = {
  P1: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444', label: 'P1 CRITICAL' },
  P2: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316', label: 'P2 HIGH' },
  P3: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: '#eab308', label: 'P3 MODERATE' },
  P4: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: '#22c55e', label: 'P4 LOW' },
};

export const STATUS_META: Record<IncidentStatus, { label: string; color: string; dot: string }> = {
  submitted: { label: 'Submitted', color: 'var(--text-secondary)', dot: '#94a3b8' },
  ai_processing: { label: 'AI Processing', color: '#3b82f6', dot: '#3b82f6' },
  created: { label: 'Created', color: '#3b82f6', dot: '#3b82f6' },
  notified: { label: 'Notified', color: '#f97316', dot: '#f97316' },
  awaiting_approval: { label: 'Awaiting Approval', color: '#eab308', dot: '#eab308' },
  assigned: { label: 'Assigned', color: '#f97316', dot: '#f97316' },
  dispatched: { label: 'Dispatched', color: '#f97316', dot: '#f97316' },
  en_route: { label: 'En Route', color: '#3b82f6', dot: '#3b82f6' },
  arriving: { label: 'Arriving', color: '#a855f7', dot: '#a855f7' },
  arrived: { label: 'On Scene', color: '#a855f7', dot: '#a855f7' },
  handling: { label: 'Handling', color: '#a855f7', dot: '#a855f7' },
  resolved: { label: 'Resolved', color: '#22c55e', dot: '#22c55e' },
};

export const RESOURCE_STATUS_META: Record<ResourceStatus, { label: string; color: string; emoji: string }> = {
  available: { label: 'AVAILABLE', color: '#22c55e', emoji: '🟢' },
  assigned: { label: 'ASSIGNED', color: '#eab308', emoji: '🟡' },
  en_route: { label: 'EN ROUTE', color: '#3b82f6', emoji: '🔵' },
  arrived: { label: 'ON SCENE', color: '#a855f7', emoji: '🟣' },
  busy: { label: 'BUSY', color: '#ef4444', emoji: '🔴' },
  offline: { label: 'OFFLINE', color: '#6b7280', emoji: '⚫' },
};

export function PriorityBadge({ priority, className = '' }: { priority: Priority; className?: string }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <span
      className={`inline-flex items-center font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${className}`}
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const m = STATUS_META[status];
  const isLive = ['en_route', 'arrived', 'handling', 'awaiting_approval', 'assigned', 'dispatched'].includes(status);
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? 'live-dot' : ''}`}
        style={{ background: m.dot }}
      />
      <span style={{ color: m.color }}>{m.label.toUpperCase()}</span>
    </span>
  );
}

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  const m = RESOURCE_STATUS_META[status];
  return (
    <span className="font-mono text-xs font-semibold" style={{ color: m.color }}>
      {m.emoji} {m.label}
    </span>
  );
}

export function KPICard({
  label, value, sub, color, icon,
}: {
  label: string; value: string | number; sub?: string; color?: string; icon?: string;
}) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-1 transition-colors duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="font-display text-3xl font-bold" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );
}

export function LiveDot({ color = '#ef4444' }: { color?: string }) {
  return (
    <span className="live-dot inline-block w-2 h-2 rounded-full" style={{ background: color }} />
  );
}

export function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  const typeColors: Record<TimelineEvent['type'], string> = {
    system: '#64748b', ai: '#3b82f6', manager: '#f59e0b', responder: '#22c55e', citizen: '#8b5cf6',
  };
  const typeIcons: Record<TimelineEvent['type'], string> = {
    system: '⚙', ai: '🤖', manager: '👤', responder: '🚨', citizen: '📱',
  };

  return (
    <div className="space-y-0">
      {events.map((ev, i) => (
        <div key={ev.id} className="flex gap-3 relative">
          <div className="flex flex-col items-center">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 flex-shrink-0"
              style={{ background: 'var(--bg-card-hover)', border: `1px solid ${typeColors[ev.type]}`, color: typeColors[ev.type] }}
            >
              {typeIcons[ev.type]}
            </div>
            {i < events.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: 'var(--border-subtle)', minHeight: '20px' }} />
            )}
          </div>
          <div className="pb-4 flex-1">
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ev.event}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {ev.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DomainRow({ active }: { active: (Domain | string)[] }) {
  const ALL_DOMAINS: Domain[] = ['fire', 'medical', 'police', 'accident', 'disaster'];
  return (
    <div className="grid grid-cols-5 gap-1">
      {ALL_DOMAINS.map(d => {
        const m = getDomainMeta(d);
        const isActive = active.includes(d) || (d === 'police' && active.includes('crime'));
        return (
          <div
            key={d}
            className="flex flex-col items-center gap-1 rounded p-2 text-center transition-colors duration-200"
            style={{
              background: isActive ? `${m.color}18` : 'var(--bg-surface)',
              border: `1px solid ${isActive ? m.color : 'var(--border-subtle)'}`,
              opacity: isActive ? 1 : 0.4,
            }}
          >
            <span className="text-xl">{m.emoji}</span>
            <span
              className="font-mono text-xs font-semibold uppercase tracking-wider"
              style={{ color: isActive ? m.color : 'var(--text-muted)' }}
            >
              {m.label.split('/')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AIConfidenceMeter({ value }: { value: number }) {
  const color = value >= 90 ? '#22c55e' : value >= 75 ? '#f97316' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg transition-colors duration-200 ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-widest mb-3 font-mono" style={{ color: 'var(--text-dim)' }}>
      {children}
    </div>
  );
}
