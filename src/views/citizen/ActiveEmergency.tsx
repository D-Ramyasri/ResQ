import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_META, StatusBadge, PriorityBadge } from '../../components/Shared';
import ThemeToggle from '../../components/ThemeToggle';

const CITIZEN_UPDATES: Record<string, { icon: string; text: string; color: string }> = {
  submitted: { icon: '📱', text: 'Emergency report submitted', color: '#94a3b8' },
  ai_processing: { icon: '⚙️', text: 'Location verified', color: '#94a3b8' },
  created: { icon: '⚡', text: 'Response initiated', color: '#f59e0b' },
  notified: { icon: '📡', text: 'Responders notified', color: '#f59e0b' },
  awaiting_approval: { icon: '👤', text: 'Awaiting manager approval', color: '#eab308' },
  assigned: { icon: '✓', text: 'Responder assigned', color: '#f97316' },
  dispatched: { icon: '🚨', text: 'Responders dispatched', color: '#f97316' },
  en_route: { icon: '🔵', text: 'Responders en route', color: '#3b82f6' },
  arriving: { icon: '🟣', text: 'Responders arriving', color: '#a855f7' },
  arrived: { icon: '🟣', text: 'Responders on scene', color: '#a855f7' },
  handling: { icon: '🟣', text: 'Emergency being handled', color: '#a855f7' },
  resolved: { icon: '✅', text: 'Emergency resolved', color: '#22c55e' },
};

