export type Role = 'citizen' | 'fire' | 'medical' | 'police' | 'accident' | 'disaster' | 'command';
export type Domain = 'fire' | 'medical' | 'police' | 'accident' | 'disaster';
export type IncidentCategory = 'fire' | 'medical' | 'accident' | 'crime' | 'disaster' | 'other';
export type IncidentStatus =
  | 'submitted' | 'ai_processing' | 'created' | 'notified'
  | 'awaiting_approval' | 'assigned' | 'dispatched' | 'en_route'
  | 'arriving' | 'arrived' | 'handling' | 'resolved';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Severity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type ResourceType = 'ambulance' | 'fire_truck' | 'police' | 'rescue';
export type ResourceStatus = 'available' | 'assigned' | 'en_route' | 'arrived' | 'busy' | 'offline';

export interface MapCoord {
  x: number;
  y: number;
  label: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  isLiveGps?: boolean;
  confirmed?: boolean;
  timestamp?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location: MapCoord;
  baseLocation: MapCoord;
  eta?: number;
  assignedIncidentId?: string;
  capability: string[];
  distance?: number;
  matchScore?: number;
}

export interface CitizenReport {
  id: string;
  citizenId: string;
  citizenName: string;
  category: IncidentCategory;
  description: string;
  location: MapCoord;
  timestamp: Date;
  hasImage: boolean;
  hasVoice: boolean;
  voiceDuration?: number;
  imageUrl?: string;
}

export interface AIAnalysis {
  severity: Severity;
  priority: Priority;
  peopleAtRisk: number;
  injuries: string;
  hazards: string[];
  urgency: string;
  requiredResources: string[];
  requiredDomains: Domain[];
  confidence: number;
  recommendedResourceIds: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  event: string;
  type: 'system' | 'ai' | 'manager' | 'responder' | 'citizen';
}

export interface Incident {
  id: string;
  incidentNumber: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: Priority;
  severity: Severity;
  location: MapCoord;
  reports: CitizenReport[];
  aiAnalysis?: AIAnalysis;
  assignedResourceIds: string[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  affectedDomains: Domain[];
  etaMinutes?: number;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface Hospital {
  id: string;
  name: string;
  location: MapCoord;
  capacity: 'HIGH' | 'MEDIUM' | 'LOW';
  distance: number;
  eta: number;
  incomingPatients: number;
}

export interface Notification {
  id: string;
  targetRole: Role | 'all';
  incidentId?: string;
  title: string;
  message: string;
  priority: Priority;
  timestamp: Date;
  read: boolean;
  type: 'alert' | 'info' | 'success' | 'warning';
}

export interface AppUser {
  id: string;
  role: Role;
  name: string;
  domain?: Domain;
  avatar: string;
}

export interface AIAlert {
  id: string;
  message: string;
  type: 'escalation' | 'fusion' | 'shortage' | 'dispatch' | 'traffic' | 'resolved';
  timestamp: Date;
  incidentId?: string;
}

export interface ReportDraft {
  category: IncidentCategory | null;
  location: MapCoord | null;
  locationConfirmed?: boolean;
  description: string;
  hasImage: boolean;
  hasVoice: boolean;
  voiceDuration: number;
  imageUrl: string;
}
