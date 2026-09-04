import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Incident, Resource, AIAnalysis, Domain } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface DBIncidentRow {
  id: string;
  incident_number: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: string;
  priority: string;
  urgency: string;
  people_at_risk: number;
  hazards: string[];
  response_domains: string[];
  recommended_resource_types: string[];
  ai_summary: string;
  ai_analysis: any;
  status: string;
  reports_count: number;
  assigned_resource_ids: string[];
  eta_minutes?: number;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export function mapDBRowToIncident(row: DBIncidentRow): Incident {
  return {
    id: row.id,
    incidentNumber: row.incident_number || `#INC-${row.id.slice(0, 4)}`,
    category: row.category as any,
    status: row.status as any,
    priority: (row.priority || 'P2') as any,
    severity: (row.severity || 'HIGH').toUpperCase() as any,
    location: {
      x: 52,
      y: 47,
      label: row.address || `${row.category.toUpperCase()} at (${row.latitude.toFixed(4)}°, ${row.longitude.toFixed(4)}°)`,
      lat: row.latitude,
      lng: row.longitude,
      accuracy: 6,
      isLiveGps: true,
      confirmed: true,
    },
    reports: [
      {
        id: `rep-${row.id}`,
        citizenId: 'cit-current',
        citizenName: 'Alex Rivera',
        category: row.category as any,
        description: row.description,
        location: {
          x: 52,
          y: 47,
          label: row.address || 'Emergency Location',
          lat: row.latitude,
          lng: row.longitude,
        },
        timestamp: new Date(row.created_at),
        hasImage: false,
        hasVoice: false,
      },
    ],
    aiAnalysis: (row.ai_analysis && Object.keys(row.ai_analysis).length > 0) || row.ai_summary ? {
      severity: (row.severity || 'HIGH').toUpperCase() as any,
      priority: (row.priority || 'P2') as any,
      peopleAtRisk: row.people_at_risk ?? 1,
      injuries: row.ai_summary || row.ai_analysis?.injuries || 'Injuries reported at scene',
      hazards: row.hazards || [],
      urgency: row.urgency || 'Immediate response required',
      requiredResources: row.recommended_resource_types || [],
      requiredDomains: (row.response_domains || ['police']) as Domain[],
      confidence: row.ai_analysis?.confidence ?? 95,
      recommendedResourceIds: row.ai_analysis?.recommendedResourceIds ?? [],
      summary: row.ai_summary || row.ai_analysis?.summary,
      responderGuidance: row.ai_analysis?.responder_guidance || row.ai_analysis?.responderGuidance,
      preArrivalGuidance: row.ai_analysis?.pre_arrival_guidance || row.ai_analysis?.preArrivalGuidance,
      source: row.ai_analysis?.source || 'featherless_live',
      modelUsed: row.ai_analysis?.modelUsed || 'deepseek-ai/DeepSeek-V3.2',
      httpStatus: row.ai_analysis?.httpStatus ?? 200,
    } : undefined,
    assignedResourceIds: row.assigned_resource_ids || [],
    timeline: [
      { id: `t1-${row.id}`, timestamp: new Date(row.created_at), event: 'Emergency report submitted', type: 'citizen' },
      { id: `t2-${row.id}`, timestamp: new Date(row.created_at), event: 'GPS location captured and verified in database', type: 'system' },
    ],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    affectedDomains: (row.response_domains && row.response_domains.length > 0)
      ? (row.response_domains.map(d => d === 'crime' ? 'police' : d) as Domain[])
      : [(row.category === 'crime' ? 'police' : row.category) as Domain],
    etaMinutes: row.eta_minutes,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
  };
}

/**
 * Inserts a new incident into Supabase immediately with status 'reported'.
 */
export async function createIncidentInSupabase(data: {
  id?: string;
  incidentNumber: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
}): Promise<string> {
  const isUUID = data.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
  const insertPayload: any = {
    incident_number: data.incidentNumber,
    category: data.category,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address || '',
    status: 'reported',
    severity: 'HIGH',
    priority: 'P2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isUUID) {
    insertPayload.id = data.id;
  }

  if (!supabase) {
    return data.id || `inc-${Date.now()}`;
  }

  try {
    const { data: inserted, error } = await supabase
      .from('incidents')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert warning (using local sync):', error.message);
      return data.id || `inc-${Date.now()}`;
    }

    return inserted?.id || data.id || `inc-${Date.now()}`;
  } catch (err) {
    console.warn('Supabase network error (fallback to local state):', err);
    return data.id || `inc-${Date.now()}`;
  }
}