export default function ActiveEmergency() {
  const { state, dispatch, theme } = useApp();
  const isDark = theme === 'dark';
  const { citizenActiveIncidentId, incidents, resources } = state;

  const inc = citizenActiveIncidentId ? incidents.find(i => i.id === citizenActiveIncidentId) : null;
  const assignedResources = inc ? resources.filter(r => inc.assignedResourceIds.includes(r.id)) : [];
  const update = inc ? CITIZEN_UPDATES[inc.status] : null;

  if (!inc) {
    return (
      <div className="h-full flex flex-col transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 backdrop-blur-md"
          style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
          <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citizen_dashboard' })}
            className="text-xl cursor-pointer" style={{ color: 'var(--text-secondary)' }}>←</button>
          <span className="font-display text-lg font-bold flex-1" style={{ color: 'var(--text-primary)' }}>Live Response</span>
          <ThemeToggle size="sm" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="text-5xl">📋</div>
          <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>No Active Emergency</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Report an emergency to see live response tracking here.</div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citizen_report' })}
            className="px-6 py-3 rounded-xl font-bold font-display tracking-wide shadow cursor-pointer"
            style={{ background: '#ef4444', color: 'white' }}
          >
            Report Emergency
          </button>
        </div>
      </div>
    );
  }

  const catMeta = CATEGORY_META[inc.category];

  return (
    <div className="h-full flex flex-col transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 backdrop-blur-md transition-colors duration-200"
        style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citizen_dashboard' })}
          className="text-xl cursor-pointer" style={{ color: 'var(--text-secondary)' }}>←</button>
        <div className="flex-1">
          <div className="font-display text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {catMeta.emoji} {inc.incidentNumber}
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Live Response Tracking</div>
        </div>
        <PriorityBadge priority={inc.priority} />
        <ThemeToggle size="sm" />
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Live status card */}
        <div
          className="rounded-2xl p-4 transition-colors shadow-md"
          style={{
            background: inc.status === 'resolved'
              ? (isDark ? '#0a1f0a' : '#f0fdf4')
              : (isDark ? '#1a0a0a' : '#fef2f2'),
            border: `1px solid ${inc.status === 'resolved' ? '#22c55e' : '#ef4444'}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={inc.status} />
            {inc.status === 'en_route' && inc.etaMinutes !== undefined && (
              <div className="font-display text-3xl font-bold" style={{ color: '#3b82f6' }}>
                {inc.etaMinutes}m ETA
              </div>
            )}
            {inc.status === 'arrived' && (
              <div className="font-display text-xl font-bold" style={{ color: '#a855f7' }}>ON SCENE</div>
            )}
            {inc.status === 'resolved' && (
              <div className="font-display text-xl font-bold" style={{ color: '#22c55e' }}>RESOLVED</div>
            )}
          </div>

          {update && (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: update.color }}>
              <span className="text-base">{update.icon}</span>
              <span>{update.text}</span>
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              📍 {inc.location.label}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              {inc.location.lat && (
                <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  {inc.location.lat.toFixed(4)}°, {inc.location.lng?.toFixed(4)}°
                </span>
              )}
              {inc.location.confirmed && (
                <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                  🔒 LOCKED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Map (citizen simplified) */}
        <div className="rounded-2xl overflow-hidden relative shadow-sm" style={{ height: 200, background: isDark ? '#0a1628' : '#e2e8f0', border: '1px solid var(--border-subtle)' }}>
          <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice">
            <rect width="100" height="60" fill={isDark ? '#0a1628' : '#e2e8f0'} />
            {[15, 30, 45].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={isDark ? '#122044' : '#cbd5e1'} strokeWidth="0.6" />)}
            {[20, 40, 60, 80].map(x => <line key={x} x1={x} y1="0" x2={x} y2="60" stroke={isDark ? '#122044' : '#cbd5e1'} strokeWidth="0.6" />)}

            {/* Incident location */}
            <circle cx="50" cy="30" r="4" fill="#ef444422" stroke="#ef4444" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="1.5" fill="#ef4444" />
            <circle cx="50" cy="30" r="6" fill="none" stroke="#ef4444" strokeWidth="0.4" opacity="0.4" className="animate-resource-move" />

            {/* Assigned resources moving toward incident */}
            {assignedResources.map(r => {
              const rx = r.location.x / 100 * 100;
              const ry = r.location.y / 100 * 60;
              const emoji = r.type === 'ambulance' ? '🚑' : r.type === 'fire_truck' ? '🚒' : r.type === 'police' ? '🚓' : '🛟';
              const color = r.status === 'en_route' ? '#3b82f6' : r.status === 'arrived' ? '#a855f7' : '#eab308';
              return (
                <g key={r.id} transform={`translate(${rx}, ${ry})`}>
                  {r.status === 'en_route' && (
                    <line x1="0" y1="0" x2={50 - rx} y2={30 - ry} stroke={color} strokeWidth="0.4" strokeDasharray="1 1" opacity="0.5" />
                  )}
                  <circle r="3" fill={isDark ? '#0f172a' : '#ffffff'} stroke={color} strokeWidth="0.6" />
                  <text x="0" y="1.2" textAnchor="middle" fontSize="3">{emoji}</text>
                  {r.status === 'en_route' && (
                    <circle r="4.5" fill="none" stroke={color} strokeWidth="0.3" opacity="0.4" className="animate-resource-move" />
                  )}
                </g>
              );
            })}
          </svg>
          <div className="absolute top-2 right-2 font-mono text-xs px-2.5 py-1 rounded-lg backdrop-blur-md"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <span className="live-dot w-1.5 h-1.5 rounded-full mr-1" style={{ background: '#22c55e' }} />
            LIVE
          </div>
        </div>

        {/* Assigned Responders */}
        {assignedResources.length > 0 && (
          <div>
            <div className="font-mono text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>ASSIGNED RESPONDERS</div>
            <div className="space-y-2">
              {assignedResources.map(r => (
                <div key={r.id} className="rounded-xl px-4 py-3 flex items-center justify-between transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {r.type === 'ambulance' ? '🚑' : r.type === 'fire_truck' ? '🚒' : r.type === 'police' ? '🚓' : '🛟'}
                    </span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                      <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.status === 'en_route' ? 'En route to you' : r.status === 'arrived' ? 'On scene' : 'Assigned'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {r.eta ? (
                      <div className="font-display text-xl font-bold" style={{ color: '#3b82f6' }}>{r.eta}m</div>
                    ) : (
                      <div className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>ON SCENE</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citizen Timeline */}
        <div>
          <div className="font-mono text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>RESPONSE TIMELINE</div>
          <div className="space-y-2 p-4 rounded-2xl transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
            {inc.timeline.filter(e => e.type !== 'ai' && e.type !== 'manager').map(ev => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22c55e' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ev.event}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {ev.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        {inc.status !== 'resolved' && (
          <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="font-mono text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>SAFETY GUIDANCE</div>
            <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {inc.category === 'crime' && (
                <>
                  <div>• Move away from the threat if safe to do so</div>
                  <div>• Do not confront the attacker</div>
                  <div>• Stay on the line — help is coming</div>
                  <div>• Apply pressure to any bleeding wounds</div>
                </>
              )}
              {inc.category === 'fire' && (
                <>
                  <div>• Evacuate the building immediately</div>
                  <div>• Do not use elevators</div>
                  <div>• Close doors to slow fire spread</div>
                  <div>• Stay low if there is smoke</div>
                </>
              )}
              {inc.category === 'accident' && (
                <>
                  <div>• Do not move injured persons unless in danger</div>
                  <div>• Turn off vehicle engines if safe to do so</div>
                  <div>• Keep the scene clear for responders</div>
                </>
              )}
              {!['crime', 'fire', 'accident'].includes(inc.category) && (
                <>
                  <div>• Stay calm and remain in a safe location</div>
                  <div>• Follow any instructions from emergency services</div>
                  <div>• Help is on the way</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="flex-shrink-0 flex transition-colors duration-200" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        {[
          { icon: '🏠', label: 'Dashboard', view: 'citizen_dashboard' as const },
          { icon: '🚨', label: 'Report', view: 'citizen_report' as const },
          { icon: '🔴', label: 'Live', view: 'citizen_active' as const },
        ].map(item => (
          <button
            key={item.view}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold cursor-pointer transition-colors"
            style={{ color: state.currentView === item.view ? '#ef4444' : 'var(--text-muted)' }}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
