// Supabase Edge Function: analyze-incident
// Analyzes emergency context using Featherless.ai with deterministic fallback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  eta_minutes?: number;
}

interface AIResult {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  urgency: 'immediate' | 'urgent' | 'soon' | 'routine';
  people_at_risk: number;
  hazards: string[];
  response_domains: string[];
  recommended_resource_types: string[];
  summary: string;
  responder_guidance?: Record<string, string[]>;
  pre_arrival_guidance?: { citizen?: string[] };
  confidence?: number;
}

const SYSTEM_PROMPT = `You are the emergency context analysis engine for ResQ.
The citizen-selected incident category is authoritative. NEVER change the category.

Analyze the provided incident context and determine:
- severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
- priority: "P1" | "P2" | "P3" | "P4"
- urgency: "immediate" | "urgent" | "soon" | "routine"
- people_at_risk: integer number
- hazards: array of concise hazard strings
- response_domains: array of domains needing dispatch, subset of ["police", "medical", "fire", "accident", "disaster"]
- recommended_resource_types: array of specific unit strings (e.g. "police_unit", "ambulance", "fire_truck", "rescue_unit")
- summary: concise operational summary (1-2 sentences)
- responder_guidance: object with keys for each response domain containing 2-3 concise preparation bullets
- pre_arrival_guidance: object with { "citizen": ["2-3 safe pre-arrival safety actions while waiting for help"] }

Return ONLY valid JSON.`;

