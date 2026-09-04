import { supabase } from './supabase';
import type { AIAnalysis, Domain, Priority, Severity } from '../types';

export interface AIAnalysisResult {
  severity: Severity;
  priority: Priority;
  urgency: string;
  people_at_risk: number;
  hazards: string[];
  response_domains: Domain[];
  recommended_resource_types: string[];
  summary: string;
  confidence: number;
  recommendedResourceIds?: string[];
}

/**
 * Deterministic fallback rule engine for emergency context analysis
 */
export function getDeterministicFallback(
  category: string,
  description: string
): AIAnalysisResult {
  const desc = (description || '').toLowerCase();
  const cat = (category || 'other').toLowerCase();

  const isSevereCrime =
    cat === 'crime' &&
    (desc.includes('bleed') ||
      desc.includes('attack') ||
      desc.includes('injur') ||
      desc.includes('wound') ||
      desc.includes('shot') ||
      desc.includes('stab') ||
      desc.includes('unconscious') ||
      desc.includes('weapon') ||
      desc.includes('victim'));

  const isSevereAccident =
    cat === 'accident' &&
    (desc.includes('trap') ||
      desc.includes('sever') ||
      desc.includes('multi') ||
      desc.includes('fire') ||
      desc.includes('casualt') ||
      desc.includes('injur') ||
      desc.includes('collide') ||
      desc.includes('crashed'));

  const isSevereFire =
    cat === 'fire' &&
    (desc.includes('trap') ||
      desc.includes('spread') ||
      desc.includes('explos') ||
      desc.includes('smoke') ||
      desc.includes('burn') ||
      desc.includes('building'));

  if (isSevereCrime) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'Immediate — violent encounter with active trauma',
      people_at_risk: 2,
      hazards: ['Active hostile threat', 'Severe bleeding/trauma', 'Crowd safety risk'],
      response_domains: ['police', 'medical'],
      recommended_resource_types: ['2× Police Tactical Unit', '1× Ambulance (ALS)'],
      summary: 'Violent crime with severe injury requiring combined police perimeter control and immediate paramedic trauma care.',
      confidence: 96,
      recommendedResourceIds: ['pol-p04', 'amb-a01'],
    };
  }

  if (isSevereAccident) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'Immediate — life-threatening entrapment',
      people_at_risk: 3,
      hazards: ['Vehicle entrapment', 'Fuel spill / fire risk', 'Major roadway traffic hazard'],
      response_domains: ['accident', 'medical', 'fire', 'police'],
      recommended_resource_types: ['1× Rescue Extrication', '2× Ambulance (ALS)', '1× Fire Engine', '1× Police Unit'],
      summary: 'Major multi-vehicle collision with trapped occupants and multiple casualties requiring rescue extrication, ALS transport, and traffic containment.',
      confidence: 97,
      recommendedResourceIds: ['res-r01', 'amb-a01', 'pol-p01', 'fire-f01'],
    };
  }

  if (isSevereFire) {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'Immediate — active structural blaze',
      people_at_risk: 2,
      hazards: ['Active structural fire', 'Dense smoke inhalation', 'Structural collapse hazard'],
      response_domains: ['fire', 'medical', 'police'],
      recommended_resource_types: ['2× Fire Engine', '1× Ladder Truck', '1× Ambulance (precautionary)'],
      summary: 'Structure fire with rapid spread potential requiring heavy suppression teams, perimeter security, and standby emergency medical support.',
      confidence: 95,
      recommendedResourceIds: ['fire-f01', 'fire-f02', 'amb-a04', 'pol-p04'],
    };
  }

  if (cat === 'medical') {
    return {
      severity: 'HIGH',
      priority: 'P2',
      urgency: 'Immediate — respond within 4 minutes',
      people_at_risk: 1,
      hazards: ['Time-critical health condition', 'Respiratory/cardiac compromise'],
      response_domains: ['medical'],
      recommended_resource_types: ['1× Ambulance (ALS)'],
      summary: 'Acute medical distress requiring advanced life support paramedics.',
      confidence: 92,
      recommendedResourceIds: ['amb-a01', 'amb-a02'],
    };
  }

  if (cat === 'disaster') {
    return {
      severity: 'CRITICAL',
      priority: 'P1',
      urgency: 'Immediate — mass coordination required',
      people_at_risk: 6,
      hazards: ['Structural instability', 'Environmental hazard', 'Disrupted access routes'],
      response_domains: ['disaster', 'fire', 'medical', 'police'],
      recommended_resource_types: ['2× Urban Search & Rescue', '2× Ambulance (ALS)', '1× Police Command'],
      summary: 'Disaster event requiring coordinated search and rescue, evacuation support, and emergency medical triage.',
      confidence: 96,
      recommendedResourceIds: ['res-r01', 'res-r02', 'fire-f01', 'amb-a01'],
    };
  }

  // Baseline domain mapping
  const domainMap: Record<string, Domain[]> = {
    crime: ['police'],
    fire: ['fire'],
    accident: ['accident', 'police'],
    medical: ['medical'],
    disaster: ['disaster'],
    other: ['police', 'medical'],
  };

  return {
    severity: 'HIGH',
    priority: 'P2',
    urgency: 'Urgent — respond within 6 minutes',
    people_at_risk: 1,
    hazards: ['Unsecured scene', 'Potential escalation'],
    response_domains: domainMap[cat] ?? ['police'],
    recommended_resource_types: ['1× Police Unit', '1× Ambulance'],
    summary: `${cat.toUpperCase()} incident reported by citizen. Response units alerted for on-site assessment.`,
    confidence: 88,
    recommendedResourceIds: ['pol-p04', 'amb-a01'],
  };
}

