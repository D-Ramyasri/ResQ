import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  AppUser, Incident, Resource, Hospital, Notification, AIAlert,
  IncidentCategory, IncidentStatus, MapCoord, ReportDraft, Domain,
} from '../types';
import {
  DEMO_USERS, INITIAL_INCIDENTS, INITIAL_RESOURCES, HOSPITALS,
  INITIAL_NOTIFICATIONS, INITIAL_AI_ALERTS,
} from '../data/mockData';

export type View =
  | 'login' | 'citizen_dashboard' | 'citizen_report' | 'citizen_processing'
  | 'citizen_active' | 'responder_dashboard' | 'responder_incident'
  | 'command_center';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface AppState {
  theme: 'dark' | 'light';
  currentUser: AppUser | null;
  currentView: View;
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
  notifications: Notification[];
  aiAlerts: AIAlert[];
  selectedIncidentId: string | null;
  reportDraft: ReportDraft;
  processingStage: number;
  processingIncidentId: string | null;
  citizenActiveIncidentId: string | null;
  toasts: Toast[];
  fusionDemoActive: boolean;
  fusionDemoStep: number;
  reallocationDemoActive: boolean;
  reallocationDemoStep: number;
  reallocationIncidentId: string | null;
}

type Action =
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_USER'; payload: AppUser | null }
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SELECT_INCIDENT'; payload: string | null }
  | { type: 'UPDATE_REPORT_DRAFT'; payload: Partial<ReportDraft> }
  | { type: 'SET_PROCESSING_STAGE'; payload: number }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: { id: string; changes: Partial<Incident> } }
  | { type: 'UPDATE_RESOURCE'; payload: { id: string; changes: Partial<Resource> } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_AI_ALERT'; payload: AIAlert }
  | { type: 'APPROVE_INCIDENT'; payload: { incidentId: string; approvedBy: string } }
  | { type: 'SET_CITIZEN_INCIDENT'; payload: string | null }
  | { type: 'SET_PROCESSING_INCIDENT'; payload: string | null }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_FUSION_DEMO'; payload: { active: boolean; step: number } }
  | { type: 'SET_REALLOCATION_DEMO'; payload: { active: boolean; step: number; incidentId: string | null } }
  | { type: 'RESET_STATE' };

const BLANK_DRAFT: ReportDraft = {
  category: null, location: null, description: '',
  hasImage: false, hasVoice: false, voiceDuration: 0, imageUrl: '',
};

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('resq_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'dark';
};

const initialState: AppState = {
  theme: getInitialTheme(),
  currentUser: null,
  currentView: 'login',
  incidents: INITIAL_INCIDENTS,
  resources: INITIAL_RESOURCES,
  hospitals: HOSPITALS,
  notifications: INITIAL_NOTIFICATIONS,
  aiAlerts: INITIAL_AI_ALERTS,
  selectedIncidentId: null,
  reportDraft: BLANK_DRAFT,
  processingStage: 0,
  processingIncidentId: null,
  citizenActiveIncidentId: null,
  toasts: [],
  fusionDemoActive: false,
  fusionDemoStep: 0,
  reallocationDemoActive: false,
  reallocationDemoStep: 0,
  reallocationIncidentId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_USER': return { ...state, currentUser: action.payload };
    case 'SET_VIEW': return { ...state, currentView: action.payload };
    case 'SELECT_INCIDENT': return { ...state, selectedIncidentId: action.payload };
    case 'UPDATE_REPORT_DRAFT': return { ...state, reportDraft: { ...state.reportDraft, ...action.payload } };
    case 'SET_PROCESSING_STAGE': return { ...state, processingStage: action.payload };
    case 'ADD_INCIDENT': return { ...state, incidents: [...state.incidents, action.payload] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(inc =>
          inc.id === action.payload.id
            ? { ...inc, ...action.payload.changes, updatedAt: new Date() }
            : inc
        ),
      };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload.changes } : r
        ),
      };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'ADD_AI_ALERT': return { ...state, aiAlerts: [action.payload, ...state.aiAlerts] };
    case 'APPROVE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(inc =>
          inc.id === action.payload.incidentId
            ? {
                ...inc, status: 'assigned' as IncidentStatus,
                approvedBy: action.payload.approvedBy,
                approvedAt: new Date(), updatedAt: new Date(),
                timeline: [...inc.timeline, {
                  id: `t${Date.now()}`, timestamp: new Date(),
                  event: `Resources approved by ${action.payload.approvedBy}`, type: 'manager' as const,
                }],
              }
            : inc
        ),
      };
    case 'SET_CITIZEN_INCIDENT': return { ...state, citizenActiveIncidentId: action.payload };
    case 'SET_PROCESSING_INCIDENT': return { ...state, processingIncidentId: action.payload };
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'SET_FUSION_DEMO':
      return { ...state, fusionDemoActive: action.payload.active, fusionDemoStep: action.payload.step };
    case 'SET_REALLOCATION_DEMO':
      return {
        ...state,
        reallocationDemoActive: action.payload.active,
        reallocationDemoStep: action.payload.step,
        reallocationIncidentId: action.payload.incidentId,
      };
    case 'RESET_STATE':
      return { ...initialState, currentUser: state.currentUser, currentView: state.currentView };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  login: (user: AppUser) => void;
  logout: () => void;
  submitReport: () => void;
  approveIncident: (incidentId: string) => void;
  getMyNotifications: () => Notification[];
  getMyIncidents: () => Incident[];
  triggerDemoScenario: (scenario: 'crime_medical' | 'accident') => void;
  triggerFusionDemo: () => void;
  triggerReallocationDemo: () => void;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let incidentCounter = 1042;
