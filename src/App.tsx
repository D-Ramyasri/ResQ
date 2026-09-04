import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginView from './views/LoginView';
import CitizenDashboard from './views/citizen/CitizenDashboard';
import ReportFlow from './views/citizen/ReportFlow';
import ProcessingScreen from './views/citizen/ProcessingScreen';
import ActiveEmergency from './views/citizen/ActiveEmergency';
import ResponderDashboard from './views/responder/ResponderDashboard';
import CommandCenter from './views/command/CommandCenter';
import ToastSystem from './components/ToastSystem';
import DemoPanel from './components/DemoPanel';
import FusionDemoOverlay from './components/FusionDemoOverlay';

function AppInner() {
  const { state } = useApp();
  const { currentView, currentUser } = state;

  const showGlobalUI = currentUser && currentView !== 'login';

  return (
    <div className="size-full flex flex-col relative transition-colors duration-200" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Main content */}
      <div className="flex-1 min-h-0">
        {(!currentUser || currentView === 'login') && <LoginView />}
        {currentUser?.role === 'citizen' && currentView === 'citizen_report' && <ReportFlow />}
        {currentUser?.role === 'citizen' && currentView === 'citizen_processing' && <ProcessingScreen />}
        {currentUser?.role === 'citizen' && currentView === 'citizen_active' && <ActiveEmergency />}
        {currentUser?.role === 'citizen' && currentView === 'citizen_dashboard' && <CitizenDashboard />}
        {currentUser && currentUser.role !== 'citizen' && currentUser.role !== 'command'
          && ['responder_dashboard', 'responder_incident'].includes(currentView)
          && <ResponderDashboard />}
        {currentUser?.role === 'command' && currentView === 'command_center' && <CommandCenter />}
      </div>

      {/* Global overlays — always on top */}
      <FusionDemoOverlay />
      <ToastSystem />
      {showGlobalUI && <DemoPanel />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