/**
 * Analyzes the emergency context using Supabase Edge Function / Featherless Server Proxy,
 * or gracefully falls back to deterministic rule analysis.
 */
export async function analyzeEmergencyContext(params: {
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  etaMinutes?: number;
}): Promise<AIAnalysis> {
  const { category, description, latitude, longitude, address, etaMinutes } = params;

  // 1. Try local server-side Featherless proxy first
  try {
    const res = await fetch('/api/analyze-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description, latitude, longitude, address, eta_minutes: etaMinutes }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.severity && data.response_domains) {
        const priorityUpper = (data.priority || 'P1').toUpperCase() as Priority;
        const severityUpper = (data.severity || 'HIGH').toUpperCase() as Severity;
        const domains = (data.response_domains || ['police']) as Domain[];

        return {
          severity: severityUpper,
          priority: priorityUpper,
          peopleAtRisk: data.people_at_risk ?? (severityUpper === 'CRITICAL' ? 2 : 1),
          injuries: data.summary || (description ? `Context: ${description.slice(0, 80)}` : 'Injuries reported at scene'),
          hazards: data.hazards || ['Unsecured emergency area'],
          urgency: data.urgency || (priorityUpper === 'P1' ? 'Immediate response required' : 'Urgent response required'),
          requiredResources: data.recommended_resource_types || ['1× Primary Response Unit'],
          requiredDomains: domains,
          confidence: data.confidence ?? 95,
          recommendedResourceIds: domains.includes('police') && domains.includes('medical')
            ? ['pol-p04', 'amb-a01']
            : domains.includes('fire')
              ? ['fire-f01', 'fire-f02']
              : ['amb-a01', 'pol-p01'],
          summary: data.summary,
          responderGuidance: data.responder_guidance || data.responderGuidance,
          preArrivalGuidance: data.pre_arrival_guidance || data.preArrivalGuidance,
          source: data.source || 'featherless_live',
          modelUsed: data.modelUsed || 'deepseek-ai/DeepSeek-V3.2',
          httpStatus: data.httpStatus ?? 200,
        };
      }
    }
  } catch {
    // Continue to Supabase Edge Function
  }

  // 2. Try Supabase Edge Function if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-incident', {
        body: { category, description, latitude, longitude, address, eta_minutes: etaMinutes },
      });

      if (!error && data && data.severity && data.response_domains) {
        const priorityUpper = (data.priority || 'P1').toUpperCase() as Priority;
        const severityUpper = (data.severity || 'HIGH').toUpperCase() as Severity;
        const domains = (data.response_domains || ['police']) as Domain[];

        return {
          severity: severityUpper,
          priority: priorityUpper,
          peopleAtRisk: data.people_at_risk ?? (severityUpper === 'CRITICAL' ? 2 : 1),
          injuries: data.summary || (description ? `Context: ${description.slice(0, 80)}` : 'Injuries consistent with reported emergency'),
          hazards: data.hazards || ['Unsecured emergency area'],
          urgency: data.urgency || (priorityUpper === 'P1' ? 'Immediate response required' : 'Urgent response required'),
          requiredResources: data.recommended_resource_types || ['1× Primary Response Unit'],
          requiredDomains: domains,
          confidence: data.confidence ?? 95,
          recommendedResourceIds: domains.includes('police') && domains.includes('medical')
            ? ['pol-p04', 'amb-a01']
            : domains.includes('fire')
              ? ['fire-f01', 'fire-f02']
              : ['amb-a01', 'pol-p01'],
          summary: data.summary,
          responderGuidance: data.responder_guidance || data.responderGuidance,
          preArrivalGuidance: data.pre_arrival_guidance || data.preArrivalGuidance,
          source: data.source || 'featherless_live',
          modelUsed: data.modelUsed || 'deepseek-ai/DeepSeek-V3.2',
          httpStatus: data.httpStatus ?? 200,
        };
      }
    } catch (edgeErr) {
      console.warn('Edge Function invoke error, utilizing fallback:', edgeErr);
    }
  }

  // 3. Deterministic AI Context Analysis Fallback
  const fb = getDeterministicFallback(category, description);

  return {
    severity: fb.severity,
    priority: fb.priority,
    peopleAtRisk: fb.people_at_risk,
    injuries: description ? `Reported: ${description.slice(0, 100)}` : 'Injuries consistent with reported emergency',
    hazards: fb.hazards,
    urgency: fb.urgency,
    requiredResources: fb.recommended_resource_types,
    requiredDomains: fb.response_domains,
    confidence: fb.confidence,
    recommendedResourceIds: fb.recommendedResourceIds ?? ['pol-p04', 'amb-a01'],
    summary: fb.summary,
    source: 'deterministic_fallback',
    modelUsed: 'rule_engine',
    httpStatus: 0,
  };
}
