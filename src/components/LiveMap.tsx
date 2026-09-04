import React, { useState } from 'react';
import type { Incident, Resource, Hospital } from '../types';
import { RESOURCE_STATUS_META } from './Shared';
import { useApp } from '../context/AppContext';

interface LiveMapProps {
  incidents: Incident[];
  resources: Resource[];
  hospitals?: Hospital[];
  height?: number;
  compact?: boolean;
  highlightIncidentId?: string;
}

const RESOURCE_EMOJI: Record<string, string> = {
  ambulance: '🚑',
  fire_truck: '🚒',
  police: '🚓',
  rescue: '🛟',
};

const RESOURCE_STATUS_COLOR: Record<string, string> = {
  available: '#22c55e',
  assigned: '#eab308',
  en_route: '#3b82f6',
  arrived: '#a855f7',
  busy: '#ef4444',
  offline: '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  P1: '#ef4444', P2: '#f97316', P3: '#eab308', P4: '#22c55e',
};

// Grid lines for city streets
const GRID_H = [15, 30, 45, 60, 75, 90];
const GRID_V = [12, 25, 38, 52, 65, 78, 90];

// Block fills (simulated city blocks)
const BLOCKS = [
  { x: 12, y: 12, w: 12, h: 16 },
  { x: 26, y: 12, w: 11, h: 16 },
  { x: 40, y: 12, w: 11, h: 16 },
  { x: 53, y: 12, w: 11, h: 16 },
  { x: 66, y: 12, w: 11, h: 16 },
  { x: 79, y: 12, w: 10, h: 16 },
  { x: 12, y: 31, w: 12, h: 13 },
  { x: 26, y: 31, w: 11, h: 13 },
  { x: 40, y: 31, w: 11, h: 13 },
  { x: 53, y: 31, w: 11, h: 13 },
  { x: 66, y: 31, w: 11, h: 13 },
  { x: 79, y: 31, w: 10, h: 13 },
  { x: 12, y: 46, w: 12, h: 13 },
  { x: 26, y: 46, w: 11, h: 13 },
  { x: 40, y: 46, w: 11, h: 13 },
  { x: 53, y: 46, w: 11, h: 13 },
  { x: 66, y: 46, w: 11, h: 13 },
  { x: 79, y: 46, w: 10, h: 13 },
  { x: 12, y: 61, w: 12, h: 13 },
  { x: 26, y: 61, w: 11, h: 13 },
  { x: 40, y: 61, w: 11, h: 13 },
  { x: 53, y: 61, w: 11, h: 13 },
  { x: 66, y: 61, w: 11, h: 13 },
  { x: 79, y: 61, w: 10, h: 13 },
  { x: 12, y: 76, w: 12, h: 13 },
  { x: 26, y: 76, w: 11, h: 13 },
  { x: 40, y: 76, w: 11, h: 13 },
  { x: 53, y: 76, w: 11, h: 13 },
  { x: 66, y: 76, w: 11, h: 13 },
  { x: 79, y: 76, w: 10, h: 13 },
];