function makeIncId() { return `inc-${++incidentCounter}`; }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(state.theme);
    try {
      localStorage.setItem('resq_theme', state.theme);
    } catch {}
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'], duration = 4000) => {
    const id = `toast-${Date.now()}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type, duration } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  const login = useCallback((user: AppUser) => {
    dispatch({ type: 'SET_USER', payload: user });
    const view: View = user.role === 'citizen'
      ? 'citizen_dashboard'
      : user.role === 'command'
        ? 'command_center'
        : 'responder_dashboard';
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'login' });
    dispatch({ type: 'SET_CITIZEN_INCIDENT', payload: null });
    dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: BLANK_DRAFT });
  }, []);

  const getMyNotifications = useCallback(() => {
    const role = state.currentUser?.role;
    if (!role) return [];
    return state.notifications.filter(n => n.targetRole === role || n.targetRole === 'all');
  }, [state.notifications, state.currentUser]);

  const getMyIncidents = useCallback(() => {
    const domain = state.currentUser?.domain;
    const role = state.currentUser?.role;
    if (role === 'command') return state.incidents;
    if (!domain) return [];
    return state.incidents.filter(inc => inc.affectedDomains.includes(domain));
  }, [state.incidents, state.currentUser]);

  const submitReport = useCallback(() => {
    const draft = state.reportDraft;
    if (!draft.category || !state.currentUser) return;

    const incidentId = makeIncId();
    const incidentNumber = `#INC-${incidentCounter}`;
    const location: MapCoord = draft.location ?? { x: 52, y: 47, label: 'Central Park Ave & 5th St — Downtown' };
    const category = draft.category;

    const domainMap: Record<string, Domain[]> = {
      crime: ['police', 'medical'],
      fire: ['fire', 'medical', 'police'],
      medical: ['medical'],
      accident: ['accident', 'medical', 'fire', 'police'],
      disaster: ['disaster', 'medical', 'police', 'fire'],
      other: ['police', 'medical'],
    };
    const affectedDomains: Domain[] = domainMap[category] ?? ['police'];

    const priorityMap: Record<string, 'P1' | 'P2'> = {
      crime: 'P1', fire: 'P1', accident: 'P1', disaster: 'P1', medical: 'P2', other: 'P2',
    };

    const recommendedByDomain: Record<Domain, string[]> = {
      police: ['pol-p04', 'pol-p01'],
      medical: ['amb-a01', 'amb-a02'],
      fire: ['fire-f01', 'fire-f03'],
      accident: ['pol-p02', 'res-r01', 'amb-a02'],
      disaster: ['res-r01', 'res-r02', 'fire-f01'],
    };
    const recommendedIds = Array.from(
      new Set(affectedDomains.flatMap(d => recommendedByDomain[d] ?? []))
    ).slice(0, 3);

    const resourceLabels: Record<Domain, string[]> = {
      police: ['2× Police Unit'],
      medical: ['1× Ambulance (ALS)'],
      fire: ['2× Fire Truck', '1× Ambulance (precautionary)'],
      accident: ['1× Police Unit', '1× Fire/Rescue', '1× Ambulance'],
      disaster: ['2× Rescue Team', '1× Medical Unit'],
    };
    const hazardMap: Record<string, string[]> = {
      crime: ['Active threat', 'Severe bleeding', 'Hostile environment'],
      fire: ['Fire spread', 'Structural instability', 'Smoke inhalation'],
      medical: ['Medical emergency', 'Time-critical condition'],
      accident: ['Vehicle entrapment', 'Traffic hazard', 'Fuel spill'],
      disaster: ['Structural damage', 'Flood risk', 'Mass casualties'],
      other: ['Unknown hazard'],
    };

    const confidence = 92 + Math.floor(Math.random() * 6);
    const newIncident: Incident = {
      id: incidentId,
      incidentNumber,
      category,
      status: 'awaiting_approval',
      priority: priorityMap[category] ?? 'P2',
      severity: priorityMap[category] === 'P1' ? 'CRITICAL' : 'HIGH',
      location,
      reports: [{
        id: `rep-${Date.now()}`,
        citizenId: state.currentUser.id,
        citizenName: state.currentUser.name,
        category,
        description: draft.description || 'Emergency reported via ResQ platform.',
        location,
        timestamp: new Date(),
        hasImage: draft.hasImage,
        hasVoice: draft.hasVoice,
        voiceDuration: draft.voiceDuration,
        imageUrl: draft.imageUrl,
      }],
      aiAnalysis: {
        severity: priorityMap[category] === 'P1' ? 'CRITICAL' : 'HIGH',
        priority: priorityMap[category] ?? 'P2',
        peopleAtRisk: category === 'crime' ? 2 : category === 'accident' ? 3 : 1,
        injuries: category === 'crime'
          ? 'Severe laceration — active bleeding reported'
          : category === 'accident'
            ? 'Multiple casualties, possible entrapment'
            : 'Injuries consistent with reported emergency',
        hazards: hazardMap[category] ?? ['Unknown hazard'],
        urgency: 'Immediate — respond within 3 minutes',
        requiredResources: Array.from(new Set(affectedDomains.flatMap(d => resourceLabels[d] ?? []))),
        requiredDomains: affectedDomains,
        confidence,
        recommendedResourceIds: recommendedIds,
      },
      assignedResourceIds: [],
      affectedDomains,
      timeline: [
        { id: `t${Date.now()}`, timestamp: new Date(), event: `Emergency submitted by ${state.currentUser.name}`, type: 'citizen' },
        { id: `t${Date.now() + 1}`, timestamp: new Date(Date.now() + 1500), event: 'GPS location captured and verified', type: 'system' },
        { id: `t${Date.now() + 2}`, timestamp: new Date(Date.now() + 4000), event: `AI analysis complete — ${priorityMap[category] ?? 'P2'} ${priorityMap[category] === 'P1' ? 'CRITICAL' : 'HIGH'} severity — confidence ${confidence}%`, type: 'ai' },
        { id: `t${Date.now() + 3}`, timestamp: new Date(Date.now() + 5000), event: `Incident routed to: ${affectedDomains.map(d => d.toUpperCase()).join(', ')} managers`, type: 'system' },
      ],
      createdAt: new Date(), updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
    dispatch({ type: 'SET_PROCESSING_INCIDENT', payload: incidentId });
    dispatch({ type: 'SET_CITIZEN_INCIDENT', payload: incidentId });
    dispatch({ type: 'SET_VIEW', payload: 'citizen_processing' });

    // Notify each domain
    affectedDomains.forEach((domain, i) => {
      const roleMap: Record<Domain, 'fire' | 'medical' | 'police' | 'accident' | 'disaster'> = {
        fire: 'fire', medical: 'medical', police: 'police', accident: 'accident', disaster: 'disaster',
      };
      const emojiMap: Record<Domain, string> = { fire: '🔥', medical: '🚑', police: '👮', accident: '🚗', disaster: '🌪️' };
      setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `notif-new-${domain}-${Date.now()}`,
            targetRole: roleMap[domain],
            incidentId,
            title: `${emojiMap[domain]} P1 — ${category.toUpperCase()} INCIDENT`,
            message: `${incidentNumber} at ${location.label}. AI confidence: ${confidence}%. Immediate response required.`,
            priority: 'P1',
            timestamp: new Date(Date.now() + i * 200),
            read: false,
            type: 'alert',
          },
        });
      }, 5500 + i * 200);
    });

    // Command center + AI alerts
    setTimeout(() => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif-cmd-${Date.now()}`,
          targetRole: 'command',
          incidentId,
          title: `🚨 New P1 Incident — ${incidentNumber}`,
          message: `${category.toUpperCase()} at ${location.label}. ${affectedDomains.length} domains triggered.`,
          priority: 'P1',
          timestamp: new Date(Date.now() + 5800),
          read: false,
          type: 'alert',
        },
      });
      dispatch({
        type: 'ADD_AI_ALERT',
        payload: {
          id: `ai-new-${Date.now()}`, incidentId,
          message: `New ${category} incident ${incidentNumber} — ${affectedDomains.length} domains triggered, AI confidence ${confidence}%`,
          type: 'dispatch', timestamp: new Date(Date.now() + 5800),
        },
      });
    }, 5800);
  }, [state.reportDraft, state.currentUser]);

  const approveIncident = useCallback((incidentId: string) => {
    const inc = state.incidents.find(i => i.id === incidentId);
    if (!inc || !state.currentUser) return;
    const approvedBy = state.currentUser.name;

    dispatch({ type: 'APPROVE_INCIDENT', payload: { incidentId, approvedBy } });
    addToast(`✓ Resources approved for ${inc.incidentNumber} — dispatching now`, 'success');

    const resourceIds = inc.aiAnalysis?.recommendedResourceIds?.slice(0, 2) ?? [];
    resourceIds.forEach((rId, i) => {
      setTimeout(() => {
        const res = state.resources.find(r => r.id === rId);
        dispatch({ type: 'UPDATE_RESOURCE', payload: { id: rId, changes: { status: 'assigned', assignedIncidentId: incidentId } } });
        dispatch({
          type: 'UPDATE_INCIDENT',
          payload: {
            id: incidentId,
            changes: {
              assignedResourceIds: [...(inc.assignedResourceIds ?? []), ...resourceIds.slice(0, i + 1)],
              timeline: [...inc.timeline, {
                id: `t${Date.now() + i}`, timestamp: new Date(Date.now() + i * 500),
                event: `${res?.name ?? rId} assigned`, type: 'system' as const,
              }],
            },
          },
        });
      }, i * 500);
    });

    // Dispatch → En route
    setTimeout(() => {
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, changes: { status: 'en_route', etaMinutes: 5 } } });
      resourceIds.forEach(rId => {
        dispatch({ type: 'UPDATE_RESOURCE', payload: { id: rId, changes: { status: 'en_route', eta: 5 } } });
      });
      dispatch({ type: 'ADD_AI_ALERT', payload: { id: `ai-dispatch-${Date.now()}`, message: `Resources dispatched to ${inc.incidentNumber} — ${resourceIds.length} unit(s) en route, ETA 5 min`, type: 'dispatch', timestamp: new Date(), incidentId } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-cit-dispatch-${Date.now()}`, targetRole: 'citizen', incidentId, title: '🚨 Responders Dispatched', message: 'Help is on the way. ETA: 5 minutes.', priority: 'P1', timestamp: new Date(), read: false, type: 'alert' } });
    }, 2000);

    // Arrived
    setTimeout(() => {
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, changes: { status: 'arrived', etaMinutes: 0, timeline: [...inc.timeline, { id: `t-arrived-${Date.now()}`, timestamp: new Date(), event: 'Responders arrived on scene', type: 'responder' as const }] } } });
      resourceIds.forEach(rId => dispatch({ type: 'UPDATE_RESOURCE', payload: { id: rId, changes: { status: 'arrived', eta: 0 } } }));
      addToast(`Responders arrived on scene — ${inc.incidentNumber}`, 'info');
    }, 35000);

    // Resolved
    setTimeout(() => {
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incidentId, changes: { status: 'resolved', resolvedAt: new Date(), timeline: [...inc.timeline, { id: `t-resolved-${Date.now()}`, timestamp: new Date(), event: 'Incident resolved — units returning to base', type: 'system' as const }] } } });
      resourceIds.forEach(rId => dispatch({ type: 'UPDATE_RESOURCE', payload: { id: rId, changes: { status: 'available', assignedIncidentId: undefined, eta: undefined } } }));
      dispatch({ type: 'ADD_AI_ALERT', payload: { id: `ai-resolved-${Date.now()}`, incidentId, message: `${inc.incidentNumber} resolved — resources returning to base`, type: 'resolved', timestamp: new Date() } });
    }, 65000);
  }, [state.incidents, state.resources, state.currentUser, addToast]);

  // ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      state.incidents.forEach(inc => {
        if (inc.status === 'en_route' && inc.etaMinutes && inc.etaMinutes > 0) {
          dispatch({ type: 'UPDATE_INCIDENT', payload: { id: inc.id, changes: { etaMinutes: Math.max(0, (inc.etaMinutes ?? 1) - 1) } } });
        }
      });
      state.resources.forEach(res => {
        if (res.status === 'en_route' && res.eta && res.eta > 0) {
          dispatch({ type: 'UPDATE_RESOURCE', payload: { id: res.id, changes: { eta: Math.max(0, (res.eta ?? 1) - 1) } } });
        }
      });
    }, 25000);
    return () => clearInterval(timer);
  }, [state.incidents, state.resources]);

  const triggerDemoScenario = useCallback((scenario: 'crime_medical' | 'accident') => {
    const drafts: Record<string, Partial<ReportDraft>> = {
      crime_medical: {
        category: 'crime',
        location: { x: 52, y: 47, label: 'Central Park Ave & 5th St — Downtown' },
        description: 'Someone attacked a person and their leg is bleeding badly. Attacker still in the area.',
        hasImage: true, hasVoice: true, voiceDuration: 23,
        imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=300&fit=crop&auto=format',
      },
      accident: {
        category: 'accident',
        location: { x: 40, y: 55, label: 'Route 7 & Commerce Bridge — Midtown' },
        description: 'Two cars crashed. One person is trapped and two people are injured. Car is leaking fuel.',
        hasImage: true, hasVoice: false, voiceDuration: 0,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
      },
    };
    dispatch({ type: 'UPDATE_REPORT_DRAFT', payload: drafts[scenario] ?? {} });
  }, []);

  const triggerFusionDemo = useCallback(() => {
    const now = new Date();
    const minsAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);
    const fusionId = makeIncId();
    const fusionNumber = `#INC-${incidentCounter}`;

    // Create fused incident with 3 reports
    const fusedIncident: Incident = {
      id: fusionId,
      incidentNumber: fusionNumber,
      category: 'accident',
      status: 'awaiting_approval',
      priority: 'P1',
      severity: 'CRITICAL',
      location: { x: 55, y: 42, label: 'Riverside Drive & 3rd Ave Junction' },
      reports: [
        {
          id: 'fuse-rep-1', citizenId: 'cit-f1', citizenName: 'Morgan K.',
          category: 'accident', description: 'Major accident on Riverside. Car flipped over, people trapped.',
          location: { x: 55, y: 42, label: 'Riverside Drive & 3rd Ave' },
          timestamp: minsAgo(4), hasImage: false, hasVoice: true, voiceDuration: 15,
        },
        {
          id: 'fuse-rep-2', citizenId: 'cit-f2', citizenName: 'Taylor R.',
          category: 'accident', description: 'Crash on Riverside. Car on fire, someone is trapped.',
          location: { x: 55, y: 43, label: 'Riverside Dr near 3rd Ave' },
          timestamp: minsAgo(3), hasImage: true, hasVoice: false,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
        },
        {
          id: 'fuse-rep-3', citizenId: 'cit-f3', citizenName: 'Jamie S.',
          category: 'accident', description: 'Multiple vehicles crashed at the junction. At least 3 people injured.',
          location: { x: 56, y: 42, label: 'Riverside Drive Junction' },
          timestamp: minsAgo(2), hasImage: true, hasVoice: true, voiceDuration: 29,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
        },
      ],
      aiAnalysis: {
        severity: 'CRITICAL', priority: 'P1', peopleAtRisk: 4,
        injuries: 'Multiple casualties confirmed. Vehicle entrapment. Possible fire risk.',
        hazards: ['Vehicle entrapment', 'Fire risk', 'Fuel spill', 'Traffic hazard', 'Structural collapse risk'],
        urgency: 'Immediate — life-threatening entrapment',
        requiredResources: ['2× Fire Truck (Rescue)', '2× Ambulance (ALS)', '2× Police Unit'],
        requiredDomains: ['accident', 'fire', 'medical', 'police'],
        confidence: 97,
        recommendedResourceIds: ['fire-f01', 'amb-a01', 'pol-p01', 'res-r01'],
      },
      assignedResourceIds: [],
      affectedDomains: ['accident', 'fire', 'medical', 'police'],
      timeline: [
        { id: 'ft1', timestamp: minsAgo(4), event: '1st report from Morgan K. — accident with entrapment', type: 'citizen' },
        { id: 'ft2', timestamp: minsAgo(3), event: '2nd report from Taylor R. — same location, fire risk added', type: 'citizen' },
        { id: 'ft3', timestamp: minsAgo(2), event: '3rd report from Jamie S. — 3+ injuries confirmed', type: 'citizen' },
        { id: 'ft4', timestamp: minsAgo(2), event: 'AI duplicate detection: 3 reports match same incident (GPS + category + time)', type: 'ai' },
        { id: 'ft5', timestamp: new Date(now.getTime() - 90 * 1000), event: '3 reports fused into single unified incident', type: 'ai' },
        { id: 'ft6', timestamp: new Date(now.getTime() - 60 * 1000), event: 'AI analysis upgraded: P1 CRITICAL — severity increased from 3 data sources', type: 'ai' },
        { id: 'ft7', timestamp: new Date(), event: 'Incident routed to: ACCIDENT, FIRE, MEDICAL, POLICE managers', type: 'system' },
      ],
      createdAt: minsAgo(4), updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_INCIDENT', payload: fusedIncident });
    dispatch({ type: 'SET_FUSION_DEMO', payload: { active: true, step: 0 } });

    // Animate through fusion steps
    [0, 1, 2, 3, 4].forEach((step, i) => {
      setTimeout(() => {
        dispatch({ type: 'SET_FUSION_DEMO', payload: { active: true, step } });
      }, i * 1200);
    });

    setTimeout(() => {
      dispatch({ type: 'SET_FUSION_DEMO', payload: { active: false, step: 5 } });
      addToast(`✓ Fusion demo complete — ${fusionNumber}: 3 reports → 1 unified incident`, 'success');
    }, 6500);

    // Notify all managers
    ['accident', 'fire', 'medical', 'police'].forEach((domain, i) => {
      const emojiMap: Record<string, string> = { fire: '🔥', medical: '🚑', police: '👮', accident: '🚗' };
      setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `notif-fuse-${domain}-${Date.now()}`,
            targetRole: domain as any,
            incidentId: fusionId,
            title: `🔗 P1 FUSION — ${fusionNumber} (3 reports merged)`,
            message: `Multi-vehicle accident — 3 citizen reports fused. 4 casualties. Immediate response required.`,
            priority: 'P1',
            timestamp: new Date(Date.now() + i * 100),
            read: false,
            type: 'alert',
          },
        });
      }, 6500 + i * 100);
    });

    dispatch({
      type: 'ADD_AI_ALERT',
      payload: { id: `ai-fusion-${Date.now()}`, message: `3 duplicate reports merged into ${fusionNumber} — AI confidence 97% — severity upgraded to CRITICAL`, type: 'fusion', timestamp: new Date(), incidentId: fusionId },
    });
  }, [addToast]);

  const triggerReallocationDemo = useCallback(() => {
    const targetInc = state.incidents.find(i => i.status === 'awaiting_approval' || i.status === 'en_route');
    if (!targetInc) {
      addToast('Submit an incident first to demo reallocation', 'warning');
      return;
    }

    const incId = targetInc.id;
    dispatch({ type: 'SET_REALLOCATION_DEMO', payload: { active: true, step: 0, incidentId: incId } });
    addToast('⚠ Demo: Primary resource becoming unavailable...', 'warning');

    // Step 1: Primary resource goes busy
    setTimeout(() => {
      const primaryId = targetInc.aiAnalysis?.recommendedResourceIds?.[0] ?? 'amb-a01';
      dispatch({ type: 'UPDATE_RESOURCE', payload: { id: primaryId, changes: { status: 'busy' } } });
      dispatch({ type: 'SET_REALLOCATION_DEMO', payload: { active: true, step: 1, incidentId: incId } });
      dispatch({ type: 'ADD_AI_ALERT', payload: { id: `ai-realloc-1-${Date.now()}`, incidentId: incId, message: `⚠ Primary recommended resource unavailable for ${targetInc.incidentNumber} — AI recalculating`, type: 'shortage', timestamp: new Date() } });
      addToast('⚠ Primary resource unavailable — AI recalculating', 'warning');
    }, 1500);

    // Step 2: AI recalculates
    setTimeout(() => {
      dispatch({ type: 'SET_REALLOCATION_DEMO', payload: { active: true, step: 2, incidentId: incId } });
    }, 3000);

    // Step 3: New recommendation
    setTimeout(() => {
      const backupId = targetInc.aiAnalysis?.recommendedResourceIds?.[1] ?? 'amb-a02';
      const updatedAI = {
        ...targetInc.aiAnalysis!,
        recommendedResourceIds: [backupId, ...(targetInc.aiAnalysis?.recommendedResourceIds?.slice(1) ?? [])],
      };
      dispatch({ type: 'UPDATE_INCIDENT', payload: { id: incId, changes: { aiAnalysis: updatedAI } } });
      dispatch({ type: 'SET_REALLOCATION_DEMO', payload: { active: true, step: 3, incidentId: incId } });
      dispatch({ type: 'ADD_AI_ALERT', payload: { id: `ai-realloc-2-${Date.now()}`, incidentId: incId, message: `✓ AI reallocated resource for ${targetInc.incidentNumber} — new recommendation ready`, type: 'escalation', timestamp: new Date() } });
      addToast('✓ AI recommended new resource — awaiting manager approval', 'info');
    }, 5000);

    setTimeout(() => {
      dispatch({ type: 'SET_REALLOCATION_DEMO', payload: { active: false, step: 4, incidentId: null } });
    }, 9000);
  }, [state.incidents, addToast]);

  return (
    <AppContext.Provider value={{
      state, dispatch, theme: state.theme, toggleTheme, setTheme,
      login, logout, submitReport, approveIncident,
      getMyNotifications, getMyIncidents, triggerDemoScenario,
      triggerFusionDemo, triggerReallocationDemo, addToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
