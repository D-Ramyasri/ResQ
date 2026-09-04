import type { Domain, IncidentCategory, MapCoord } from '../types';

export interface FeatherlessAnalysis {
  severity: 'critical' | 'high' | 'moderate' | 'low';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  urgency: 'immediate' | 'urgent' | 'soon' | 'routine';
  people_at_risk: number;
  hazards: string[];
  response_domains: string[];
  recommended_resource_types: string[];
  summary: string;
  responder_guidance: Record<string, string[]>;
}

function getFunctionUrl() {
  const explicitUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
  if (explicitUrl) return explicitUrl;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return supabaseUrl ? `${supabaseUrl}/functions/v1/analyze-incident` : null;
}

function getSupabaseAnonKey() {
  return import.meta.env.VITE_SUPABASE_ANON_KEY;
}

export async function analyzeIncidentWithFeatherless(input: {
  category: IncidentCategory;
  description: string;
  location: MapCoord;
  etaMinutes?: number;
}): Promise<FeatherlessAnalysis> {
  const functionUrl = getFunctionUrl();
  if (!functionUrl) throw new Error('Supabase analyze-incident function is not configured');
  const anonKey = getSupabaseAnonKey();
  if (!anonKey) throw new Error('Supabase anon key is not configured');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(input),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.analysis) throw new Error(payload.error || `Analysis failed (${response.status})`);
    return payload.analysis as FeatherlessAnalysis;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function toSupportedDomains(domains: string[]): Domain[] {
  return domains.filter((domain): domain is Domain =>
    domain === 'fire' || domain === 'medical' || domain === 'police' || domain === 'accident' || domain === 'disaster'
  );
}