export default function LiveMap({
  incidents, resources, hospitals = [], height = 480, compact = false, highlightIncidentId,
}: LiveMapProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [, setHovered] = useState<string | null>(null);

  const activeResources = resources.filter(r => r.status !== 'offline');

  const mapBg = isDark ? '#0a1628' : '#e2e8f0';
  const blockFill = isDark ? '#0f1e35' : '#ffffff';
  const blockBorder = isDark ? '#122044' : '#cbd5e1';
  const streetColor = isDark ? '#0d2040' : '#cbd5e1';

  return (
    <div
      className="relative rounded-lg overflow-hidden transition-colors duration-200"
      style={{ background: mapBg, height, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}
    >
      {/* SVG Map */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background */}
        <rect width="100" height="100" fill={mapBg} />

        {/* City blocks */}
        {BLOCKS.map((b, i) => (
          <rect
            key={i}
            x={b.x} y={b.y} width={b.w} height={b.h}
            fill={blockFill} stroke={blockBorder} strokeWidth="0.25" rx="0.5"
          />
        ))}

        {/* Horizontal streets */}
        {GRID_H.map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke={streetColor} strokeWidth="0.6" />
        ))}

        {/* Vertical streets */}
        {GRID_V.map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke={streetColor} strokeWidth="0.6" />
        ))}

        {/* Hospital markers */}
        {!compact && hospitals.map(h => (
          <g key={h.id} transform={`translate(${h.location.x}, ${h.location.y})`}>
            <circle r="2.5" fill={isDark ? '#0a4a2a' : '#dcfce7'} stroke="#22c55e" strokeWidth="0.5" />
            <text x="0" y="1" textAnchor="middle" fontSize="2.5" fill="#16a34a" fontWeight="bold">H</text>
          </g>
        ))}

        {/* Route lines for en_route resources */}
        {incidents
          .filter(inc => inc.status !== 'resolved')
          .map(inc =>
            resources
              .filter(r => inc.assignedResourceIds.includes(r.id) && r.status === 'en_route')
              .map(r => (
                <line
                  key={`route-${r.id}`}
                  x1={r.location.x} y1={r.location.y}
                  x2={inc.location.x} y2={inc.location.y}
                  stroke={RESOURCE_STATUS_COLOR[r.status]}
                  strokeWidth="0.5"
                  strokeDasharray="1.2 1"
                  opacity="0.7"
                />
              ))
          )}

        {/* Incident markers */}
        {incidents
          .filter(inc => inc.status !== 'resolved')
          .map(inc => {
            const color = PRIORITY_COLORS[inc.priority] ?? '#ef4444';
            const isHighlight = inc.id === highlightIncidentId;
            return (
              <g
                key={inc.id}
                transform={`translate(${inc.location.x}, ${inc.location.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  setHovered(inc.id);
                  setTooltip({ x: inc.location.x, y: inc.location.y, text: `${inc.incidentNumber} — ${inc.category.toUpperCase()} — ${inc.priority}` });
                }}
                onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              >
                {/* Pulse ring for P1 */}
                {inc.priority === 'P1' && (
                  <circle r="4.5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" className="animate-resource-move" />
                )}
                <circle r={isHighlight ? 3.2 : 2.6} fill={`${color}33`} stroke={color} strokeWidth={isHighlight ? 0.9 : 0.6} />
                <text x="0" y="1" textAnchor="middle" fontSize="2.2" fill={color} fontWeight="bold">
                  {inc.priority === 'P1' ? '!!' : inc.priority === 'P2' ? '!' : '·'}
                </text>
              </g>
            );
          })}

        {/* Resolved incidents (dim) */}
        {incidents
          .filter(inc => inc.status === 'resolved')
          .map(inc => (
            <circle
              key={inc.id}
              cx={inc.location.x} cy={inc.location.y} r="1.5"
              fill={isDark ? '#14532d33' : '#dcfce7'} stroke="#22c55e" strokeWidth="0.3" opacity="0.5"
            />
          ))}

        {/* Resource markers */}
        {activeResources.map(res => {
          const color = RESOURCE_STATUS_COLOR[res.status];
          const emoji = RESOURCE_EMOJI[res.type];
          return (
            <g
              key={res.id}
              transform={`translate(${res.location.x}, ${res.location.y})`}
              style={{ cursor: 'pointer', transition: 'transform 2s linear' }}
              onMouseEnter={() => setTooltip({
                x: res.location.x, y: res.location.y,
                text: `${res.name} — ${RESOURCE_STATUS_META[res.status].label}${res.eta ? ` — ETA ${res.eta}m` : ''}`,
              })}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle r="2.8" fill={isDark ? '#0f172a' : '#ffffff'} stroke={color} strokeWidth="0.7" />
              <text x="0" y="1.2" textAnchor="middle" fontSize="3">
                {emoji}
              </text>
              {res.status === 'en_route' && (
                <circle r="4.2" fill="none" stroke={color} strokeWidth="0.4" opacity="0.6" className="animate-resource-move" />
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g transform={`translate(${Math.min(tooltip.x, 75)}, ${Math.max(tooltip.y - 8, 5)})`}>
            <rect
              x="-1" y="-3" rx="1"
              width={tooltip.text.length * 1.4 + 3}
              height="5.5"
              fill={isDark ? '#1e293b' : '#ffffff'} stroke={isDark ? '#334155' : '#94a3b8'} strokeWidth="0.4"
            />
            <text x="0.5" y="0.7" fontSize="2.2" fill={isDark ? '#f1f5f9' : '#0f172a'} fontFamily="monospace" fontWeight="600">
              {tooltip.text}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {!compact && (
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
          <div className="font-mono text-xs rounded px-2.5 py-1.5 backdrop-blur-md" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-dim)' }}>LEGEND</div>
            <div className="space-y-0.5">
              <div><span style={{ color: '#ef4444' }}>● P1</span> <span style={{ color: '#f97316' }}>● P2</span> <span style={{ color: '#eab308' }}>● P3</span></div>
              <div>🚑 Amb &nbsp; 🚒 Fire &nbsp; 🚓 Police</div>
              <div>🟢 Avail &nbsp; 🔵 En Route &nbsp; 🟣 Scene</div>
            </div>
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-xs rounded px-2.5 py-1 backdrop-blur-md"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
        LIVE
      </div>
    </div>
  );
}
