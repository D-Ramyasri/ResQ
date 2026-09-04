import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { MapCoord } from '../types';

interface LiveLocationPickerProps {
  onLocationConfirmed?: (loc: MapCoord) => void;
}

const PRESET_LANDMARKS: { name: string; coord: MapCoord }[] = [
  {
    name: 'Downtown Central (5th Ave)',
    coord: { x: 52, y: 47, label: 'Central Park Ave & 5th St — Downtown', lat: 40.7128, lng: -74.006, accuracy: 6 },
  },
  {
    name: 'Riverside Drive & 3rd',
    coord: { x: 26, y: 31, label: 'Riverside Drive & 3rd Ave — Westside', lat: 40.7182, lng: -74.015, accuracy: 8 },
  },
  {
    name: 'Midtown Medical District',
    coord: { x: 40, y: 61, label: 'Health Sciences Corridor — Midtown', lat: 40.7255, lng: -73.998, accuracy: 5 },
  },
  {
    name: 'Industrial Park & Hwy 9',
    coord: { x: 79, y: 76, label: 'Industrial Logistics Hub — East Gate', lat: 40.7095, lng: -73.985, accuracy: 12 },
  },
  {
    name: 'Commerce Bridge North',
    coord: { x: 66, y: 31, label: 'Commerce Expressway & Bridge Approach', lat: 40.731, lng: -73.99, accuracy: 10 },
  },
];