/**
 * Updates an existing incident with AI analysis and response domains in Supabase.
 */
export async function updateIncidentInSupabase(
  incidentIdOrNumber: string,
  updates: Partial<DBIncidentRow>
): Promise<void> {
  if (!supabase) return;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(incidentIdOrNumber);

  try {
    let query = supabase.from('incidents').update({
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (isUUID) {
      query = query.eq('id', incidentIdOrNumber);
    } else {
      query = query.eq('incident_number', incidentIdOrNumber.startsWith('#') ? incidentIdOrNumber : `#${incidentIdOrNumber.toUpperCase()}`);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase update warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase update network error:', err);
  }
}

/**
 * Assigns a resource to an incident in Supabase.
 */
export async function assignResourceInSupabase(
  incidentIdOrNumber: string,
  resourceId: string,
  assignedBy: string = 'Dispatcher',
  etaMinutes: number = 4
): Promise<void> {
  if (!supabase) return;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(incidentIdOrNumber);

  try {
    // Look up incident by UUID or incident_number
    let fetchQuery = supabase.from('incidents').select('id, assigned_resource_ids');
    if (isUUID) {
      fetchQuery = fetchQuery.eq('id', incidentIdOrNumber);
    } else {
      fetchQuery = fetchQuery.eq('incident_number', incidentIdOrNumber.startsWith('#') ? incidentIdOrNumber : `#${incidentIdOrNumber.toUpperCase()}`);
    }

    const { data: currentInc } = await fetchQuery.single();
    const actualIncidentId = currentInc?.id || (isUUID ? incidentIdOrNumber : undefined);

    // 1. Create incident assignment row if UUID is available
    if (actualIncidentId) {
      await supabase.from('incident_assignments').insert({
        incident_id: actualIncidentId,
        resource_id: resourceId,
        assigned_by: assignedBy,
        status: 'assigned',
        eta_minutes: etaMinutes,
        assigned_at: new Date().toISOString(),
      });
    }

    // 2. Update resource status
    await supabase
      .from('resources')
      .update({
        status: 'assigned',
        assigned_incident_id: actualIncidentId || null,
      })
      .eq('resource_id', resourceId);

    // 3. Update incident status
    const currentAssigned = currentInc?.assigned_resource_ids || [];
    if (!currentAssigned.includes(resourceId)) {
      currentAssigned.push(resourceId);
    }

    let updateQuery = supabase.from('incidents').update({
      status: 'assigned',
      assigned_resource_ids: currentAssigned,
      eta_minutes: etaMinutes,
      approved_by: assignedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (isUUID) {
      updateQuery = updateQuery.eq('id', incidentIdOrNumber);
    } else {
      updateQuery = updateQuery.eq('incident_number', incidentIdOrNumber.startsWith('#') ? incidentIdOrNumber : `#${incidentIdOrNumber.toUpperCase()}`);
    }

    await updateQuery;
  } catch (err) {
    console.warn('Supabase assignment error:', err);
  }
}

/**
 * Updates assignment status (assigned -> dispatched -> en_route -> arrived -> resolved)
 */
export async function updateIncidentStatusInSupabase(
  incidentId: string,
  status: string,
  etaMinutes?: number
): Promise<void> {
  if (!supabase) return;

  try {
    await supabase
      .from('incidents')
      .update({
        status,
        ...(etaMinutes !== undefined ? { eta_minutes: etaMinutes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', incidentId);
  } catch (err) {
    console.warn('Supabase status update error:', err);
  }
}

/**
 * Fetches all incidents from Supabase.
 */
export async function fetchIncidentsFromSupabase(): Promise<Incident[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDBRowToIncident);
  } catch {
    return [];
  }
}

/**
 * Subscribes to realtime updates on the incidents table.
 */
export function subscribeToIncidents(onUpdate: (incident: Incident) => void): (() => void) | null {
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('public:incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          if (payload.new && (payload.new as any).id) {
            onUpdate(mapDBRowToIncident(payload.new as DBIncidentRow));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}
