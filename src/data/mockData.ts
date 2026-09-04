import type { Resource, Hospital, Incident, Notification, AIAlert, AppUser } from '../types';

export const DEMO_USERS: AppUser[] = [
  { id: 'u1', role: 'citizen', name: 'Alex Rivera', avatar: '👤' },
  { id: 'u2', role: 'fire', name: 'Chief Morgan Cole', avatar: '🔥', domain: 'fire' },
  { id: 'u3', role: 'medical', name: 'Dr. Sarah Kim', avatar: '🚑', domain: 'medical' },
  { id: 'u4', role: 'police', name: 'Capt. James Torres', avatar: '👮', domain: 'police' },
  { id: 'u5', role: 'accident', name: 'Sgt. Dana Reyes', avatar: '🚗', domain: 'accident' },
  { id: 'u6', role: 'disaster', name: 'Dir. Pat Nguyen', avatar: '🌪️', domain: 'disaster' },
  { id: 'u7', role: 'command', name: 'Commander Walsh', avatar: '🧑‍💼' },
];

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'amb-a01', name: 'Ambulance A01', type: 'ambulance', status: 'available',
    location: { x: 28, y: 38, label: 'Westside Station' },
    baseLocation: { x: 28, y: 38, label: 'Westside Station' },
    capability: ['ALS', 'Trauma', 'Cardiac'], matchScore: 96, distance: 1.2,
  },
  {
    id: 'amb-a02', name: 'Ambulance A02', type: 'ambulance', status: 'available',
    location: { x: 62, y: 28, label: 'Northpark Station' },
    baseLocation: { x: 62, y: 28, label: 'Northpark Station' },
    capability: ['ALS', 'Pediatric'], matchScore: 88, distance: 2.1,
  },
  {
    id: 'amb-a03', name: 'Ambulance A03', type: 'ambulance', status: 'arrived',
    location: { x: 44, y: 73, label: 'On Scene — 219 Maple Ave' },
    baseLocation: { x: 45, y: 72, label: 'Southgate Station' },
    capability: ['BLS', 'Transport'], assignedIncidentId: 'inc-1040',
  },
  {
    id: 'amb-a04', name: 'Ambulance A04', type: 'ambulance', status: 'available',
    location: { x: 80, y: 55, label: 'Eastside Station' },
    baseLocation: { x: 80, y: 55, label: 'Eastside Station' },
    capability: ['ALS', 'Trauma'], matchScore: 82, distance: 3.4,
  },
  {
    id: 'fire-f01', name: 'Engine F01', type: 'fire_truck', status: 'available',
    location: { x: 18, y: 28, label: 'Station 1' },
    baseLocation: { x: 18, y: 28, label: 'Station 1' },
    capability: ['Suppression', 'Rescue', 'Hazmat'],
  },
  {
    id: 'fire-f02', name: 'Ladder F02', type: 'fire_truck', status: 'en_route',
    location: { x: 72, y: 62, label: 'En Route' },
    baseLocation: { x: 78, y: 68, label: 'Station 2' },
    capability: ['Suppression', 'High-Rise'], eta: 2, assignedIncidentId: 'inc-1039',
  },
  {
    id: 'fire-f03', name: 'Engine F03', type: 'fire_truck', status: 'available',
    location: { x: 50, y: 22, label: 'Central Station' },
    baseLocation: { x: 50, y: 22, label: 'Central Station' },
    capability: ['Suppression', 'Technical Rescue'],
  },
  {
    id: 'pol-p01', name: 'Unit P01', type: 'police', status: 'available',
    location: { x: 32, y: 52, label: 'West Precinct' },
    baseLocation: { x: 32, y: 52, label: 'West Precinct' },
    capability: ['Patrol', 'Traffic', 'Emergency Response'],
  },
  {
    id: 'pol-p02', name: 'Unit P02', type: 'police', status: 'available',
    location: { x: 58, y: 48, label: 'Central Precinct' },
    baseLocation: { x: 58, y: 48, label: 'Central Precinct' },
    capability: ['Patrol', 'Investigation'],
  },
  {
    id: 'pol-p03', name: 'Unit P03', type: 'police', status: 'en_route',
    location: { x: 48, y: 76, label: 'En Route' },
    baseLocation: { x: 45, y: 78, label: 'South Precinct' },
    capability: ['Patrol', 'Traffic'], eta: 1, assignedIncidentId: 'inc-1039',
  },
  {
    id: 'pol-p04', name: 'Unit P14', type: 'police', status: 'available',
    location: { x: 78, y: 32, label: 'East Precinct' },
    baseLocation: { x: 78, y: 32, label: 'East Precinct' },
    capability: ['Patrol', 'K9', 'Tactical'],
  },
  {
    id: 'res-r01', name: 'Rescue R01', type: 'rescue', status: 'available',
    location: { x: 38, y: 35, label: 'Rescue Depot' },
    baseLocation: { x: 38, y: 35, label: 'Rescue Depot' },
    capability: ['Technical Rescue', 'Water', 'Confined Space'],
  },
  {
    id: 'res-r02', name: 'Rescue R02', type: 'rescue', status: 'available',
    location: { x: 68, y: 62, label: 'East Rescue Station' },
    baseLocation: { x: 68, y: 62, label: 'East Rescue Station' },
    capability: ['Technical Rescue', 'Hazmat', 'USAR'],
  },
];

