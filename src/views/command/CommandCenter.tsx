import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import LiveMap from '../../components/LiveMap';
import {
  KPICard, PriorityBadge, StatusBadge, ResourceStatusBadge, SectionLabel,
  CATEGORY_META, DOMAIN_META,
} from '../../components/Shared';
import type { Incident } from '../../types';
import IncidentDetail from '../responder/IncidentDetail';
import ThemeToggle from '../../components/ThemeToggle';

const AI_ALERT_ICONS: Record<string, string> = {
  escalation: '🔺', fusion: '🔗', shortage: '⚠️', dispatch: '🚨', traffic: '🚧', resolved: '✅',
};

const AI_ALERT_COLORS: Record<string, string> = {
  escalation: '#ef4444', fusion: '#3b82f6', shortage: '#eab308',
  dispatch: '#f97316', traffic: '#eab308', resolved: '#22c55e',
};

const NAV_ITEMS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'map', icon: '🗺', label: 'Live Map' },
  { key: 'incidents', icon: '🚨', label: 'All Incidents' },
  { key: 'critical', icon: '🔴', label: 'Critical' },
  { key: 'resources', icon: '🚒', label: 'Resources' },
  { key: 'ai_alerts', icon: '🤖', label: 'AI Alerts' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
];

function IncidentRow({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  const catMeta = CATEGORY_META[incident.category];
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="text-xl flex-shrink-0">{catMeta.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{incident.incidentNumber}</span>
          <PriorityBadge priority={incident.priority} />
        </div>
        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {incident.location.label}
        </div>
        <div className="flex gap-1 mt-1">
          {incident.affectedDomains.map(d => (
            <span key={d} className="font-mono text-xs" style={{ color: DOMAIN_META[d].color }}>
              {DOMAIN_META[d].emoji}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <StatusBadge status={incident.status} />
        {incident.etaMinutes !== undefined && incident.status === 'en_route' && (
          <div className="font-mono text-xs mt-0.5 font-bold" style={{ color: '#3b82f6' }}>ETA {incident.etaMinutes}m</div>
        )}
      </div>
    </button>
  );
}

export default function CommandCenter() {
  const { state, dispatch, theme } = useApp();
  const isDark = theme === 'dark';
  const { incidents, resources, aiAlerts, currentUser } = state;
  const [activeNav, setActiveNav] = useState('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalIncidents = activeIncidents.filter(i => i.priority === 'P1');
  const resolvedToday = incidents.filter(i => i.status === 'resolved').length + 42;
  const activeResponders = resources.filter(r => r.status !== 'offline' && r.status !== 'available').length + 28;
  const availableResources = resources.filter(r => r.status === 'available').length;

  const selectedIncident = selectedIncidentId ? incidents.find(i => i.id === selectedIncidentId) : null;

  return (
    <div className="h-full flex transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div className="flex flex-col flex-shrink-0 transition-all duration-200"
        style={{ width: sidebarOpen ? 220 : 60, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm"
            style={{ background: '#10b981', color: 'white' }}>R</div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-display text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>ResQ</div>
              <div className="font-mono text-xs font-semibold" style={{ color: '#10b981' }}>Command Center</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs flex-shrink-0 cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-3 transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: 14 }}>🧑‍💼</div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</div>
              <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>COMMAND CENTER</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveNav(item.key); setSelectedIncidentId(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative cursor-pointer select-none"
              style={{
                background: activeNav === item.key ? '#10b98118' : 'transparent',
                color: activeNav === item.key ? '#10b981' : 'var(--text-secondary)',
                borderRight: activeNav === item.key ? '3px solid #10b981' : '3px solid transparent',
                fontWeight: activeNav === item.key ? '600' : '500',
              }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {item.key === 'critical' && criticalIncidents.length > 0 && (
                <span className="absolute right-3 top-2 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#ef4444', color: 'white', fontSize: 9 }}>
                  {criticalIncidents.length}
                </span>
              )}
              {item.key === 'ai_alerts' && aiAlerts.length > 0 && (
                <span className="absolute right-3 top-2 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#3b82f6', color: 'white', fontSize: 9 }}>
                  {Math.min(aiAlerts.length, 9)}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Theme Toggle and Switch Role */}
        <div className="p-3 space-y-2 transition-colors" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {sidebarOpen ? (
            <ThemeToggle size="sm" showLabel className="w-full" />
          ) : (
            <div className="flex justify-center">
              <ThemeToggle size="sm" />
            </div>
          )}
          <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            <span>⇐</span>
            {sidebarOpen && <span>Switch Role</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-auto">
        {selectedIncident ? (
          <div className="h-full overflow-auto">
            <div className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10 backdrop-blur-md transition-colors duration-200"
              style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setSelectedIncidentId(null)}
                className="text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                ← Back
              </button>
              <div className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedIncident.incidentNumber} — Full Operational Report
              </div>
            </div>
            <IncidentDetail incident={selectedIncident} />
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 backdrop-blur-md transition-colors duration-200"
              style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧑‍💼</span>
                <div>
                  <div className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {NAV_ITEMS.find(n => n.key === activeNav)?.label ?? 'Command Center'}
                  </div>
                  <div className="font-mono text-xs font-semibold" style={{ color: '#10b981' }}>
                    SYSTEM-WIDE OPERATIONAL OVERVIEW
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {criticalIncidents.length > 0 && (
                  <div className="font-mono text-xs px-3 py-1.5 rounded-lg font-bold animate-blink"
                    style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }}>
                    🔴 {criticalIncidents.length} CRITICAL ACTIVE
                  </div>
                )}
                <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  LIVE
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              {activeNav === 'overview' && (
                <>
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    <KPICard label="Active Incidents" value={activeIncidents.length + 1} color="#ef4444" icon="🚨" />
                    <KPICard label="Critical (P1)" value={criticalIncidents.length + 1} color="#ef4444" icon="🔴" sub="Require immediate response" />
                    <KPICard label="Active Responders" value={activeResponders} color="#3b82f6" icon="👥" />
                    <KPICard label="Available Resources" value={availableResources} color="#22c55e" icon="🟢" />
                    <KPICard label="Avg Response Time" value="5m 42s" color="#f59e0b" icon="⏱" />
                    <KPICard label="Resolved Today" value={resolvedToday} color="#22c55e" icon="✅" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Incident Feed */}
                    <div className="xl:col-span-2">
                      <SectionLabel>Live Incident Feed</SectionLabel>
                      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                        {incidents.filter(i => i.status !== 'resolved').length === 0 && (
                          <div className="p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No active incidents</div>
                        )}
                        {incidents
                          .filter(i => i.status !== 'resolved')
                          .sort((a, b) => {
                            const p: Record<string, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
                            return (p[b.priority] ?? 0) - (p[a.priority] ?? 0);
                          })
                          .map(inc => (
                            <IncidentRow key={inc.id} incident={inc} onClick={() => setSelectedIncidentId(inc.id)} />
                          ))}
                      </div>
                    </div>

                    {/* AI Alerts Panel */}
                    <div>
                      <SectionLabel>AI System Alerts</SectionLabel>
                      <div className="space-y-2">
                        {aiAlerts.slice(0, 8).map(alert => (
                          <div key={alert.id} className="rounded-xl px-3.5 py-3 transition-colors shadow-sm"
                            style={{ background: 'var(--bg-card)', border: `1px solid ${AI_ALERT_COLORS[alert.type]}33` }}>
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">{AI_ALERT_ICONS[alert.type]}</span>
                              <div className="flex-1">
                                <div className="text-xs font-semibold" style={{ color: AI_ALERT_COLORS[alert.type] }}>
                                  {alert.message}
                                </div>
                                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                                  {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {aiAlerts.length === 0 && (
                          <div className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No active alerts</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Live Map */}
                  <div>
                    <SectionLabel>Full Operational Map</SectionLabel>
                    <LiveMap incidents={incidents} resources={resources} hospitals={state.hospitals} height={400} />
                  </div>

                  {/* Multi-Domain Coordination Table */}
                  <div>
                    <SectionLabel>Multi-Domain Coordination</SectionLabel>
                    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
                      <div className="grid grid-cols-6 gap-0 px-4 py-2.5 font-mono text-xs font-semibold"
                        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <div>INCIDENT</div>
                        <div>🔥 FIRE</div>
                        <div>🚑 MEDICAL</div>
                        <div>👮 POLICE</div>
                        <div>🚗 ACCIDENT</div>
                        <div>🌪️ DISASTER</div>
                      </div>
                      {incidents.filter(i => i.status !== 'resolved').map(inc => (
                        <div key={inc.id} className="grid grid-cols-6 gap-0 px-4 py-3 font-mono text-xs items-center transition-colors"
                          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                          <button className="text-left text-sm font-bold cursor-pointer hover:underline"
                            style={{ color: '#3b82f6' }}
                            onClick={() => setSelectedIncidentId(inc.id)}>
                            {inc.incidentNumber}
                          </button>
                          {(['fire', 'medical', 'police', 'accident', 'disaster'] as const).map(d => (
                            <div key={d} style={{
                              color: inc.affectedDomains.includes(d) ? DOMAIN_META[d].color : 'var(--text-dim)',
                              fontWeight: inc.affectedDomains.includes(d) ? 'bold' : 'normal',
                            }}>
                              {inc.affectedDomains.includes(d) ? '✓' : '—'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeNav === 'map' && (
                <>
                  <SectionLabel>System-Wide Operational Map</SectionLabel>
                  <LiveMap incidents={incidents} resources={resources} hospitals={state.hospitals} height={620} />
                </>
              )}

              {activeNav === 'incidents' && (
                <>
                  <SectionLabel>All Incidents ({incidents.length})</SectionLabel>
                  <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
                    {incidents.map(inc => (
                      <IncidentRow key={inc.id} incident={inc} onClick={() => setSelectedIncidentId(inc.id)} />
                    ))}
                  </div>
                </>
              )}

              {activeNav === 'critical' && (
                <>
                  <SectionLabel>Critical Incidents — P1</SectionLabel>
                  {criticalIncidents.length === 0 ? (
                    <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                      <div className="text-4xl mb-3">✅</div>
                      <div className="font-semibold">No critical incidents at this time</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {criticalIncidents.map(inc => (
                        <button key={inc.id} onClick={() => setSelectedIncidentId(inc.id)}
                          className="w-full text-left rounded-2xl p-5 cursor-pointer shadow-md transition-all hover:scale-[1.005]"
                          style={{
                            background: isDark ? '#1a0a0a' : '#fef2f2',
                            border: '1px solid #ef4444',
                          }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{CATEGORY_META[inc.category].emoji}</span>
                              <div>
                                <div className="font-display text-lg font-bold" style={{ color: '#ef4444' }}>
                                  {inc.incidentNumber} — P1 CRITICAL
                                </div>
                                <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.location.label}</div>
                              </div>
                            </div>
                            <StatusBadge status={inc.status} />
                          </div>
                          {inc.aiAnalysis && (
                            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                              <div><div style={{ color: 'var(--text-dim)' }}>SEVERITY</div><div style={{ color: '#ef4444', fontWeight: 'bold' }}>{inc.aiAnalysis.severity}</div></div>
                              <div><div style={{ color: 'var(--text-dim)' }}>PEOPLE AT RISK</div><div style={{ color: '#f97316', fontWeight: 'bold' }}>{inc.aiAnalysis.peopleAtRisk}</div></div>
                              <div><div style={{ color: 'var(--text-dim)' }}>CONFIDENCE</div><div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{inc.aiAnalysis.confidence}%</div></div>
                              <div><div style={{ color: 'var(--text-dim)' }}>DOMAINS</div><div style={{ color: '#a855f7', fontWeight: 'bold' }}>{inc.affectedDomains.length}</div></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeNav === 'resources' && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <KPICard label="Available" value={resources.filter(r => r.status === 'available').length} color="#22c55e" />
                    <KPICard label="En Route" value={resources.filter(r => r.status === 'en_route').length} color="#3b82f6" />
                    <KPICard label="On Scene" value={resources.filter(r => r.status === 'arrived').length} color="#a855f7" />
                    <KPICard label="Busy" value={resources.filter(r => r.status === 'busy').length} color="#ef4444" />
                  </div>
                  <SectionLabel>All Resources ({resources.length})</SectionLabel>
                  <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
                    {resources.map(r => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3 transition-colors"
                        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {r.type === 'ambulance' ? '🚑' : r.type === 'fire_truck' ? '🚒' : r.type === 'police' ? '🚓' : '🛟'}
                          </span>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.location.label}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <ResourceStatusBadge status={r.status} />
                          {r.eta && <div className="font-mono text-xs mt-0.5 font-bold" style={{ color: '#3b82f6' }}>ETA {r.eta}m</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeNav === 'ai_alerts' && (
                <>
                  <SectionLabel>AI System Alerts ({aiAlerts.length})</SectionLabel>
                  <div className="space-y-2">
                    {aiAlerts.map(alert => (
                      <div key={alert.id} className="rounded-2xl p-4 transition-colors shadow-sm"
                        style={{ background: 'var(--bg-card)', border: `1px solid ${AI_ALERT_COLORS[alert.type]}44` }}>
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0">{AI_ALERT_ICONS[alert.type]}</span>
                          <div className="flex-1">
                            <div className="text-sm font-bold mb-0.5" style={{ color: AI_ALERT_COLORS[alert.type] }}>
                              {alert.type.toUpperCase()}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{alert.message}</div>
                            <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                              {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {alert.incidentId && ` · Incident ${alert.incidentId}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {aiAlerts.length === 0 && (
                      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>No AI alerts</div>
                    )}
                  </div>
                </>
              )}

              {activeNav === 'analytics' && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <KPICard label="Total Resolved Today" value={resolvedToday} color="#22c55e" />
                    <KPICard label="Reports Fused" value="11" color="#3b82f6" sub="AI duplicate detection" />
                    <KPICard label="Avg Processing Time" value="1m 14s" color="#f59e0b" sub="Report → Dispatch" />
                    <KPICard label="Efficiency Score" value="94%" color="#22c55e" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl p-5 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <SectionLabel>Incident Volume by Category</SectionLabel>
                      {['fire', 'medical', 'accident', 'crime', 'disaster'].map((cat, i) => {
                        const vals = [8, 14, 11, 7, 2];
                        const catMeta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
                        return (
                          <div key={cat} className="flex items-center gap-3 mb-3">
                            <span className="w-5 text-base">{catMeta.emoji}</span>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1 font-medium">
                                <span style={{ color: 'var(--text-secondary)' }}>{catMeta.label}</span>
                                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{vals[i]}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${vals[i] / 0.42}%`, background: catMeta.color }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-2xl p-5 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <SectionLabel>Response Time Breakdown</SectionLabel>
                      {[
                        { label: 'Report → AI Analysis', value: '14s', width: 12 },
                        { label: 'AI → Manager Notification', value: '5s', width: 4 },
                        { label: 'Manager Approval', value: '48s', width: 40 },
                        { label: 'Dispatch → En Route', value: '1m 6s', width: 55 },
                        { label: 'En Route → Arrival', value: '5m 14s', width: 100 },
                      ].map(r => (
                        <div key={r.label} className="mb-3">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{r.value}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${r.width}%`, background: '#3b82f6' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
