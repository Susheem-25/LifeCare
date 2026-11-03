import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { EmergencySearch } from './components/patient/EmergencySearch';
import { HospitalMatchList } from './components/patient/HospitalMatchList';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { HackFrontTrackModal } from './components/tracks/HackFrontTrackModal';
import { FooterTracksSection } from './components/tracks/FooterTracksSection';
import { HeartPulse } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, activeBooking } = useEmergency();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased relative">
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
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

      {/* Floating Active Emergency Quick Navigation Bar */}
      {activeBooking && currentView === 'patient' && (
        <aside aria-label="Active emergency hold" className="sticky bottom-4 z-40 max-w-2xl mx-auto px-3 sm:px-4 w-full">
          <div className="bg-white rounded-xl p-3 shadow-lg border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 dot-pulse shrink-0"></span>
              <div>
                <div className="text-slate-900 flex flex-wrap items-center gap-1.5 font-bold">
                  <span>Driver Code:</span>
                  <span className="text-red-600 font-mono font-extrabold">{activeBooking.bookingCode}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 font-mono text-[11px]">{activeBooking.patientUniqueId}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {activeBooking.hospitalName.split(' ')[0]} • Bay: {activeBooking.reservedBay}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('patient-active-booking-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>View Live GPS</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* HackFront Multi-Track Showcase Section */}
      <FooterTracksSection />

      {/* Clean Healthcare Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-3 sm:px-4 text-center text-xs text-slate-500 mt-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
            <HeartPulse className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-bold text-slate-900 text-sm">Life<span className="text-red-600">Care</span></span>
            <span className="text-slate-300 hidden sm:inline">—</span>
            <span className="text-slate-600 text-xs block sm:inline">Zero-Wait Emergency Hospital Orchestration</span>
          </div>
          <div className="text-xs text-slate-500 max-w-xl mx-auto space-y-0.5">
            <p>
              HackFront India 2026 • <strong>Team BuilderBeings</strong> (Susheem Kumar Maurya • Stuti Jain)
            </p>
            <p className="text-[11px] text-slate-400">
              Sarvam Indic Voice AI • Neo4j Multi-Resource Graph Locking • ABDM ABHA In-Transit Pre-Admission
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