function getDeterministicFallback(category: string, description: string): AIResult {
  const desc = (description || '').toLowerCase();
  const cat = (category || 'other').toLowerCase();

  const isSevereCrime = cat === 'crime' && (desc.includes('bleed') || desc.includes('attack') || desc.includes('injur') || desc.includes('wound') || desc.includes('shot') || desc.includes('stab') || desc.includes('unconscious'));
  const isSevereAccident = cat === 'accident' && (desc.includes('trap') || desc.includes('sever') || desc.includes('multi') || desc.includes('fire') || desc.includes('casualt') || desc.includes('injur'));
  const isSevereFire = cat === 'fire' && (desc.includes('trap') || desc.includes('spread') || desc.includes('explos') || desc.includes('smoke') || desc.includes('burn'));

  if (isSevereCrime) {
    return {
      severity: 'critical',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 1,
      hazards: ['Active threat', 'Severe bleeding', 'Hostile environment'],
      response_domains: ['police', 'medical'],
      recommended_resource_types: ['police_unit', 'ambulance'],
      summary: 'Violent crime with active bleeding requiring combined police perimeter control and immediate paramedic trauma care.',
      confidence: 94,
    };
  }

  if (isSevereAccident) {
    return {
      severity: 'critical',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 3,
      hazards: ['Vehicle entrapment', 'Fuel leak', 'Traffic hazard', 'Multiple casualties'],
      response_domains: ['accident', 'medical', 'fire', 'police'],
      recommended_resource_types: ['police_unit', 'ambulance', 'fire_truck', 'rescue_unit'],
      summary: 'Major multi-vehicle collision with entrapment and injuries requiring rescue extrication, ALS ambulances, and traffic containment.',
      confidence: 96,
    };
  }

  if (isSevereFire) {
    return {
      severity: 'critical',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 2,
      hazards: ['Active fire spread', 'Smoke inhalation', 'Structural compromise'],
      response_domains: ['fire', 'medical', 'police'],
      recommended_resource_types: ['fire_truck', 'ambulance', 'police_unit'],
      summary: 'Active structure fire with threat of spread requiring fire suppression, precautionary EMS, and police crowd perimeter.',
      confidence: 93,
    };
  }

  if (cat === 'medical') {
    return {
      severity: 'high',
      priority: 'P2',
      urgency: 'immediate',
      people_at_risk: 1,
      hazards: ['Time-critical health condition', 'Respiratory/cardiac distress'],
      response_domains: ['medical'],
      recommended_resource_types: ['ambulance'],
      summary: 'Critical medical emergency requiring rapid ALS paramedic dispatch.',
      confidence: 90,
    };
  }

  if (cat === 'disaster') {
    return {
      severity: 'critical',
      priority: 'P1',
      urgency: 'immediate',
      people_at_risk: 5,
      hazards: ['Structural instability', 'Environmental hazard', 'Disrupted access'],
      response_domains: ['disaster', 'fire', 'medical', 'police'],
      recommended_resource_types: ['rescue_unit', 'fire_truck', 'ambulance', 'police_unit'],
      summary: 'Disaster event requiring coordinated search and rescue, evacuation support, and emergency medical triage.',
      confidence: 95,
    };
  }

  // Default fallback
  const domainMap: Record<string, string[]> = {
    crime: ['police'],
    fire: ['fire'],
    accident: ['accident', 'police'],
    medical: ['medical'],
    disaster: ['disaster'],
    other: ['police', 'medical'],
  };

  return {
    severity: 'high',
    priority: 'P2',
    urgency: 'urgent',
    people_at_risk: 1,
    hazards: ['Potential escalating situation'],
    response_domains: domainMap[cat] ?? ['police'],
    recommended_resource_types: ['police_unit'],
    summary: `${cat.toUpperCase()} emergency reported. Dispatching first responders for assessment.`,
    confidence: 85,
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: AnalyzeRequest = await req.json();
    const { category, description, latitude, longitude } = body;

    const apiKey = Deno.env.get('FEATHERLESS_API_KEY');
    const model = Deno.env.get('FEATHERLESS_MODEL') || 'meta-llama/Meta-Llama-3.1-8B-Instruct';

    if (!apiKey) {
      console.warn('[analyze-incident] FEATHERLESS_API_KEY is not configured in Edge Function; returning deterministic fallback');
      const fallback = getDeterministicFallback(category, description);
      return new Response(JSON.stringify({
        ...fallback,
        source: 'deterministic_fallback',
        modelUsed: 'rule_engine',
        httpStatus: 0,
        apiReachable: false,
        reason: 'FEATHERLESS_API_KEY not configured in environment',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const promptUserContent = `Incident Category: ${category}
Citizen Description: ${description || 'No detailed text provided.'}
Location Coordinates: ${latitude ?? 40.7128}, ${longitude ?? -74.0060}`;

    console.log(`[analyze-incident] Dispatching live request to Featherless.ai (${model})...`);

    const featherlessRes = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptUserContent },
        ],
        temperature: 0.1,
        max_tokens: 450,
      }),
    });

    console.log(`[analyze-incident] Featherless.ai response status: ${featherlessRes.status} ${featherlessRes.statusText}`);

    if (!featherlessRes.ok) {
      const errText = await featherlessRes.text();
      console.error('[analyze-incident] Featherless API error:', featherlessRes.status, errText);
      const fallback = getDeterministicFallback(category, description);
      return new Response(JSON.stringify({
        ...fallback,
        source: 'deterministic_fallback',
        modelUsed: model,
        httpStatus: featherlessRes.status,
        apiReachable: true,
        reason: `Featherless HTTP error: ${featherlessRes.status}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const featherlessData = await featherlessRes.json();
    const rawContent = featherlessData.choices?.[0]?.message?.content || '';

    // Strip code fences and markdown
    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      const parsed: AIResult = JSON.parse(cleaned);
      parsed.confidence = 95;
      return new Response(JSON.stringify({
        ...parsed,
        source: 'featherless_live',
        modelUsed: model,
        httpStatus: featherlessRes.status,
        apiReachable: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseErr) {
      console.error('[analyze-incident] JSON parse error from Featherless output:', parseErr, cleaned);
      const fallback = getDeterministicFallback(category, description);
      return new Response(JSON.stringify({
        ...fallback,
        source: 'deterministic_fallback',
        modelUsed: model,
        httpStatus: featherlessRes.status,
        apiReachable: true,
        reason: 'Failed to parse JSON response from Featherless model',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Edge Function handler error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
