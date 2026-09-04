import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_META, PriorityBadge, StatusBadge } from '../../components/Shared';
import type { IncidentStatus } from '../../types';
import ThemeToggle from '../../components/ThemeToggle';

const STATUS_ORDER: IncidentStatus[] = [
  'submitted', 'ai_processing', 'created', 'notified',
  'awaiting_approval', 'assigned', 'dispatched', 'en_route',
  'arriving', 'arrived', 'handling', 'resolved',
];

const CITIZEN_STEPS: { key: IncidentStatus; label: string; icon: string }[] = [
  { key: 'submitted', label: 'Report submitted', icon: '📱' },
  { key: 'created', label: 'Response initiated', icon: '⚡' },
  { key: 'assigned', label: 'Responder assigned', icon: '✓' },
  { key: 'en_route', label: 'En route to you', icon: '🔵' },
  { key: 'arrived', label: 'Responder arrived', icon: '🟣' },
  { key: 'resolved', label: 'Incident resolved', icon: '✅' },
];

function stepDone(incStatus: IncidentStatus, stepKey: IncidentStatus): boolean {
  return STATUS_ORDER.indexOf(incStatus) >= STATUS_ORDER.indexOf(stepKey);
}

export default function CitizenDashboard() {
  const { state, dispatch, triggerDemoScenario, theme } = useApp();
  const isDark = theme === 'dark';
  const { incidents, citizenActiveIncidentId, currentUser, notifications, resources } = state;
  const [activeTab, setActiveTab] = useState<'home' | 'notifications' | 'history'>('home');

  const activeIncident = citizenActiveIncidentId
    ? incidents.find(i => i.id === citizenActiveIncidentId)
    : null;

  const assignedResources = activeIncident
    ? resources.filter(r => activeIncident.assignedResourceIds.includes(r.id))
    : [];

  const myNotifications = notifications.filter(
    n => n.targetRole === 'citizen' || n.targetRole === 'all'
  );
  const unreadCount = myNotifications.filter(n => !n.read).length;
  const myHistory = incidents.filter(i => i.reports.some(r => r.citizenId === currentUser?.id));

  const typeEmoji: Record<string, string> = { ambulance: '🚑', fire_truck: '🚒', police: '🚓', rescue: '🛟' };

  return (
    <div className="h-full flex flex-col transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 backdrop-blur-md transition-colors duration-200"
        style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shadow-sm"
            style={{ background: '#ef4444', color: 'white', fontFamily: 'Barlow Condensed, sans-serif' }}>R</div>
          <div>
            <div className="font-display text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>ResQ</div>
            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Emergency Response</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
            <span>📍 {activeIncident?.location.label ? activeIncident.location.label.split('—')[0].trim() : 'Downtown Central'}</span>
          </div>
          <ThemeToggle size="sm" />
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
            title="Logout / Switch User"
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            {currentUser?.avatar}
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-shrink-0 transition-colors duration-200" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'notifications', label: 'Alerts', icon: '🔔', badge: unreadCount },
          { id: 'history', label: 'History', icon: '📋' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold relative transition-colors cursor-pointer"
            style={{
              color: activeTab === tab.id ? '#ef4444' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid #ef4444' : '2px solid transparent',
            }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge ? (
              <span className="absolute top-1 right-6 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: '#ef4444', color: 'white', fontSize: 9 }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
            {/* Active Emergency Card */}
            {activeIncident && activeIncident.status !== 'resolved' && (
              <div className="rounded-2xl overflow-hidden animate-slide-up shadow-md transition-colors"
                style={{
                  background: isDark ? '#120808' : '#fef2f2',
                  border: '2px solid #ef4444',
                  boxShadow: isDark ? '0 0 30px #ef444422' : '0 4px 20px rgba(239, 68, 68, 0.15)',
                }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: isDark ? '#1a0808' : '#fee2e2', borderBottom: '1px solid #ef444433' }}>
                  <div className="flex items-center gap-2">
                    <span className="live-dot w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                    <span className="font-display font-bold text-sm sm:text-base tracking-wide" style={{ color: '#ef4444' }}>ACTIVE EMERGENCY</span>
                  </div>
                  <PriorityBadge priority={activeIncident.priority} />
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${CATEGORY_META[activeIncident.category].color}22` }}>
                      {CATEGORY_META[activeIncident.category].emoji}
                    </div>
                    <div>
                      <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {activeIncident.incidentNumber}
                      </div>
                      <div className="font-mono text-xs font-medium flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
                        <span>📍 {activeIncident.location.label}</span>
                        {activeIncident.location.lat && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                            {activeIncident.location.lat.toFixed(4)}°, {activeIncident.location.lng?.toFixed(4)}°
                          </span>
                        )}
                        {activeIncident.location.confirmed && (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                            ✓ VERIFIED GPS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + ETA */}
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={activeIncident.status} />
                    {activeIncident.status === 'en_route' && activeIncident.etaMinutes != null && (
                      <div className="text-right">
                        <div className="font-display text-3xl font-bold" style={{ color: '#3b82f6' }}>
                          {activeIncident.etaMinutes}m
                        </div>
                        <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>estimated arrival</div>
                      </div>
                    )}
                    {activeIncident.status === 'arrived' && (
                      <div className="font-display text-xl font-bold" style={{ color: '#a855f7' }}>🟣 ON SCENE</div>
                    )}
                  </div>

                  {/* Assigned responders */}
                  {assignedResources.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {assignedResources.map(r => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {typeEmoji[r.type] ?? '🚒'} {r.name}
                          </span>
                          <span className="font-mono text-xs font-semibold" style={{ color: r.status === 'arrived' ? '#a855f7' : '#3b82f6' }}>
                            {r.status === 'arrived' ? 'On scene' : r.eta ? `${r.eta}m away` : 'En route'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress steps */}
                  <div className="flex items-center gap-0 my-3">
                    {CITIZEN_STEPS.map((step, i) => {
                      const done = stepDone(activeIncident.status, step.key);
                      const current = activeIncident.status === step.key;
                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                background: done ? (isDark ? '#14532d' : '#dcfce7') : current ? (isDark ? '#1e3a5f' : '#dbeafe') : 'var(--bg-card)',
                                border: `1px solid ${done ? '#22c55e' : current ? '#3b82f6' : 'var(--border-subtle)'}`,
                                color: done ? '#16a34a' : current ? '#2563eb' : 'var(--text-dim)',
                              }}>
                              {done ? '✓' : current ? '○' : '○'}
                            </div>
                          </div>
                          {i < CITIZEN_STEPS.length - 1 && (
                            <div className="h-px flex-1" style={{ background: done && stepDone(activeIncident.status, CITIZEN_STEPS[i + 1].key) ? '#22c55e' : 'var(--border-subtle)' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citizen_active' })}
                    className="w-full py-3 rounded-xl font-display text-base font-bold transition-all shadow cursor-pointer active:scale-98"
                    style={{ background: '#ef4444', color: 'white' }}>
                    VIEW LIVE RESPONSE →
                  </button>
                </div>
              </div>
            )}

            {/* Resolved card */}
            {activeIncident && activeIncident.status === 'resolved' && (
              <div className="rounded-2xl p-4 animate-slide-up transition-colors"
                style={{ background: isDark ? '#0a1f0a' : '#f0fdf4', border: '2px solid #22c55e' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-display font-bold" style={{ color: '#16a34a' }}>Emergency Resolved</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{activeIncident.incidentNumber}</div>
                  </div>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your emergency has been handled. Thank you for using ResQ.
                </div>
              </div>
            )}

            {/* Report Emergency CTA */}
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'citizen_report' })}
              className="w-full rounded-2xl py-7 flex flex-col items-center gap-2 transition-all cursor-pointer active:scale-98 shadow-md"
              style={{
                background: isDark ? '#1a0505' : '#fee2e2',
                border: '2px solid #ef4444',
              }}>
              <div className="text-5xl animate-bounce">🚨</div>
              <div className="font-display text-2xl font-bold tracking-wide" style={{ color: isDark ? '#f1f5f9' : '#991b1b' }}>REPORT EMERGENCY</div>
              <div className="text-sm font-medium" style={{ color: isDark ? '#94a3b8' : '#b91c1c' }}>Fire · Medical · Crime · Accident · Disaster</div>
            </button>

            {/* Quick demo scenarios */}
            <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
              <div className="font-mono text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>⚡ DEMO SCENARIOS — QUICK LOAD</div>
              <div className="space-y-2">
                {[
                  { id: 'crime_medical', emoji: '👮', title: 'Crime + Medical', desc: 'Attack with bleeding — Police + Medical' },
                  { id: 'accident', emoji: '🚗', title: 'Multi-Vehicle Accident', desc: 'Crash + entrapment — 4 domains' },
                ].map(s => (
                  <button key={s.id}
                    onClick={() => { triggerDemoScenario(s.id as any); dispatch({ type: 'SET_VIEW', payload: 'citizen_report' }); }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer hover:border-blue-500"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                    <span className="ml-auto text-sm" style={{ color: 'var(--text-dim)' }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
              <div className="font-mono text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>EMERGENCY SAFETY TIPS</div>
              <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-start gap-2"><span>•</span><span>Stay calm and move to a safe location</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Keep your phone accessible for updates</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Follow responder instructions when they arrive</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Call 911 if you need immediate voice assistance</span></div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">
            {myNotifications.length === 0 && (
              <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                <div className="text-4xl mb-3">🔔</div>
                <div className="font-semibold">No notifications yet</div>
                <div className="text-xs mt-1">Submit an emergency to receive updates</div>
              </div>
            )}
            {myNotifications.map(n => (
              <div key={n.id} className="rounded-2xl p-4 transition-colors"
                style={{
                  background: n.read ? 'var(--bg-surface)' : 'var(--bg-card)',
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--border-default)'}`,
                  opacity: n.read ? 0.7 : 1,
                  boxShadow: 'var(--shadow-elevation)',
                }}>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                <div className="font-mono text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
                  {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="px-4 py-4 space-y-2 max-w-2xl mx-auto">
            {myHistory.length === 0 && (
              <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                <div className="text-4xl mb-3">📋</div>
                <div className="font-semibold">No reports yet</div>
              </div>
            )}
            {myHistory.map(inc => (
              <div key={inc.id} className="rounded-2xl px-4 py-3 flex items-center justify-between transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_META[inc.category].emoji}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{inc.incidentNumber}</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {inc.createdAt.toLocaleDateString()} · {inc.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <StatusBadge status={inc.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="flex-shrink-0 flex transition-colors duration-200" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        {[
          { icon: '🏠', label: 'Home', view: 'citizen_dashboard' as const },
          { icon: '🚨', label: 'Report', view: 'citizen_report' as const },
          { icon: activeIncident && activeIncident.status !== 'resolved' ? '🔴' : '📡', label: 'Live', view: 'citizen_active' as const },
        ].map(item => (
          <button key={item.view} onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold cursor-pointer transition-colors"
            style={{ color: state.currentView === item.view ? '#ef4444' : 'var(--text-muted)' }}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
