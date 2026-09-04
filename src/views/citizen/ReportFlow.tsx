import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { IncidentCategory } from '../../types';
import { CATEGORY_META } from '../../components/Shared';
import ThemeToggle from '../../components/ThemeToggle';
import LiveLocationPicker from '../../components/LiveLocationPicker';

const CATEGORIES: IncidentCategory[] = ['fire', 'medical', 'accident', 'crime', 'disaster', 'other'];
const STEPS = ['CATEGORY', 'LOCATION', 'DESCRIPTION', 'REVIEW'];

type InputMode = 'text' | 'image' | 'voice';

export default function ReportFlow() {
  const { state, dispatch, submitReport, theme } = useApp();
  const isDark = theme === 'dark';
  const { reportDraft } = state;
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<InputMode>('text');
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      recTimer.current = setInterval(s => s + 1, 1000);
    } else {
      if (recTimer.current) clearInterval(recTimer.current);
    }
    return () => { if (recTimer.current) clearInterval(recTimer.current); };
  }, [recording]);

  const isLocationConfirmed = !!(reportDraft.location && reportDraft.locationConfirmed);

  const canProceed = () => {
    if (step === 0) return !!reportDraft.category;
    if (step === 1) return isLocationConfirmed;
    if (step === 2) return !!(reportDraft.description || reportDraft.hasImage || reportDraft.hasVoice);
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    submitReport();
  };

  const stopRecording = () => {
    setRecording(false);
    dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: { hasVoice: true, voiceDuration: recSeconds } });
    setRecSeconds(0);
  };

  return (
    <div className="h-full flex flex-col transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 backdrop-blur-md transition-colors duration-200"
        style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => step === 0 ? dispatch({ type: 'SET_VIEW', payload: 'citizen_dashboard' }) : setStep(step - 1)}
          className="w-8 h-8 rounded flex items-center justify-center text-xl cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          ←
        </button>
        <div className="flex-1">
          <div className="font-display text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Report Emergency</div>
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Step {step + 1} of 4 — {STEPS[step]}</div>
        </div>
        {/* Step progress pills */}
        <div className="flex gap-1 items-center">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 w-5 sm:w-6 rounded-full transition-all"
              style={{ background: i <= step ? '#ef4444' : 'var(--border-subtle)' }} />
          ))}
        </div>
        <ThemeToggle size="sm" />
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* STEP 1: Category */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What is the emergency?</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Select the primary category that best describes the situation.</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => {
                const m = CATEGORY_META[cat];
                const selected = reportDraft.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: { category: cat } })}
                    className="rounded-2xl p-4 text-left transition-all cursor-pointer shadow-sm active:scale-98"
                    style={{
                      background: selected
                        ? (isDark ? `${m.color}22` : `${m.color}15`)
                        : 'var(--bg-card)',
                      border: `2px solid ${selected ? m.color : 'var(--border-subtle)'}`,
                      boxShadow: selected ? `0 4px 16px ${m.color}22` : 'var(--shadow-elevation)',
                    }}
                  >
                    <div className="text-3xl mb-2">{m.emoji}</div>
                    <div className="font-display text-lg font-bold" style={{ color: selected ? m.color : 'var(--text-primary)' }}>
                      {m.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Live Location Detection & Confirmation */}
        {step === 1 && (
          <LiveLocationPicker />
        )}

        {/* STEP 3: Description */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Describe the Emergency</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Add text, photo, and/or voice. Use any combination.</p>

            {/* Input mode tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {(['text', 'image', 'voice'] as InputMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: mode === m ? 'var(--bg-card-hover)' : 'transparent',
                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: mode === m ? 'var(--shadow-elevation)' : 'none',
                  }}
                >
                  {m === 'text' ? '✏ Text' : m === 'image' ? '📷 Image' : '🎙 Voice'}
                </button>
              ))}
            </div>

            {mode === 'text' && (
              <textarea
                className="w-full rounded-2xl p-4 text-sm resize-none outline-none transition-colors"
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)', minHeight: 140, caretColor: '#ef4444',
                }}
                placeholder="Describe what happened, what you see, and any injuries or hazards..."
                value={reportDraft.description}
                onChange={e => dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: { description: e.target.value } })}
              />
            )}

            {mode === 'image' && (
              <div>
                {reportDraft.hasImage ? (
                  <div className="rounded-2xl overflow-hidden relative shadow-sm" style={{ border: '1px solid #22c55e' }}>
                    <img
                      src={reportDraft.imageUrl || 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=240&fit=crop&auto=format'}
                      alt="Emergency evidence"
                      className="w-full object-cover"
                      style={{ height: 200 }}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: { hasImage: false, imageUrl: '' } })}
                        className="w-7 h-7 rounded-full text-xs flex items-center justify-center cursor-pointer shadow"
                        style={{ background: '#ef4444', color: 'white' }}
                      >✕</button>
                    </div>
                    <div className="absolute bottom-2 left-2 font-mono text-xs px-2 py-0.5 rounded backdrop-blur-md"
                      style={{ background: 'var(--glass-bg)', color: '#16a34a', fontWeight: 'bold' }}>
                      ✓ Photo attached
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => dispatch({
                      type: 'UPDATE_REPORT_DRAFT',
                      payload: {
                        hasImage: true,
                        imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=240&fit=crop&auto=format',
                      },
                    })}
                    className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:border-blue-500"
                    style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-default)', height: 180 }}
                  >
                    <div className="text-4xl">📷</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tap to attach a photo</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>(Demo: uses sample image)</div>
                  </button>
                )}
              </div>
            )}

            {mode === 'voice' && (
              <div className="rounded-2xl p-6 flex flex-col items-center gap-4 transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
                {reportDraft.hasVoice && !recording ? (
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ background: '#22c55e22', border: '1px solid #22c55e' }}>🎙</div>
                      <div>
                        <div className="font-semibold" style={{ color: '#16a34a' }}>Recording saved</div>
                        <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          {reportDraft.voiceDuration}s duration
                        </div>
                      </div>
                    </div>
                    {/* Waveform viz */}
                    <div className="flex items-center gap-0.5 h-8">
                      {Array.from({ length: 32 }, (_, i) => (
                        <div key={i} className="flex-1 rounded-full"
                          style={{
                            background: '#22c55e',
                            height: `${20 + Math.sin(i * 0.8) * 16 + Math.random() * 10}%`,
                            opacity: 0.7,
                          }} />
                      ))}
                    </div>
                    <button
                      onClick={() => { dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: { hasVoice: false, voiceDuration: 0 } }); setRecSeconds(0); }}
                      className="mt-3 text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      Delete & re-record
                    </button>
                  </div>
                ) : recording ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: '#ef444422', border: '2px solid #ef4444' }}>🎙</div>
                      <div className="absolute inset-0 rounded-full animate-resource-move"
                        style={{ border: '2px solid #ef4444', opacity: 0.4 }} />
                    </div>
                    <div className="font-mono text-xl font-bold" style={{ color: '#ef4444' }}>
                      {String(Math.floor(recSeconds / 60)).padStart(2, '0')}:{String(recSeconds % 60).padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-0.5 h-8 w-full">
                      {Array.from({ length: 32 }, (_, i) => (
                        <div key={i} className="flex-1 rounded-full animate-blink"
                          style={{
                            background: '#ef4444',
                            height: `${30 + Math.sin(i * 1.2 + recSeconds) * 30}%`,
                            animationDelay: `${i * 40}ms`,
                          }} />
                      ))}
                    </div>
                    <button
                      onClick={stopRecording}
                      className="w-full py-3 rounded-xl font-semibold cursor-pointer shadow"
                      style={{ background: '#ef4444', color: 'white' }}
                    >
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => { setRecording(true); setRecSeconds(0); }}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all cursor-pointer shadow-md hover:scale-105"
                      style={{ background: '#ef444422', border: '2px solid #ef4444' }}
                    >🎙</button>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tap to record voice message</div>
                  </div>
                )}
              </div>
            )}

            {/* Status chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {reportDraft.description && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                  ✓ Text description
                </div>
              )}
              {reportDraft.hasImage && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                  ✓ Photo attached
                </div>
              )}
              {reportDraft.hasVoice && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: '#22c55e22', color: '#16a34a', border: '1px solid #22c55e44' }}>
                  ✓ Voice {reportDraft.voiceDuration}s
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Review & Submit</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Confirm your emergency report before submission.</p>

            <div className="space-y-3">
              <ReviewRow
                label="Category"
                value={reportDraft.category ? `${CATEGORY_META[reportDraft.category].emoji} ${CATEGORY_META[reportDraft.category].label}` : '—'}
              />
              <ReviewRow
                label="Location"
                value={
                  reportDraft.location
                    ? `📍 ${reportDraft.location.label} (${reportDraft.location.isLiveGps ? 'Live GPS' : 'Pinned'}) — Verified`
                    : '📍 Downtown — GPS Detected'
                }
              />
              {reportDraft.location?.lat && (
                <ReviewRow
                  label="GPS Coordinates"
                  value={`${reportDraft.location.lat.toFixed(5)}°, ${reportDraft.location.lng?.toFixed(5)}° (±${reportDraft.location.accuracy ?? 6}m)`}
                />
              )}
              <ReviewRow
                label="Description"
                value={reportDraft.description || '(not provided)'}
                truncate
              />
              <ReviewRow label="Photo" value={reportDraft.hasImage ? '✓ 1 photo attached' : 'Not attached'} />
              <ReviewRow
                label="Voice"
                value={reportDraft.hasVoice ? `✓ ${reportDraft.voiceDuration}s recording` : 'Not recorded'}
              />
            </div>

            <div className="mt-4 rounded-2xl p-4 transition-colors" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs font-bold mb-1" style={{ color: 'var(--text-dim)' }}>IMPORTANT</div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                By submitting, you confirm this is a genuine emergency. False reports may result in resource diversion from real emergencies.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="flex-shrink-0 p-4 transition-colors duration-200" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-3.5 rounded-xl font-display text-xl font-bold transition-all shadow-md"
            style={{
              background: canProceed() ? '#ef4444' : 'var(--bg-card-hover)',
              color: canProceed() ? 'white' : 'var(--text-dim)',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            {step === 1 && !isLocationConfirmed
              ? '🔒 PLEASE CONFIRM & FIX LOCATION ABOVE'
              : step < 3
                ? `NEXT — ${STEPS[step + 1]}`
                : '🚨 SUBMIT EMERGENCY'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, truncate = false }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl px-4 py-3 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
      <span className="font-mono text-xs pt-0.5 flex-shrink-0 w-28" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className={`text-sm font-semibold ${truncate ? 'line-clamp-2' : ''}`} style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

