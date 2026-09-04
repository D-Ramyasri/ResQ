import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  PriorityBadge, StatusBadge, ResourceStatusBadge, AIConfidenceMeter,
  DomainRow, IncidentTimeline, CATEGORY_META, DOMAIN_META, SectionLabel,
  getCategoryMeta, getDomainMeta,
} from '../../components/Shared';
import type { Incident, Resource } from '../../types';

interface Props {
  incident: Incident;
}

export default function IncidentDetail({ incident }: Props) {
  const { state, approveIncident, theme } = useApp();
  const isDark = theme === 'dark';
  const { resources } = state;

  const assignedResources = resources.filter(r => incident.assignedResourceIds.includes(r.id));
  const recommendedResources = incident.aiAnalysis?.recommendedResourceIds
    .map(id => resources.find(r => r.id === id))
    .filter(Boolean) as Resource[];

  const catMeta = getCategoryMeta(incident.category);
  const canApprove = incident.status === 'awaiting_approval';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Incident Header */}
      <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
              style={{ background: `${catMeta.color}22`, border: `1px solid ${catMeta.color}` }}>
              {catMeta.emoji}
            </div>
            <div>
              <div className="font-display text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {incident.incidentNumber}
              </div>
              <div className="font-mono text-sm font-semibold" style={{ color: catMeta.color }}>
                {catMeta.label.toUpperCase()} INCIDENT
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div>
            <div style={{ color: 'var(--text-muted)' }}>LOCATION</div>
            <div style={{ color: 'var(--text-secondary)' }}>📍 {incident.location.label}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>REPORTED</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {incident.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {incident.createdAt.toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>SEVERITY</div>
            <div style={{ color: incident.severity === 'CRITICAL' ? '#ef4444' : incident.severity === 'HIGH' ? '#f97316' : '#eab308' }}>
              {incident.severity}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>REPORTS FUSED</div>
            <div style={{ color: '#3b82f6' }}>{incident.reports.length} citizen report{incident.reports.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Multi-Domain Coordination */}
      <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
        <SectionLabel>Required Response Domains</SectionLabel>
        <DomainRow active={incident.affectedDomains} />
        <div className="mt-3 space-y-1">
          {incident.affectedDomains.map(d => {
            const dm = getDomainMeta(d);
            const domainResources = assignedResources.filter(r => {
              const typeMap: Record<string, string[]> = {
                fire: ['fire_truck'], medical: ['ambulance'],
                police: ['police'], accident: ['police', 'rescue'], disaster: ['rescue'],
              };
              return (typeMap[d] ?? []).includes(r.type);
            });
            return (
              <div key={d} className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                style={{ background: `${dm.color}15`, border: `1px solid ${dm.color}33` }}>
                <span className="text-sm font-semibold" style={{ color: dm.color }}>
                  {dm.emoji} {dm.label}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {domainResources.length > 0
                    ? `${domainResources.length} unit assigned`
                    : incident.status === 'awaiting_approval'
                      ? 'Awaiting assignment'
                      : 'No unit assigned'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Original Citizen Reports */}
      <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
        <SectionLabel>
          {incident.reports.length > 1
            ? `${incident.reports.length} Citizen Reports — Fused into Single Incident`
            : 'Original Citizen Report'}
        </SectionLabel>

        {incident.reports.length > 1 && (
          <div className="mb-3 px-3 py-2 rounded-xl font-mono text-xs"
            style={{ background: isDark ? '#1a2236' : '#eff6ff', border: '1px solid #3b82f6', color: '#3b82f6' }}>
            📊 {incident.reports.length} independent reports matched by location, category, and time proximity → unified as {incident.incidentNumber}
          </div>
        )}

        <div className="space-y-3">
          {incident.reports.map((rep, i) => (
            <div key={rep.id} className="rounded-xl p-4 transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  Report #{i + 1} · {rep.citizenName} · {rep.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex gap-2">
                  {rep.hasImage && <span className="font-mono text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: isDark ? '#1a2236' : '#dbeafe', color: '#2563eb', border: '1px solid #3b82f688' }}>📷 Image</span>}
                  {rep.hasVoice && <span className="font-mono text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: isDark ? '#1a2236' : '#f3e8ff', color: '#9333ea', border: '1px solid #a855f788' }}>🎙 {rep.voiceDuration}s</span>}
                </div>
              </div>
              {rep.description && (
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>"{rep.description}"</p>
              )}
              {rep.imageUrl && (
                <img
                  src={rep.imageUrl}
                  alt="Emergency evidence"
                  className="w-full rounded-xl object-cover shadow-sm"
                  style={{ height: 140 }}
                />
              )}
              {rep.hasVoice && !rep.imageUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5 flex-1 h-6">
                    {Array.from({ length: 40 }, (_, j) => (
                      <div key={j} className="flex-1 rounded-full"
                        style={{ background: '#a855f7', height: `${20 + Math.sin(j * 1.1) * 50}%`, opacity: 0.7 }} />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#a855f7' }}>{rep.voiceDuration}s</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Context Analysis */}
      {incident.aiAnalysis && (
        <div className="rounded-2xl p-5 transition-colors shadow-sm"
          style={{
            background: isDark ? '#0f1f35' : '#eff6ff',
            border: isDark ? '1px solid #1e3a5f' : '1px solid #bfdbfe',
            boxShadow: 'var(--shadow-elevation)',
          }}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div className="font-display text-lg font-bold" style={{ color: '#2563eb' }}>AI Context Analysis</div>
            </div>
            {incident.aiAnalysis.source === 'featherless_live' ? (
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
                style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                <span>FEATHERLESS.AI LIVE ({incident.aiAnalysis.modelUsed?.split('/').pop() || 'Llama-3.1'})</span>
              </span>
            ) : (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded font-medium"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                Deterministic Engine Fallback
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-3 transition-colors" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>SEVERITY</div>
              <div className="font-display text-xl font-bold" style={{
                color: incident.aiAnalysis.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
              }}>
                {incident.aiAnalysis.severity}
              </div>
            </div>
            <div className="rounded-xl p-3 transition-colors" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>PRIORITY</div>
              <PriorityBadge priority={incident.aiAnalysis.priority} />
            </div>
            <div className="rounded-xl p-3 transition-colors" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>PEOPLE AT RISK</div>
              <div className="font-display text-xl font-bold" style={{ color: '#f97316' }}>
                {incident.aiAnalysis.peopleAtRisk} person{incident.aiAnalysis.peopleAtRisk !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="rounded-xl p-3 transition-colors" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>URGENCY</div>
              <div className="text-sm font-bold" style={{ color: '#eab308' }}>
                {incident.aiAnalysis.urgency}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {incident.aiAnalysis.summary && (
              <div>
                <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>OPERATIONAL SUMMARY</div>
                <div className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {incident.aiAnalysis.summary}
                </div>
              </div>
            )}
            <div>
              <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>INJURIES INDICATOR</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{incident.aiAnalysis.injuries}</div>
            </div>
            <div>
              <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>IDENTIFIED HAZARDS</div>
              <div className="flex flex-wrap gap-1.5">
                {incident.aiAnalysis.hazards.map(h => (
                  <span key={h} className="font-mono text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ background: isDark ? '#ef444422' : '#fee2e2', color: isDark ? '#fca5a5' : '#b91c1c', border: '1px solid #ef444444' }}>
                    ⚠ {h}
                  </span>
                ))}
              </div>
            </div>
            {incident.aiAnalysis.responderGuidance && (
              <div>
                <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>RESPONDER PRE-ARRIVAL GUIDANCE</div>
                <div className="space-y-2 mt-1">
                  {Object.entries(incident.aiAnalysis.responderGuidance).map(([domainKey, guidanceList]) => (
                    <div key={domainKey} className="rounded-xl p-3" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
                      <div className="font-mono text-xs font-bold uppercase mb-1.5 flex items-center gap-1.5" style={{ color: '#3b82f6' }}>
                        <span>🛡️</span>
                        <span>{domainKey} UNIT BRIEFING</span>
                      </div>
                      <div className="space-y-1">
                        {guidanceList.map((g, gi) => (
                          <div key={gi} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-bold text-blue-500">•</span>
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>REQUIRED RESOURCES</div>
              <div className="flex flex-wrap gap-1.5">
                {incident.aiAnalysis.requiredResources.map(r => (
                  <span key={r} className="font-mono text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-xs mb-1 font-semibold" style={{ color: 'var(--text-dim)' }}>AI CONFIDENCE</div>
              <AIConfidenceMeter value={incident.aiAnalysis.confidence} />
            </div>
          </div>
        </div>
      )}

      {/* AI Resource Recommendations */}
      {incident.aiAnalysis && recommendedResources.length > 0 && (
        <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
          <SectionLabel>AI Resource Recommendation</SectionLabel>

          {canApprove && (
            <div className="mb-3 px-3 py-2 rounded-xl font-mono text-xs"
              style={{ background: isDark ? '#22c55e22' : '#dcfce7', border: '1px solid #22c55e44', color: isDark ? '#22c55e' : '#15803d' }}>
              🤖 AI recommendation ready for manager review. Human approval required before dispatch.
            </div>
          )}

          <div className="space-y-2 mb-4">
            {recommendedResources.map((res, i) => (
              <div
                key={res.id}
                className="rounded-xl p-4 transition-colors"
                style={{
                  background: i === 0 ? (isDark ? '#0a1f0a' : '#f0fdf4') : 'var(--bg-surface)',
                  border: `1px solid ${i === 0 ? '#22c55e' : 'var(--border-subtle)'}`,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {res.type === 'ambulance' ? '🚑' : res.type === 'fire_truck' ? '🚒' : res.type === 'police' ? '🚓' : '🛟'}
                    </span>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {res.name}
                        {i === 0 && <span className="ml-2 font-mono text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                          ✓ TOP MATCH
                        </span>}
                      </div>
                      <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{res.location.label}</div>
                    </div>
                  </div>
                  <ResourceStatusBadge status={res.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs mb-2">
                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>DISTANCE</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{res.distance ?? '–'} km</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>ETA</div>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{res.eta ?? '–'} min</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-dim)' }}>MATCH SCORE</div>
                    <div style={{ color: res.matchScore && res.matchScore >= 90 ? '#22c55e' : '#f59e0b', fontWeight: 'bold' }}>
                      {res.matchScore ?? '–'}%
                    </div>
                  </div>
                </div>

                {i === 0 && (
                  <div className="rounded-lg p-2.5 transition-colors" style={{ background: isDark ? '#0a1628' : '#ffffff', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-mono text-xs mb-1 font-bold" style={{ color: 'var(--text-dim)' }}>RECOMMENDED BECAUSE:</div>
                    <div className="space-y-0.5 font-mono text-xs font-medium" style={{ color: '#16a34a' }}>
                      {['✓ Available', '✓ Closest suitable resource', '✓ Fastest estimated arrival', '✓ Appropriate capability', '✓ Current workload allows deployment'].map(r => (
                        <div key={r}>{r}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Approval controls */}
          {canApprove ? (
            <div className="space-y-2">
              <div className="font-mono text-xs text-center mb-2" style={{ color: 'var(--text-dim)' }}>
                AI RECOMMENDATION → MANAGER REVIEW → APPROVE → DISPATCH
              </div>
              <button
                onClick={() => approveIncident(incident.id)}
                className="w-full py-3.5 rounded-xl font-display text-lg font-bold transition-all cursor-pointer shadow active:scale-98"
                style={{ background: '#22c55e', color: 'white' }}
              >
                ✓ APPROVE & DISPATCH RECOMMENDED RESOURCES
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  MODIFY SELECTION
                </button>
                <button className="py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  style={{ background: isDark ? '#1a0505' : '#fee2e2', color: '#ef4444', border: '1px solid #ef444444' }}>
                  REJECT / ESCALATE
                </button>
              </div>
            </div>
          ) : (
            incident.approvedBy && (
              <div className="rounded-xl px-4 py-3 transition-colors" style={{ background: isDark ? '#0a1f0a' : '#f0fdf4', border: '1px solid #22c55e44' }}>
                <div className="font-mono text-xs font-bold" style={{ color: '#16a34a' }}>
                  ✓ APPROVED BY {incident.approvedBy?.toUpperCase()} at {incident.approvedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '–'}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Assigned Resources */}
      {assignedResources.length > 0 && (
        <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
          <SectionLabel>Assigned Resources</SectionLabel>
          <div className="space-y-2">
            {assignedResources.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
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
        </div>
      )}

      {/* Incident Timeline */}
      <div className="rounded-2xl p-5 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
        <SectionLabel>Incident Timeline</SectionLabel>
        <IncidentTimeline events={incident.timeline} />
      </div>
    </div>
  );
}
