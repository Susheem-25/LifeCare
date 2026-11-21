import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { RoadmapDashboard } from './components/roadmap/RoadmapDashboard';
import { EmergencySearch } from './components/patient/EmergencySearch';
import { HospitalMatchList } from './components/patient/HospitalMatchList';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { HackFrontTrackModal } from './components/tracks/HackFrontTrackModal';
import { FooterTracksSection } from './components/tracks/FooterTracksSection';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Zap,
  Activity,
  Presentation
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, activeBooking } = useEmergency();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);

  const navigateToPatient = () => {
    setCurrentView('patient');
    setTimeout(() => {
      const el = document.getElementById('citizen-sos-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const input = document.getElementById('emergency-search-input') as HTMLInputElement | null;
        if (input) input.focus();
      }
    }, 60);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased relative">
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-6">
        {/* Synchronized 5-Step Emergency Roadmap Dashboard Line & Live Lifecycle Preview */}
        <RoadmapDashboard onStepClick={(step) => {
          if (step <= 3) navigateToPatient();
          else if (step === 4) setCurrentView('ambulance');
          else if (step === 5) setCurrentView('hospital');
        }} />

        {/* View 1: Citizen Distress & AI Triage */}
        {currentView === 'patient' && (
          <div className="space-y-6">
            <EmergencySearch />
            <HospitalMatchList />
          </div>
        )}

        {/* View 2: Paramedic Cockpit & 108 Emergency Network */}
        {currentView === 'ambulance' && (
          <div className="animate-fadeIn">
            <AmbulancePortal />
          </div>
        )}

        {/* View 3: Hospital ER Command Center */}
        {currentView === 'hospital' && (
          <div className="animate-fadeIn">
            <HospitalPortal />
          </div>
        )}
      </main>

      {/* Floating Active Emergency Quick Navigation Bar */}
      {activeBooking && (
        <aside aria-label="Active emergency mission" className="sticky bottom-4 z-40 max-w-2xl mx-auto px-3 sm:px-4 w-full">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <div>
                <div className="text-slate-900 flex flex-wrap items-center gap-1.5 font-bold">
                  <span>Active Mission:</span>
                  <span className="text-red-600 font-mono font-extrabold">{activeBooking.bookingCode}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-mono text-[11px]">{activeBooking.patientUniqueId}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {activeBooking.hospitalName.split(' ')[0]} • Bay: <strong className="text-emerald-700">{activeBooking.reservedBay}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
              <button
                onClick={navigateToPatient}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${currentView === 'patient' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                SOS Triage
              </button>
              <button
                onClick={() => setCurrentView('ambulance')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${currentView === 'ambulance' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                Paramedic
              </button>
              <button
                onClick={() => setCurrentView('hospital')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${currentView === 'hospital' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
              >
                ER Command
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Architecture & 5-Step Methodology Section */}
      <FooterTracksSection />

      {/* High-End Healthcare Footer */}
      <footer className="border-t border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 pt-10 pb-8 px-3 sm:px-6 lg:px-8 mt-10 relative z-10 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Brand & System Attributes */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/70">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-mono text-xl font-bold text-slate-900 tracking-tight">
                    Life<span className="text-red-600">Care</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                    Zero-Wait Emergency OS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-Powered Emergency Triage & Atomic Hospital Bed Allocation
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-red-200 shadow-2xs font-mono font-bold text-red-700">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                Autonomous Healthcare OS
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-mono text-slate-600">
                National 108 Emergency Grid
              </span>
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 shadow-2xs font-mono font-bold text-red-700 transition cursor-pointer"
              >
                <Presentation className="w-3.5 h-3.5 text-red-600" />
                <span>Architecture & Pitch</span>
              </button>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs font-mono font-bold text-red-700 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                Helpline 112
              </a>
            </div>
          </div>

          {/* Key Metrics & Innovation Pills */}
          <div className="py-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-600">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 shadow-2xs font-bold">
              <Zap className="w-3 h-3 text-teal-600" />
              Neo4j Atomic Lock &lt;9ms
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              0% Gate Rejection
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs font-bold">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              0 sec Reception Intake
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Bhashini Indic AI (7 Languages)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              7-10% Survival Preserved / Min
            </span>
          </div>

          {/* Bottom Bar: Copyright & System Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200/50 text-center sm:text-left">
            <p>
              © 2026 <strong>LifeCare</strong> • Autonomous Emergency Healthcare Operating System. All rights reserved.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </span>
              <span className="text-slate-400">sub-9ms Graph Grid</span>
            </div>
          </div>
        </div>
      </footer>

      {/* System Architecture & Pitch Modal */}
      <HackFrontTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onNavigateToView={(view) => setCurrentView(view)}
      />
    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <MainAppContent />
    </EmergencyProvider>
  );
}
