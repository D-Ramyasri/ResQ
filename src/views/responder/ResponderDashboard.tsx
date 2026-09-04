import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ResponderLayout from './ResponderLayout';
import IncidentDetail from './IncidentDetail';
import LiveMap from '../../components/LiveMap';
import {
  KPICard, PriorityBadge, StatusBadge, ResourceStatusBadge,
  SectionLabel, CATEGORY_META, DOMAIN_META, RESOURCE_STATUS_META,
  getDomainMeta, getCategoryMeta,
} from '../../components/Shared';
import type { Incident, Resource, Domain } from '../../types';

const ROLE_DOMAIN: Record<string, Domain> = {
  fire: 'fire', medical: 'medical', police: 'police', accident: 'accident', disaster: 'disaster',
};

const ROLE_RESOURCE_TYPES: Record<string, string[]> = {
  fire: ['fire_truck'],
  medical: ['ambulance'],
  police: ['police'],
  accident: ['police', 'rescue', 'ambulance', 'fire_truck'],
  disaster: ['rescue'],
};

const ROLE_EMOJI: Record<string, string> = {
  fire: '🔥', medical: '🚑', police: '👮', accident: '🚗', disaster: '🌪️',
};

const ROLE_COLOR: Record<string, string> = {
  fire: '#f97316', medical: '#ef4444', police: '#3b82f6', accident: '#f59e0b', disaster: '#8b5cf6',
};

/* ─── Incident Card ─── */
function IncidentCard({ incident, onClick, highlight = false }: {
  incident: Incident; resources: Resource[]; onClick: () => void; highlight?: boolean;
}) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cat = getCategoryMeta(incident.category);
  const borderColor = highlight ? '#ef4444' : incident.priority === 'P1' ? '#ef444466' : 'var(--border-subtle)';

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all hover:scale-[1.005] cursor-pointer shadow-sm"
      style={{
        background: highlight
          ? (isDark ? '#180a0a' : '#fef2f2')
          : 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        boxShadow: 'var(--shadow-elevation)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}44` }}>
            {cat.emoji}
          </div>
          <div>
            <div className="font-display text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {incident.incidentNumber}
            </div>
            <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {cat.label} · {incident.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* Location */}
      <div className="text-xs mb-2 flex items-center gap-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
        <span>📍</span>
        <span className="truncate">{incident.location.label}</span>
      </div>

      {/* Description snippet */}
      {incident.reports[0]?.description && (
        <div className="text-xs mb-2 line-clamp-1 italic" style={{ color: 'var(--text-muted)' }}>
          "{incident.reports[0].description}"
        </div>
      )}

      {/* Domains + status */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-1 flex-wrap">
          {incident.affectedDomains.map(d => {
            const dm = getDomainMeta(d);
            return (
              <span key={d} className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold"
                style={{ background: `${dm.color}22`, color: dm.color, border: `1px solid ${dm.color}44` }}>
                {dm.emoji} {d}
              </span>
            );
          })}
        </div>
        {highlight && (
          <span className="font-mono text-xs font-bold animate-blink" style={{ color: '#eab308' }}>⚠ NEEDS APPROVAL</span>
        )}
        {incident.status === 'en_route' && incident.etaMinutes !== undefined && (
          <span className="font-mono text-xs font-bold" style={{ color: '#3b82f6' }}>ETA {incident.etaMinutes}m</span>
        )}
        {incident.status === 'arrived' && (
          <span className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>🟣 ON SCENE</span>
        )}
        {incident.status === 'resolved' && (
          <span className="font-mono text-xs font-bold" style={{ color: '#22c55e' }}>✅ RESOLVED</span>
        )}
        {incident.reports.length > 1 && (
          <span className="font-mono text-xs font-semibold" style={{ color: '#a855f7' }}>🔗 {incident.reports.length} reports fused</span>
        )}
      </div>
    </button>
  );
}

/* ─── Resource Row ─── */
function ResourceRow({ resource, compact = false }: { resource: Resource; compact?: boolean }) {
  const typeEmoji: Record<string, string> = { ambulance: '🚑', fire_truck: '🚒', police: '🚓', rescue: '🛟' };
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors shadow-sm"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{typeEmoji[resource.type] ?? '🚒'}</span>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{resource.name}</div>
          {!compact && (
            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{resource.location.label}</div>
          )}
          {!compact && resource.capability && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{resource.capability.join(' · ')}</div>
          )}
        </div>
      </div>
      <div className="text-right">
        <ResourceStatusBadge status={resource.status} />
        {resource.eta != null && resource.status === 'en_route' && (
          <div className="font-mono text-xs mt-0.5 font-bold" style={{ color: '#3b82f6' }}>ETA {resource.eta}m</div>
        )}
      </div>
    </div>
  );
}