export const HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1', name: 'City General Hospital',
    location: { x: 68, y: 32, label: 'City General Hospital' },
    capacity: 'HIGH', distance: 2.4, eta: 7, incomingPatients: 2,
  },
  {
    id: 'hosp-2', name: 'Westside Medical Center',
    location: { x: 22, y: 62, label: 'Westside Medical Center' },
    capacity: 'MEDIUM', distance: 3.1, eta: 9, incomingPatients: 1,
  },
  {
    id: 'hosp-3', name: 'Northpark Regional',
    location: { x: 52, y: 12, label: 'Northpark Regional' },
    capacity: 'LOW', distance: 4.8, eta: 12, incomingPatients: 4,
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1039',
    incidentNumber: '#INC-1039',
    category: 'fire',
    status: 'en_route',
    priority: 'P2',
    severity: 'HIGH',
    location: { x: 76, y: 68, label: '842 Industrial Blvd — Warehouse District' },
    reports: [
      {
        id: 'rep-a', citizenId: 'cit-1', citizenName: 'Jordan M.',
        category: 'fire', description: 'Large warehouse fire, smoke visible from several blocks. No one appears trapped.',
        location: { x: 76, y: 68, label: '842 Industrial Blvd' },
        timestamp: minsAgo(14), hasImage: true, hasVoice: false,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
      },
      {
        id: 'rep-b', citizenId: 'cit-2', citizenName: 'Casey T.',
        category: 'fire', description: 'Building on fire, lots of smoke. Fire spreading to adjacent structure.',
        location: { x: 76, y: 68, label: '840 Industrial Blvd' },
        timestamp: minsAgo(12), hasImage: false, hasVoice: true, voiceDuration: 18,
      },
    ],
    aiAnalysis: {
      severity: 'HIGH', priority: 'P2', peopleAtRisk: 0,
      injuries: 'No injuries reported. Risk of structural collapse.',
      hazards: ['Fire spread', 'Structural instability', 'Smoke inhalation', 'Chemical exposure'],
      urgency: 'Respond within 5 minutes — active spread',
      requiredResources: ['2× Fire Truck', '1× Ambulance (precautionary)', '1× Police Unit'],
      requiredDomains: ['fire', 'medical', 'police'],
      confidence: 91,
      recommendedResourceIds: ['fire-f02', 'fire-f03', 'amb-a04', 'pol-p04'],
    },
    assignedResourceIds: ['fire-f02', 'pol-p03'],
    affectedDomains: ['fire', 'medical', 'police'],
    timeline: [
      { id: 't1', timestamp: minsAgo(14), event: 'Emergency report submitted by Jordan M.', type: 'citizen' },
      { id: 't2', timestamp: minsAgo(13), event: '2nd report from Casey T. — fused into single incident', type: 'system' },
      { id: 't3', timestamp: minsAgo(12), event: 'AI context analysis complete — P2 HIGH severity', type: 'ai' },
      { id: 't4', timestamp: minsAgo(11), event: 'Fire Manager and Police Manager notified', type: 'system' },
      { id: 't5', timestamp: minsAgo(10), event: 'Resources approved by Chief Morgan Cole', type: 'manager' },
      { id: 't6', timestamp: minsAgo(9), event: 'Engine F02 and Unit P03 dispatched', type: 'system' },
      { id: 't7', timestamp: minsAgo(8), event: 'Resources en route to incident', type: 'system' },
    ],
    createdAt: minsAgo(14), updatedAt: minsAgo(8), etaMinutes: 2,
    approvedBy: 'Chief Morgan Cole', approvedAt: minsAgo(10),
  },
  {
    id: 'inc-1040',
    incidentNumber: '#INC-1040',
    category: 'medical',
    status: 'arrived',
    priority: 'P3',
    severity: 'MODERATE',
    location: { x: 44, y: 73, label: '219 Maple Ave — Riverside' },
    reports: [
      {
        id: 'rep-c', citizenId: 'cit-3', citizenName: 'Sam L.',
        category: 'medical', description: 'Elderly person collapsed, unresponsive but breathing.',
        location: { x: 44, y: 73, label: '219 Maple Ave' },
        timestamp: minsAgo(25), hasImage: false, hasVoice: true, voiceDuration: 32,
      },
    ],
    aiAnalysis: {
      severity: 'MODERATE', priority: 'P3', peopleAtRisk: 1,
      injuries: 'Possible cardiac event or stroke. Patient is breathing.',
      hazards: ['Medical emergency', 'Delayed response risk'],
      urgency: 'Respond within 8 minutes',
      requiredResources: ['1× Ambulance (ALS)'],
      requiredDomains: ['medical'],
      confidence: 87,
      recommendedResourceIds: ['amb-a03'],
    },
    assignedResourceIds: ['amb-a03'],
    affectedDomains: ['medical'],
    timeline: [
      { id: 't1', timestamp: minsAgo(25), event: 'Emergency report submitted by Sam L.', type: 'citizen' },
      { id: 't2', timestamp: minsAgo(24), event: 'AI analysis complete — P3 MODERATE', type: 'ai' },
      { id: 't3', timestamp: minsAgo(23), event: 'Medical Manager notified', type: 'system' },
      { id: 't4', timestamp: minsAgo(22), event: 'Ambulance A03 approved by Dr. Sarah Kim', type: 'manager' },
      { id: 't5', timestamp: minsAgo(20), event: 'Ambulance A03 dispatched', type: 'system' },
      { id: 't6', timestamp: minsAgo(15), event: 'Ambulance A03 arrived on scene', type: 'responder' },
    ],
    createdAt: minsAgo(25), updatedAt: minsAgo(15), etaMinutes: 0,
    approvedBy: 'Dr. Sarah Kim', approvedAt: minsAgo(22),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1', targetRole: 'fire', incidentId: 'inc-1039',
    title: '🔥 P2 Fire Incident Active', message: 'Engine F02 en route. ETA 2 min. Ladder support may be required.',
    priority: 'P2', timestamp: minsAgo(8), read: false, type: 'alert',
  },
  {
    id: 'notif-2', targetRole: 'medical', incidentId: 'inc-1040',
    title: '✓ Patient Care Underway', message: 'Ambulance A03 on scene at 219 Maple Ave.',
    priority: 'P3', timestamp: minsAgo(15), read: true, type: 'success',
  },
  {
    id: 'notif-3', targetRole: 'command',
    title: '⚠ 2 Reports Merged — INC-1039', message: '2 citizen reports fused into single fire incident at Industrial Blvd.',
    priority: 'P2', timestamp: minsAgo(13), read: false, type: 'info',
  },
];

export const INITIAL_AI_ALERTS: AIAlert[] = [
  {
    id: 'alert-1', message: '2 duplicate reports merged into Incident #INC-1039',
    type: 'fusion', timestamp: minsAgo(13), incidentId: 'inc-1039',
  },
  {
    id: 'alert-2', message: 'Engine F02 en route — ETA 2 minutes to INC-1039',
    type: 'dispatch', timestamp: minsAgo(8), incidentId: 'inc-1039',
  },
  {
    id: 'alert-3', message: 'Ambulance A03 arrived on scene at INC-1040',
    type: 'dispatch', timestamp: minsAgo(15), incidentId: 'inc-1040',
  },
];
