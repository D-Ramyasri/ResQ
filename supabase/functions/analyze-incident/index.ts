const FEATHERLESS_URL = 'https://api.featherless.ai/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V3.2';
const ALLOWED_CATEGORIES = ['fire', 'medical', 'accident', 'crime', 'disaster', 'other'] as const;
const ALLOWED_SEVERITIES = ['critical', 'high', 'moderate', 'low'] as const;
const ALLOWED_PRIORITIES = ['P1', 'P2', 'P3', 'P4'] as const;
const ALLOWED_URGENCIES = ['immediate', 'urgent', 'soon', 'routine'] as const;
const ALLOWED_DOMAINS = ['police', 'medical', 'fire', 'rescue'] as const;
const ALLOWED_RESOURCE_TYPES = ['police_unit', 'ambulance', 'fire_truck', 'rescue_team'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const SYSTEM_PROMPT = `You are ResQ's emergency context analysis engine. Analyze operational context only; do not reclassify or change the user's selected category.

Return ONLY valid JSON matching this exact shape:
{
  "severity": "critical|high|moderate|low",
  "priority": "P1|P2|P3|P4",
  "urgency": "immediate|urgent|soon|routine",
  "people_at_risk": 0,
  "hazards": [],
  "response_domains": [],
  "recommended_resource_types": [],
  "summary": "",
  "responder_guidance": { "police": [], "medical": [], "fire": [], "rescue": [] }
}

Use only these response domains: police, medical, fire, rescue. Use only these resource types: police_unit, ambulance, fire_truck, rescue_team. Keep hazards and guidance concise. Include only domains and guidance relevant to this incident. Guidance must be safe, non-tactical pre-arrival preparation and must not replace professional emergency protocols.`;

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === 'string' && allowed.includes(value);
}

function validateAnalysis(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('AI response was not an object');
  const candidate = value as Record<string, unknown>;
  if (!isOneOf(candidate.severity, ALLOWED_SEVERITIES)) throw new Error('Invalid severity');
  if (!isOneOf(candidate.priority, ALLOWED_PRIORITIES)) throw new Error('Invalid priority');
  if (!isOneOf(candidate.urgency, ALLOWED_URGENCIES)) throw new Error('Invalid urgency');
  if (!Number.isInteger(candidate.people_at_risk) || (candidate.people_at_risk as number) < 0) throw new Error('Invalid people_at_risk');
  if (!Array.isArray(candidate.hazards) || candidate.hazards.some(item => typeof item !== 'string')) throw new Error('Invalid hazards');
  if (!Array.isArray(candidate.response_domains) || candidate.response_domains.some(item => !isOneOf(item, ALLOWED_DOMAINS))) throw new Error('Invalid response_domains');
  if (!Array.isArray(candidate.recommended_resource_types) || candidate.recommended_resource_types.some(item => !isOneOf(item, ALLOWED_RESOURCE_TYPES))) throw new Error('Invalid recommended_resource_types');
  if (typeof candidate.summary !== 'string') throw new Error('Invalid summary');
  if (!candidate.responder_guidance || typeof candidate.responder_guidance !== 'object') throw new Error('Invalid responder_guidance');

  const guidance = candidate.responder_guidance as Record<string, unknown>;
  for (const domain of ['police', 'medical', 'fire', 'rescue']) {
    if (guidance[domain] !== undefined && (!Array.isArray(guidance[domain]) || (guidance[domain] as unknown[]).some(item => typeof item !== 'string'))) {
      throw new Error(`Invalid ${domain} guidance`);
    }
  }

  return {
    severity: candidate.severity,
    priority: candidate.priority,
    urgency: candidate.urgency,
    people_at_risk: candidate.people_at_risk,
    hazards: candidate.hazards,
    response_domains: candidate.response_domains,
    recommended_resource_types: candidate.recommended_resource_types,
    summary: candidate.summary,
    responder_guidance: guidance,
  };
}

function parseModelJson(content: unknown) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('Featherless returned an empty response');
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return validateAnalysis(JSON.parse(cleaned));
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('FEATHERLESS_API_KEY');
  if (!apiKey) return json({ error: 'Featherless authentication failed: server key is not configured' }, 503);

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON' }, 400);
  }

  const category = typeof input.category === 'string' ? input.category.toLowerCase() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (!isOneOf(category, ALLOWED_CATEGORIES) || !description) return json({ error: 'category and description are required' }, 400);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(FEATHERLESS_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({
            category,
            description,
            location: input.location ?? null,
            eta_minutes: input.etaMinutes ?? null,
          }) },
        ],
      }),
    });

    if (response.status === 401) return json({ error: 'Featherless authentication failed' }, 502);
    if (response.status === 403) return json({ error: 'Featherless access was forbidden' }, 502);
    if (response.status === 429) return json({ error: 'Featherless rate limit reached' }, 503);
    if (response.status >= 500) return json({ error: `Featherless service failure (${response.status})` }, 503);
    if (!response.ok) return json({ error: `Featherless request failed (${response.status})` }, 502);

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    return json({ model: MODEL, analysis: parseModelJson(content) });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return json({ error: 'Featherless request timed out' }, 504);
    if (error instanceof SyntaxError) return json({ error: 'Featherless returned invalid JSON' }, 502);
    return json({ error: error instanceof Error ? error.message : 'Featherless request failed' }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