/* ─── Notification Panel ─── */
function NotificationPanel() {
  const { getMyNotifications, dispatch } = useApp();
  const notifs = getMyNotifications();
  const unread = notifs.filter(n => !n.read);

  return (
    <div className="space-y-2">
      {unread.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-bold" style={{ color: '#ef4444' }}>{unread.length} unread</span>
          <button className="font-mono text-xs cursor-pointer hover:underline" style={{ color: 'var(--text-muted)' }}
            onClick={() => unread.forEach(n => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }))}>
            Mark all read
          </button>
        </div>
      )}
      {notifs.length === 0 && <div className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No notifications</div>}
      {notifs.map(n => (
        <div key={n.id} onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
          className="rounded-xl p-3 cursor-pointer transition-all shadow-sm"
          style={{
            background: n.read ? 'var(--bg-surface)' : 'var(--bg-card)',
            border: `1px solid ${n.read ? 'var(--border-subtle)' : n.priority === 'P1' ? '#ef444444' : 'var(--border-default)'}`,
            opacity: n.read ? 0.65 : 1,
            boxShadow: 'var(--shadow-elevation)',
          }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
            <PriorityBadge priority={n.priority} />
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
          <div className="font-mono text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
            {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!n.read && <span className="ml-2 live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Approval Alert Banner ─── */
function ApprovalBanner({ incident, onApprove, onView }: { incident: Incident; onApprove: () => void; onView: () => void }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="rounded-2xl p-5 animate-slide-up shadow-md"
      style={{
        background: isDark ? '#180808' : '#fef2f2',
        border: '2px solid #ef4444',
        boxShadow: isDark ? '0 0 24px #ef444433' : '0 4px 20px rgba(239, 68, 68, 0.12)',
      }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="live-dot w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
        <span className="font-display text-lg font-bold" style={{ color: '#ef4444' }}>
          🚨 {incident.incidentNumber} — AWAITING YOUR APPROVAL
        </span>
        <PriorityBadge priority={incident.priority} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono text-xs">
        <div style={{ color: 'var(--text-secondary)' }}>
          <div style={{ color: 'var(--text-muted)' }}>CATEGORY</div>
          {getCategoryMeta(incident.category).emoji} {incident.category.toUpperCase()}
        </div>
        <div style={{ color: incident.aiAnalysis?.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
          <div style={{ color: 'var(--text-muted)' }}>SEVERITY</div>
          {incident.aiAnalysis?.severity ?? '–'}
        </div>
        <div style={{ color: '#f97316' }}>
          <div style={{ color: 'var(--text-muted)' }}>PEOPLE AT RISK</div>
          {incident.aiAnalysis?.peopleAtRisk ?? '–'}
        </div>
        <div style={{ color: '#3b82f6' }}>
          <div style={{ color: 'var(--text-muted)' }}>AI CONFIDENCE</div>
          {incident.aiAnalysis?.confidence ?? '–'}%
        </div>
      </div>

      <div className="text-xs mb-4 rounded-xl px-3 py-2 transition-colors"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        📍 {incident.location.label}
        {incident.reports[0]?.description && <span className="ml-2 italic">— "{incident.reports[0].description.slice(0, 80)}..."</span>}
      </div>

      <div className="flex gap-3">
        <button onClick={onApprove}
          className="flex-1 py-3 rounded-xl font-display text-base font-bold transition-all cursor-pointer shadow active:scale-98"
          style={{ background: '#22c55e', color: 'white' }}>
          ✓ APPROVE RECOMMENDED RESOURCES
        </button>
        <button onClick={onView}
          className="px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
          FULL DETAIL
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ResponderDashboard() {
  const { state, dispatch, getMyIncidents, approveIncident } = useApp();
  const { currentUser, resources, hospitals } = state;
  const role = currentUser?.role ?? 'police';
  const domain = ROLE_DOMAIN[role];
  const roleColor = ROLE_COLOR[role] ?? '#94a3b8';
  const roleEmoji = ROLE_EMOJI[role] ?? '🚨';
  const myResourceTypes = ROLE_RESOURCE_TYPES[role] ?? [];
  const myResources = resources.filter(r => myResourceTypes.includes(r.type));
  const myIncidents = getMyIncidents();
  const activeIncidents = myIncidents.filter(i => i.status !== 'resolved');
  const awaitingApproval = activeIncidents.filter(i => i.status === 'awaiting_approval');
  const [searchQuery, setSearchQuery] = useState('');

  const openIncident = (id: string) => {
    dispatch({ type: 'SELECT_INCIDENT', payload: id });
    dispatch({ type: 'SET_VIEW', payload: 'responder_incident' });
  };

  const filteredIncidents = (list: Incident[]) =>
    searchQuery
      ? list.filter(i =>
          i.incidentNumber.includes(searchQuery.toUpperCase()) ||
          i.location.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.includes(searchQuery.toLowerCase())
        )
      : list;

  return (
    <ResponderLayout>
      {(activeNav, setActiveNav) => {
        // Incident detail view
        if (state.currentView === 'responder_incident' && state.selectedIncidentId) {
          const inc = state.incidents.find(i => i.id === state.selectedIncidentId);
          if (inc) return (
            <div className="h-full overflow-auto">
              <div className="flex items-center gap-3 px-6 py-4 sticky top-0 z-10 backdrop-blur-md transition-colors duration-200"
                style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'responder_dashboard' })}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  ← Back
                </button>
                <div className="flex-1">
                  <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {getCategoryMeta(inc.category).emoji} {inc.incidentNumber} — Operational Report
                  </div>
                </div>
                <PriorityBadge priority={inc.priority} />
              </div>
              <IncidentDetail incident={inc} />
            </div>
          );
        }

        const kpiData = {
          active: activeIncidents.length,
          critical: activeIncidents.filter(i => i.priority === 'P1').length,
          available: myResources.filter(r => r.status === 'available').length,
          enRoute: myResources.filter(r => r.status === 'en_route').length,
          onScene: myResources.filter(r => r.status === 'arrived').length,
          resolved: myIncidents.filter(i => i.status === 'resolved').length,
        };

        return (
          <div className="h-full overflow-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 backdrop-blur-md transition-colors duration-200"
              style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm"
                  style={{ background: `${roleColor}22`, border: `1px solid ${roleColor}44` }}>
                  {roleEmoji}
                </div>
                <div>
                  <div className="font-display text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {activeNav === 'dashboard' ? 'Dashboard' :
                     activeNav === 'incidents' ? 'Incidents' :
                     activeNav === 'map' ? 'Live Map' :
                     activeNav === 'resources' ? (role === 'medical' ? 'Ambulances' : role === 'police' ? 'Police Units' : role === 'fire' ? 'Fire Units' : 'Resources') :
                     activeNav === 'hospitals' ? 'Hospitals' :
                     activeNav === 'traffic' ? 'Traffic & Roads' :
                     activeNav === 'notifications' ? 'Notifications' :
                     activeNav === 'assignments' ? 'Assignments' :
                     activeNav === 'alerts' ? 'Alerts' :
                     'Analytics'}
                  </div>
                  <div className="font-mono text-xs font-semibold" style={{ color: roleColor }}>
                    {currentUser?.name} · {role.toUpperCase()} MANAGER
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {awaitingApproval.length > 0 && (
                  <div className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg animate-blink"
                    style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }}>
                    {awaitingApproval.length} PENDING APPROVAL
                  </div>
                )}
                <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  LIVE
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              {/* ── DASHBOARD ── */}
              {activeNav === 'dashboard' && (
                <>
                  {/* Approval banners */}
                  {awaitingApproval.length > 0 && (
                    <div className="space-y-3">
                      {awaitingApproval.map(inc => (
                        <ApprovalBanner key={inc.id} incident={inc}
                          onApprove={() => approveIncident(inc.id)}
                          onView={() => openIncident(inc.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KPICard label="Active" value={kpiData.active} color={kpiData.active > 0 ? '#ef4444' : '#22c55e'} icon={roleEmoji} />
                    <KPICard label="P1 Critical" value={kpiData.critical} color={kpiData.critical > 0 ? '#ef4444' : 'var(--text-muted)'} icon="🔴" />
                    <KPICard label="Available" value={kpiData.available} color="#22c55e" icon="🟢" />
                    <KPICard label="En Route" value={kpiData.enRoute} color="#3b82f6" icon="🔵" />
                    <KPICard label="On Scene" value={kpiData.onScene} color="#a855f7" icon="🟣" />
                    <KPICard label="Resolved" value={kpiData.resolved + 14} color="#22c55e" icon="✅" sub="today" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Incident Feed */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center justify-between mb-3">
                        <SectionLabel>Active Incidents ({activeIncidents.length})</SectionLabel>
                        <button onClick={() => setActiveNav('incidents')} className="text-xs font-semibold cursor-pointer hover:underline"
                          style={{ color: roleColor }}>View all →</button>
                      </div>
                      <div className="space-y-2">
                        {activeIncidents.length === 0 && (
                          <div className="text-center py-10 rounded-2xl transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <div className="text-3xl mb-2">✅</div>
                            <div className="text-sm font-medium">No active incidents</div>
                          </div>
                        )}
                        {activeIncidents.slice(0, 4).map(inc => (
                          <IncidentCard key={inc.id} incident={inc} resources={resources}
                            onClick={() => openIncident(inc.id)}
                            highlight={inc.status === 'awaiting_approval'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resources + Map mini */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <SectionLabel>My Resources ({myResources.length})</SectionLabel>
                        <div className="space-y-2">
                          {myResources.map(r => <ResourceRow key={r.id} resource={r} compact />)}
                        </div>
                      </div>
                      <div>
                        <SectionLabel>Live Map</SectionLabel>
                        <LiveMap incidents={myIncidents} resources={myResources}
                          hospitals={domain === 'medical' ? hospitals : []} height={220} compact />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── INCIDENTS ── */}
              {activeNav === 'incidents' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      placeholder="Search incidents, location..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', caretColor: roleColor }}
                    />
                    <select className="px-3 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                      <option>All Status</option>
                      <option>Awaiting Approval</option>
                      <option>En Route</option>
                      <option>Arrived</option>
                      <option>Resolved</option>
                    </select>
                  </div>

                  {/* Tabs: Active / Resolved */}
                  {['active', 'resolved'].map(tab => {
                    const list = tab === 'active'
                      ? filteredIncidents(activeIncidents)
                      : filteredIncidents(myIncidents.filter(i => i.status === 'resolved'));
                    return (
                      <div key={tab} className="mb-6">
                        <SectionLabel>
                          {tab === 'active' ? `Active (${list.length})` : `Resolved Today (${list.length})`}
                        </SectionLabel>
                        <div className="space-y-2">
                          {list.map(inc => (
                            <IncidentCard key={inc.id} incident={inc} resources={resources}
                              onClick={() => openIncident(inc.id)}
                              highlight={inc.status === 'awaiting_approval'}
                            />
                          ))}
                          {list.length === 0 && (
                            <div className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No incidents</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── MAP ── */}
              {activeNav === 'map' && (
                <>
                  <SectionLabel>Live Operational Map — {domain?.toUpperCase()} Domain</SectionLabel>
                  <LiveMap
                    incidents={myIncidents}
                    resources={myResources}
                    hospitals={domain === 'medical' ? hospitals : []}
                    height={580}
                  />
                </>
              )}

              {/* ── RESOURCES ── */}
              {activeNav === 'resources' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <KPICard label="Available" value={myResources.filter(r => r.status === 'available').length} color="#22c55e" />
                    <KPICard label="En Route" value={myResources.filter(r => r.status === 'en_route').length} color="#3b82f6" />
                    <KPICard label="On Scene" value={myResources.filter(r => r.status === 'arrived').length} color="#a855f7" />
                    <KPICard label="Busy / Offline" value={myResources.filter(r => r.status === 'busy' || r.status === 'offline').length} color="#ef4444" />
                  </div>
                  <SectionLabel>All Units ({myResources.length})</SectionLabel>
                  <div className="space-y-2">
                    {myResources.map(r => <ResourceRow key={r.id} resource={r} />)}
                  </div>

                  {/* Resource status legend */}
                  <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <SectionLabel>Status Key</SectionLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(RESOURCE_STATUS_META).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 font-mono text-xs font-semibold">
                          <span>{v.emoji}</span>
                          <span style={{ color: v.color }}>{v.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── HOSPITALS (Medical only) ── */}
              {activeNav === 'hospitals' && domain === 'medical' && (
                <>
                  <SectionLabel>Nearby Hospitals</SectionLabel>
                  <div className="space-y-3">
                    {hospitals.map(h => (
                      <div key={h.id} className="rounded-2xl p-5 transition-colors shadow-sm"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                              🏥 {h.name}
                            </div>
                            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                              {h.location.label}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: h.capacity === 'HIGH' ? '#14532d' : h.capacity === 'MEDIUM' ? '#713f12' : '#7f1d1d',
                              color: h.capacity === 'HIGH' ? '#22c55e' : h.capacity === 'MEDIUM' ? '#eab308' : '#ef4444',
                              border: `1px solid ${h.capacity === 'HIGH' ? '#22c55e' : h.capacity === 'MEDIUM' ? '#eab308' : '#ef4444'}44`,
                            }}>
                            {h.capacity} CAPACITY
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 font-mono text-sm mb-3">
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-dim)' }}>DISTANCE</div><div style={{ color: 'var(--text-primary)' }}>{h.distance} km</div></div>
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-dim)' }}>ETA</div><div style={{ color: '#3b82f6' }}>{h.eta} min</div></div>
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-dim)' }}>INCOMING</div><div style={{ color: '#f59e0b' }}>{h.incomingPatients} pts</div></div>
                        </div>
                        <button className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                          SELECT AS DESTINATION
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── TRAFFIC (Accident only) ── */}
              {activeNav === 'traffic' && (
                <>
                  <SectionLabel>Traffic & Road Status</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>BLOCKED ROADS</div>
                      <div className="font-display text-3xl font-bold" style={{ color: '#ef4444' }}>2</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Riverside Dr, Commerce Bridge</div>
                    </div>
                    <div className="rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>CONGESTION ZONES</div>
                      <div className="font-display text-3xl font-bold" style={{ color: '#f97316' }}>5</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Downtown, Midtown, Riverside</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { road: 'Riverside Drive & 3rd Ave', status: 'BLOCKED', reason: 'Multi-vehicle accident — INC-1042', color: '#ef4444', icon: '🚧' },
                      { road: 'Commerce Bridge', status: 'CLOSED', reason: 'Emergency vehicles routing', color: '#ef4444', icon: '🚧' },
                      { road: 'Industrial Blvd', status: 'SLOW', reason: 'Fire incident — INC-1039, single lane', color: '#f97316', icon: '⚠️' },
                      { road: 'Maple Ave Corridor', status: 'SLOW', reason: 'Medical vehicle parked', color: '#eab308', icon: '⚠️' },
                      { road: 'Central Park Ave', status: 'NORMAL', reason: '', color: '#22c55e', icon: '✓' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors shadow-sm"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{r.icon}</span>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.road}</div>
                            {r.reason && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.reason}</div>}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold" style={{ color: r.color }}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── ASSIGNMENTS ── */}
              {activeNav === 'assignments' && (
                <>
                  <SectionLabel>Current Assignments</SectionLabel>
                  {myResources.filter(r => r.assignedIncidentId).length === 0 ? (
                    <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <div className="text-3xl mb-2">📋</div>
                      <div>No active assignments</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myResources.filter(r => r.assignedIncidentId).map(r => {
                        const inc = state.incidents.find(i => i.id === r.assignedIncidentId);
                        return (
                          <div key={r.id} className="rounded-2xl p-4 transition-colors shadow-sm"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{r.type === 'ambulance' ? '🚑' : r.type === 'fire_truck' ? '🚒' : r.type === 'police' ? '🚓' : '🛟'}</span>
                                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                              </div>
                              <ResourceStatusBadge status={r.status} />
                            </div>
                            {inc && (
                              <div className="flex items-center justify-between text-xs">
                                <span style={{ color: 'var(--text-secondary)' }}>→ {inc.incidentNumber} ({inc.location.label})</span>
                                {r.eta && <span className="font-bold" style={{ color: '#3b82f6' }}>ETA {r.eta}m</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── ALERTS (Police / Disaster) ── */}
              {activeNav === 'alerts' && (
                <>
                  <SectionLabel>Active Alerts</SectionLabel>
                  <div className="space-y-2">
                    {state.aiAlerts.map(alert => {
                      const colors: Record<string, string> = { escalation: '#ef4444', fusion: '#3b82f6', shortage: '#eab308', dispatch: '#f97316', traffic: '#eab308', resolved: '#22c55e' };
                      const icons: Record<string, string> = { escalation: '🔺', fusion: '🔗', shortage: '⚠️', dispatch: '🚨', traffic: '🚧', resolved: '✅' };
                      const c = colors[alert.type] ?? '#94a3b8';
                      return (
                        <div key={alert.id} className="rounded-2xl p-4 transition-colors shadow-sm"
                          style={{ background: 'var(--bg-card)', border: `1px solid ${c}44`, boxShadow: 'var(--shadow-elevation)' }}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{icons[alert.type] ?? '⚠'}</span>
                            <div className="flex-1">
                              <div className="text-sm font-semibold" style={{ color: c }}>{alert.message}</div>
                              <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                                {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {state.aiAlerts.length === 0 && (
                      <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No alerts</div>
                    )}
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeNav === 'notifications' && (
                <>
                  <SectionLabel>Notifications</SectionLabel>
                  <NotificationPanel />
                </>
              )}

              {/* ── ANALYTICS ── */}
              {activeNav === 'analytics' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <KPICard label="Avg Response Time" value="5m 42s" color="#f59e0b" icon="⏱" />
                    <KPICard label="Resolved Today" value={kpiData.resolved + 14} color="#22c55e" icon="✅" />
                    <KPICard label="Reports Fused" value="7" color="#a855f7" icon="🔗" />
                    <KPICard label="Efficiency" value="94%" color="#22c55e" icon="📊" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Response time chart */}
                    <div className="rounded-2xl p-5 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <SectionLabel>Response Time Breakdown</SectionLabel>
                      {[
                        { label: 'Report → AI Analysis', value: '14s', pct: 8 },
                        { label: 'AI → Manager Notif', value: '5s', pct: 3 },
                        { label: 'Manager Approval', value: '48s', pct: 28 },
                        { label: 'Dispatch → En Route', value: '1m 6s', pct: 38 },
                        { label: 'Arrival', value: '5m 14s', pct: 100 },
                      ].map(r => (
                        <div key={r.label} className="mb-3">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{r.value}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: roleColor }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Incidents by priority */}
                    <div className="rounded-2xl p-5 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                      <SectionLabel>Incidents by Priority</SectionLabel>
                      {[
                        { label: 'P1 Critical', value: 3, color: '#ef4444' },
                        { label: 'P2 High', value: 6, color: '#f97316' },
                        { label: 'P3 Moderate', value: 8, color: '#eab308' },
                        { label: 'P4 Low', value: 5, color: '#22c55e' },
                      ].map(p => (
                        <div key={p.label} className="mb-3">
                          <div className="flex justify-between text-xs mb-1 font-medium">
                            <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{p.value} incidents</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(p.value / 8) * 100}%`, background: p.color }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent resolved */}
                    {myIncidents.filter(i => i.status === 'resolved').length > 0 && (
                      <div className="lg:col-span-2">
                        <SectionLabel>Resolved Incidents</SectionLabel>
                        <div className="space-y-2">
                          {myIncidents.filter(i => i.status === 'resolved').map(inc => (
                            <IncidentCard key={inc.id} incident={inc} resources={resources}
                              onClick={() => openIncident(inc.id)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }}
    </ResponderLayout>
  );
}
