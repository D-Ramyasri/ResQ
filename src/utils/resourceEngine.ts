import type { Resource, ResourceType } from '../types';

export interface ResourceRequirements {
  ambulance?: number;
  fire_truck?: number;
  police?: number;
  rescue?: number;
}

export interface AllocationResult {
  assignedResourceIds: string[];
  unfulfilled: ResourceRequirements;
}

function calculateMapDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}

function findNearestResources(
  incidentLocation: { x: number; y: number },
  resources: Resource[],
  type: ResourceType,
  count: number,
  alreadyAssigned: Set<string>
): Resource[] {
  return resources
    .filter(
      resource =>
        resource.status === 'available' &&
        resource.type === type &&
        !alreadyAssigned.has(resource.id)
    )
    .map(resource => ({
      resource,
      distance: calculateMapDistance(
        incidentLocation.x,
        incidentLocation.y,
        resource.location.x,
        resource.location.y
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(item => item.resource);
}

export function allocateResources(
  incidentLocation: { x: number; y: number },
  resources: Resource[],
  requirements: ResourceRequirements
): AllocationResult {
  const assignedResourceIds: string[] = [];
  const unfulfilled: ResourceRequirements = {};
  const alreadyAssigned = new Set<string>();

  const resourceTypes: ResourceType[] = [
    'ambulance',
    'fire_truck',
    'police',
    'rescue',
  ];

  for (const type of resourceTypes) {
    const requestedCount = requirements[type] ?? 0;

    if (requestedCount <= 0) {
      unfulfilled[type] = 0;
      continue;
    }

    const assigned = findNearestResources(
      incidentLocation,
      resources,
      type,
      requestedCount,
      alreadyAssigned
    );

    assigned.forEach(resource => {
      assignedResourceIds.push(resource.id);
      alreadyAssigned.add(resource.id);
    });

    unfulfilled[type] = requestedCount - assigned.length;
  }

  return {
    assignedResourceIds,
    unfulfilled,
  };
}

export function getRequirementsFromAI(
  requiredResources: string[]
): ResourceRequirements {
  const requirements: ResourceRequirements = {
    ambulance: 0,
    fire_truck: 0,
    police: 0,
    rescue: 0,
  };

  requiredResources.forEach(resource => {
    const match = resource.match(/^(\d+)\s*[×x]\s*(.+)$/i);

    const count = match ? Number(match[1]) : 1;
    const name = (match ? match[2] : resource).toLowerCase();

    if (name.includes('ambulance')) {
      requirements.ambulance! += count;
    } else if (name.includes('fire truck')) {
      requirements.fire_truck! += count;
    } else if (name.includes('police')) {
      requirements.police! += count;
    } else if (name.includes('rescue')) {
      requirements.rescue! += count;
    }
  });

  return requirements;
}