export default function LiveLocationPicker({ onLocationConfirmed }: LiveLocationPickerProps) {
  const { state, dispatch, theme, addToast } = useApp();
  const isDark = theme === 'dark';
  const { reportDraft } = state;

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const initialLocation = reportDraft.location ?? PRESET_LANDMARKS[0].coord;
  const isConfirmed = !!reportDraft.locationConfirmed;

  const mapSvgRef = useRef<SVGSVGElement | null>(null);

  // Real GPS detection handler
  const detectLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      addToast('GPS unavailable — using estimated city landmark.', 'warning');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const roundedLat = parseFloat(latitude.toFixed(5));
        const roundedLng = parseFloat(longitude.toFixed(5));
        const roundedAcc = Math.round(accuracy);
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let addressLabel = `Live GPS (${roundedLat}°, ${roundedLng}°)`;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${roundedLat}&lon=${roundedLng}&format=json`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              const parts = data.display_name.split(',');
              addressLabel = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Fallback to coordinates label if reverse lookup times out
          addressLabel = `Live GPS Position (${roundedLat}°, ${roundedLng}°)`;
        }

        // Map lat/lng hash to visual map x/y within 15..85 range
        const pseudoX = Math.abs(Math.sin(latitude * 100)) * 60 + 20;
        const pseudoY = Math.abs(Math.cos(longitude * 100)) * 50 + 15;

        const newCoord: MapCoord = {
          x: Math.round(pseudoX),
          y: Math.round(pseudoY),
          label: addressLabel,
          lat: roundedLat,
          lng: roundedLng,
          accuracy: roundedAcc,
          isLiveGps: true,
          timestamp: timeString,
        };

        dispatch({
          type: 'UPDATE_REPORT_DRAFT',
          payload: {
            location: newCoord,
            locationConfirmed: false, // Reset confirmation so user explicitly verifies
          },
        });

        setIsLocating(false);
        addToast(`📍 Location detected: ${addressLabel}`, 'info');
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please pick a location on the map.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Using nearest detected beacon.';
        }
        setGpsError(msg);
        addToast(msg, 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }, [dispatch, addToast]);

  // Trigger GPS detection once on mount if no location was confirmed yet
  useEffect(() => {
    if (!reportDraft.location) {
      detectLiveLocation();
    }
  }, [detectLiveLocation, reportDraft.location]);

  // Handle map click to reposition pin
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!mapSvgRef.current) return;
    const rect = mapSvgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 60;

    const clampedX = Math.max(10, Math.min(90, Math.round(clickX)));
    const clampedY = Math.max(10, Math.min(50, Math.round(clickY)));

    const newCoord: MapCoord = {
      x: clampedX,
      y: clampedY,
      label: customAddress.trim() || `Pinned Map Location (Grid ${clampedX}, ${clampedY})`,
      accuracy: 5,
      isLiveGps: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch({
      type: 'UPDATE_REPORT_DRAFT',
      payload: {
        location: newCoord,
        locationConfirmed: false, // Prompt confirmation on pin change
      },
    });
  };

  // Confirm and fix the location
  const handleConfirmLocation = () => {
    const currentLoc = reportDraft.location ?? initialLocation;
    const confirmedLoc: MapCoord = {
      ...currentLoc,
      confirmed: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch({
      type: 'UPDATE_REPORT_DRAFT',
      payload: {
        location: confirmedLoc,
        locationConfirmed: true,
      },
    });

    if (onLocationConfirmed) {
      onLocationConfirmed(confirmedLoc);
    }

    addToast('🔒 Emergency location confirmed and fixed.', 'success');
  };

  // Unlock to adjust
  const handleUnlockLocation = () => {
    dispatch({
      type: 'UPDATE_REPORT_DRAFT',
      payload: {
        locationConfirmed: false,
      },
    });
  };

  const handleSelectPreset = (coord: MapCoord) => {
    dispatch({
      type: 'UPDATE_REPORT_DRAFT',
      payload: {
        location: { ...coord, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        locationConfirmed: false,
      },
    });
    setCustomAddress('');
  };

  const activeCoord = reportDraft.location ?? initialLocation;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Confirm Emergency Location
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ensure your live location is accurate so responders dispatch to the exact spot.
          </p>
        </div>
        <button
          type="button"
          onClick={detectLiveLocation}
          disabled={isLocating}
          title="Detect Current GPS Location"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 disabled:opacity-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            color: '#3b82f6',
          }}
        >
          <span className={`text-base ${isLocating ? 'animate-spin' : ''}`}>📡</span>
          <span>{isLocating ? 'Acquiring GPS...' : 'Re-detect GPS'}</span>
        </button>
      </div>

      {/* Interactive Map Card */}
      <div
        className="rounded-2xl overflow-hidden relative shadow-md transition-colors"
        style={{
          height: 240,
          background: isDark ? '#0a1628' : '#e2e8f0',
          border: isConfirmed ? '2px solid #22c55e' : '2px solid var(--border-default)',
        }}
      >
        <svg
          ref={mapSvgRef}
          onClick={!isConfirmed ? handleMapClick : undefined}
          className={`w-full h-full ${!isConfirmed ? 'cursor-crosshair' : 'cursor-default'}`}
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Base Grid */}
          <rect width="100" height="60" fill={isDark ? '#0a1628' : '#e2e8f0'} />

          {/* Streets */}
          {[12, 24, 36, 48].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke={isDark ? '#122044' : '#cbd5e1'} strokeWidth="0.7" />
          ))}
          {[15, 30, 45, 60, 75, 90].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="60" stroke={isDark ? '#122044' : '#cbd5e1'} strokeWidth="0.7" />
          ))}

          {/* City building footprints */}
          {[
            { x: 18, y: 15, w: 9, h: 7 },
            { x: 33, y: 15, w: 9, h: 7 },
            { x: 48, y: 15, w: 9, h: 7 },
            { x: 63, y: 15, w: 9, h: 7 },
            { x: 18, y: 27, w: 9, h: 7 },
            { x: 33, y: 27, w: 9, h: 7 },
            { x: 48, y: 27, w: 9, h: 7 },
            { x: 63, y: 27, w: 9, h: 7 },
            { x: 18, y: 39, w: 9, h: 7 },
            { x: 33, y: 39, w: 9, h: 7 },
            { x: 48, y: 39, w: 9, h: 7 },
            { x: 63, y: 39, w: 9, h: 7 },
          ].map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={isDark ? '#0f1e35' : '#f8fafc'}
              stroke={isDark ? '#16284d' : '#cbd5e1'}
              strokeWidth="0.3"
              rx="0.5"
            />
          ))}

          {/* Accuracy radius ring */}
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r={activeCoord.accuracy ? Math.min(12, Math.max(5, activeCoord.accuracy / 2)) : 6}
            fill={isConfirmed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
            stroke={isConfirmed ? '#22c55e' : '#ef4444'}
            strokeWidth="0.4"
            strokeDasharray="1 1"
          />

          {/* Location Pin with pulse */}
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="4.5"
            fill="none"
            stroke={isConfirmed ? '#22c55e' : '#ef4444'}
            strokeWidth="0.5"
            opacity="0.6"
            className="animate-resource-move"
          />
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="2.2"
            fill={isConfirmed ? '#22c55e' : '#ef4444'}
            stroke="#ffffff"
            strokeWidth="0.6"
          />
        </svg>

        {/* Top-left map instructions / lock badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          {isConfirmed ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold backdrop-blur-md shadow"
              style={{ background: isDark ? 'rgba(20, 83, 45, 0.9)' : 'rgba(220, 252, 231, 0.95)', color: '#16a34a', border: '1px solid #22c55e' }}
            >
              <span>🔒</span>
              <span>LOCATION LOCKED & CONFIRMED</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold backdrop-blur-md shadow"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <span>🎯</span>
              <span>Click map to adjust pin position</span>
            </div>
          )}
        </div>

        {/* GPS Sensor status pill */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs backdrop-blur-md"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: activeCoord.isLiveGps ? '#22c55e' : '#eab308' }}
            />
            <span>{activeCoord.isLiveGps ? 'LIVE GPS SENSOR' : 'MANUAL PIN'}</span>
          </div>
        </div>
      </div>

      {/* Location Details & Confirmation Card */}
      <div
        className="rounded-2xl p-5 transition-all shadow-md"
        style={{
          background: isConfirmed
            ? (isDark ? '#0a1f0a' : '#f0fdf4')
            : 'var(--bg-card)',
          border: isConfirmed ? '2px solid #22c55e' : '1px solid var(--border-default)',
          boxShadow: isConfirmed ? '0 4px 20px rgba(34, 197, 94, 0.15)' : 'var(--shadow-elevation)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{
                background: isConfirmed
                  ? (isDark ? '#14532d' : '#dcfce7')
                  : (isDark ? '#1e3a5f' : '#dbeafe'),
                border: `1px solid ${isConfirmed ? '#22c55e' : '#3b82f6'}`,
              }}
            >
              {isConfirmed ? '🔒' : '📍'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {isConfirmed ? 'Verified Emergency Location' : 'Detected Incident Spot'}
                </span>
                {isConfirmed && (
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}
                  >
                    ✓ FIXED
                  </span>
                )}
              </div>
              <div className="font-display text-xl font-bold leading-tight mt-0.5" style={{ color: isConfirmed ? '#16a34a' : 'var(--text-primary)' }}>
                {activeCoord.label}
              </div>
            </div>
          </div>
        </div>

        {/* GPS Metadata Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 font-mono text-xs border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div style={{ color: 'var(--text-dim)' }}>COORDINATES</div>
            <div className="font-bold" style={{ color: 'var(--text-secondary)' }}>
              {activeCoord.lat ? `${activeCoord.lat.toFixed(4)}°, ${activeCoord.lng?.toFixed(4)}°` : `Grid (${activeCoord.x}, ${activeCoord.y})`}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)' }}>ACCURACY</div>
            <div className="font-bold" style={{ color: '#16a34a' }}>
              ±{activeCoord.accuracy ?? 6} meters
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)' }}>SOURCE</div>
            <div className="font-bold" style={{ color: activeCoord.isLiveGps ? '#3b82f6' : '#f59e0b' }}>
              {activeCoord.isLiveGps ? 'Device Satellite' : 'Interactive Map'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)' }}>TIMESTAMP</div>
            <div className="font-bold" style={{ color: 'var(--text-secondary)' }}>
              {activeCoord.timestamp ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Confirmation Buttons */}
        <div className="mt-4 pt-3 flex flex-col sm:flex-row gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {!isConfirmed ? (
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="flex-1 py-3 px-4 rounded-xl font-display text-lg font-bold transition-all shadow-md cursor-pointer select-none active:scale-98 flex items-center justify-center gap-2"
              style={{ background: '#22c55e', color: 'white' }}
            >
              <span>✓</span>
              <span>CONFIRM & FIX THIS LOCATION</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold" style={{ color: '#16a34a' }}>
                <span>✓</span>
                <span>Responders will navigate to this exact pinned coordinate.</span>
              </div>
              <button
                type="button"
                onClick={handleUnlockLocation}
                className="py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                ✏ Adjust / Change Pin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preset Landmarks & Search Bar (Visible when not confirmed or adjusting) */}
      {!isConfirmed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              Quick Landmarks & Sectors
            </span>
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              className="text-xs font-semibold cursor-pointer hover:underline"
              style={{ color: '#3b82f6' }}
            >
              {showSearch ? 'Hide custom search' : '+ Search / Type address'}
            </button>
          </div>

          {/* Quick preset landmark tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_LANDMARKS.map((p) => {
              const isSelected = activeCoord.label === p.coord.label;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p.coord)}
                  className="text-left px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  style={{
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? '#3b82f6' : 'var(--border-subtle)'}`,
                    color: isSelected ? '#3b82f6' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 'bold' : 'normal',
                  }}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="font-mono text-[10px] truncate opacity-75">{p.coord.label}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Address Input */}
          {showSearch && (
            <div className="p-3 rounded-2xl transition-colors space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Enter Building Name / Apartment / Floor
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. Building 4, 3rd Floor, Flat 302, Rivergate Complex..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAddress.trim()) {
                      const updated: MapCoord = {
                        ...activeCoord,
                        label: customAddress.trim(),
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      dispatch({
                        type: 'UPDATE_REPORT_DRAFT',
                        payload: { location: updated, locationConfirmed: false },
                      });
                      addToast('Custom landmark applied. Please confirm location.', 'info');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  style={{ background: '#3b82f6', color: 'white' }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c' }}>
          ⚠️ {gpsError}
        </div>
      )}
    </div>
  );
}
