import type {
  Incident,
  Resource,
  ResourceStatus,
  ResourceType,
} from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface BackendIncident {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
  created_at: string;
}

interface BackendResource {
  id: number;
  name: string;
  resource_type: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface BackendAssignment {
  message: string;
  assignment_id: number;
  incident_id: number;
  resource_id: number;
  incident_status: string;
  resource_status: string;
}


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function mapResourceType(type: string): ResourceType {
  if (
    type === 'ambulance' ||
    type === 'fire_truck' ||
    type === 'police' ||
    type === 'rescue'
  ) {
    return type;
  }

  return 'rescue';
}


function mapResourceStatus(status: string): ResourceStatus {
  if (
    status === 'available' ||
    status === 'assigned' ||
    status === 'en_route' ||
    status === 'arrived' ||
    status === 'busy' ||
    status === 'offline'
  ) {
    return status;
  }

  return 'available';
}


// --------------------------------------------------
// Resources
// --------------------------------------------------

export async function fetchResources(): Promise<Resource[]> {
  const response = await fetch(`${API_BASE_URL}/resources`);

  if (!response.ok) {
    throw new Error('Failed to fetch resources');
  }

  const data: BackendResource[] = await response.json();

  return data.map(resource => ({
    id: String(resource.id),
    name: resource.name,
    type: mapResourceType(resource.resource_type),
    status: mapResourceStatus(resource.status),
    location: {
      x: resource.longitude,
      y: resource.latitude,
      lat: resource.latitude,
      lng: resource.longitude,
      label: `${resource.latitude}, ${resource.longitude}`,
    },
    baseLocation: {
      x: resource.longitude,
      y: resource.latitude,
      lat: resource.latitude,
      lng: resource.longitude,
      label: `${resource.latitude}, ${resource.longitude}`,
    },
    capability: [],
  }));
}


// --------------------------------------------------
// Incidents
// --------------------------------------------------

export async function fetchIncidents(): Promise<BackendIncident[]> {
  const response = await fetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }

  return response.json();
}


// --------------------------------------------------
// Create Incident
// --------------------------------------------------

export async function createBackendIncident(
  description: string,
  latitude: number,
  longitude: number,
  priority: string
): Promise<BackendIncident> {

  const params = new URLSearchParams({
    description,
    latitude: String(latitude),
    longitude: String(longitude),
    priority,
  });

  const response = await fetch(
    `${API_BASE_URL}/incidents?${params.toString()}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create incident');
  }

  return response.json();
}


// --------------------------------------------------
// Assign Resource
// --------------------------------------------------

export async function assignBackendResource(
  incidentId: string,
  resourceId: string
): Promise<BackendAssignment> {

  const params = new URLSearchParams({
    incident_id: incidentId,
    resource_id: resourceId,
  });

  const response = await fetch(
    `${API_BASE_URL}/assign?${params.toString()}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to assign resource');
  }

  return response.json();
}


// --------------------------------------------------
// Update Incident Status
// --------------------------------------------------

export async function updateBackendIncidentStatus(
  incidentId: string,
  status: string
): Promise<BackendIncident> {

  const params = new URLSearchParams({
    status,
  });

  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/status?${params.toString()}`,
    {
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update incident status');
  }

  return response.json();
}


// --------------------------------------------------
// Update Resource Status
// --------------------------------------------------

export async function updateBackendResourceStatus(
  resourceId: string,
  status: string
): Promise<BackendResource> {

  const params = new URLSearchParams({
    status,
  });

  const response = await fetch(
    `${API_BASE_URL}/resources/${resourceId}/status?${params.toString()}`,
    {
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update resource status');
  }

  return response.json();
}