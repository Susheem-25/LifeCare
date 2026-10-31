import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { EmergencySearch } from './components/patient/EmergencySearch';
import { HospitalMatchList } from './components/patient/HospitalMatchList';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { HackFrontTrackModal } from './components/tracks/HackFrontTrackModal';
import { FooterTracksSection } from './components/tracks/FooterTracksSection';
import { HeartPulse, Ambulance, Building2, ArrowRight } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, activeBooking } = useEmergency();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800 flex flex-col font-sans selection:bg-red-500 selection:text-white antialiased relative overflow-hidden">
      {/* Apple OS Fluid Ambient Liquid Auras for authentic glass refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="apple-liquid-orb-1 absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-red-500/15 via-rose-400/10 to-transparent blur-3xl opacity-75"></div>
        <div className="apple-liquid-orb-2 absolute top-1/4 -right-32 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-rose-500/12 via-red-400/8 to-transparent blur-3xl opacity-70"></div>
        <div className="apple-liquid-orb-3 absolute bottom-24 left-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-sky-200/50 via-indigo-100/35 to-transparent blur-3xl opacity-60"></div>
        <div className="apple-liquid-orb-1 absolute bottom-[-90px] right-12 w-[480px] h-[480px] rounded-full bg-gradient-to-t from-red-400/15 via-rose-200/25 to-transparent blur-3xl opacity-75"></div>
      </div>

      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {currentView === 'patient' && (
          <div className="space-y-6">
            <EmergencySearch />
            <HospitalMatchList />
          </div>
        )}

        {currentView === 'ambulance' && (
          <div className="animate-fadeIn">
            <AmbulancePortal />
          </div>
        )}

        {currentView === 'hospital' && (
          <div className="animate-fadeIn">
            <HospitalPortal />
          </div>
        )}
      </main>

      {/* Floating Active Emergency Quick Navigation Bar (Liquid Glass Dock) */}
      {activeBooking && currentView === 'patient' && (
        <aside aria-label="Active emergency hold" className="sticky bottom-4 z-40 max-w-2xl mx-auto px-4 w-full">
          <div className="liquid-glass-card rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs oled-glow-red border border-red-200/80">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 dot-pulse"></span>
              <div>
                <div className="font-mono text-slate-900 flex items-center gap-1.5 font-bold">
                  <span>Driver Code:</span>
                  <span className="text-red-600 font-mono font-extrabold">{activeBooking.bookingCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 font-mono">{activeBooking.patientUniqueId}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {activeBooking.hospitalName.split(' ')[0]} • Bay: {activeBooking.reservedBay}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <button
                onClick={() => setCurrentView('ambulance')}
                className="px-3.5 py-1.5 rounded-xl liquid-btn-red text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Ambulance Cockpit</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setCurrentView('hospital')}
                className="px-3 py-1.5 rounded-xl liquid-btn-glass text-slate-700 flex items-center gap-1 transition cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-slate-500" />
                <span>Hospital Portal</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Permanently Opened HackFront Multi-Track Showcase Section */}
      <FooterTracksSection />

      {/* Clean Healthcare Liquid Glass Footer */}
      <footer className="border-t border-white/80 bg-white/60 backdrop-blur-xl py-8 px-4 text-center text-xs text-slate-500 mt-6 relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div className="max-w-7xl mx-auto space-y-2 font-mono">
          <div className="flex items-center justify-center space-x-2">
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span className="font-bold text-slate-900 text-sm">Life<span className="text-red-600">Care</span></span>
            <span className="text-slate-300">—</span>
            <span className="text-slate-600">AI Emergency Orchestration & Golden Hour Zero-Wait Platform</span>
          </div>
          <div className="text-[11px] text-slate-500 max-w-xl mx-auto space-y-1">
            <p>
              Engineered for <strong>HackFront by whereuelevate.com</strong>
            </p>
            <p className="text-[10.5px] text-slate-600 font-semibold">
              Team: Susheem Kumar Maurya • Stuti Jain • Saksham Kaushik
            </p>
            <p className="text-[10.5px] text-slate-400">
              Real-time Bed, Doctor & Machinery Locking • Ambulance Google Maps Routing • ABHA Pre-Admission.
            </p>
          </div>
        </div>
      </footer>

      {/* HackFront India Multi-Track Showcase Modal */}
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
