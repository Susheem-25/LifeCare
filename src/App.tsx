import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { EmergencySearch } from './components/patient/EmergencySearch';
import { HospitalMatchList } from './components/patient/HospitalMatchList';
import { AmbulancePortal } from './components/ambulance/AmbulancePortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { HackFrontTrackModal } from './components/tracks/HackFrontTrackModal';
import { FooterTracksSection } from './components/tracks/FooterTracksSection';
import {
  HeartPulse,
  Award,
  Sparkles,
  Code2,
  Stethoscope,
  Layers,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

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

      {/* High-End Healthcare & Team Showcase Footer */}
      <footer className="border-t border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 pt-10 pb-8 px-3 sm:px-6 lg:px-8 mt-10 relative z-10 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Brand & HackFront Badge */}
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
                    Zero-Wait ER
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI Emergency Triage & Zero-Wait Hospital Orchestration Platform
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-mono font-semibold text-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                HackFront India 2026
              </span>
              <a
                href="https://whereuelevate.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs font-mono text-slate-600 hover:text-slate-900 transition"
              >
                whereuelevate.com
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs font-mono font-bold text-red-700 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                Helpline 112
              </a>
            </div>
          </div>

          {/* Middle Row: Prominent Team BuilderBeings Member Showcase Cards */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Team BuilderBeings
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
                Core Architects & Clinical Design Leads
              </h3>
              <p className="text-xs text-slate-500 max-w-xl mx-auto mt-0.5">
                Engineered from the ground up for HackFront India 2026 to eliminate Golden Hour trauma mortality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {/* Member 1: Susheem Kumar Maurya */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500"></div>
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-red-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    SM
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        Susheem Kumar Maurya
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Team Lead
                      </span>
                    </div>
                    <p className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Code2 className="w-3 h-3 text-emerald-600" />
                      Full-Stack Architect & Systems Lead
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold shrink-0">•</span>
                    <span><strong>Neo4j Cypher Graph Engine:</strong> Sub-9ms index-free multi-resource atomic locks</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold shrink-0">•</span>
                    <span><strong>Sarvam Indic Voice AI & Web Speech:</strong> 7 native language voice intake & TTS</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold shrink-0">•</span>
                    <span><strong>ABDM In-Transit Pre-Admission:</strong> Zero-wait patient intake & Aadhaar verification</span>
                  </div>
                </div>
              </div>

              {/* Member 2: Stuti Jain */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    SJ
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        Stuti Jain
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        UX Lead
                      </span>
                    </div>
                    <p className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3 h-3 text-emerald-600" />
                      Healthcare Systems & Clinical UX Lead
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span><strong>Clinical Triage Protocols:</strong> Emergency Severity Index (ESI 1-5) & ICD-10 codes</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span><strong>Apple OS Liquid Glass UI:</strong> Mobile-first 2-tier responsiveness & zero scroll guard</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span><strong>Paramedic Cockpit & Telemetry:</strong> Live 2-way vital synchronization with ER Cath Labs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Innovation & Multi-Track Pills */}
          <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-600">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Layers className="w-3 h-3 text-red-600" />
              Neo4j Track (Active)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Sarvam Indic Voice Track (Active)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              General Track Zero-Wait ER (Active)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
              Arduino UnoQ IoT (Roadmap)
            </span>
          </div>

          {/* Bottom Bar: Copyright & Live Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200/50 text-center sm:text-left">
            <p>
              © 2026 <strong>LifeCare</strong> • Built with dedication by <strong>Team BuilderBeings</strong> (Susheem Kumar Maurya & Stuti Jain)
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Prototype Online
              </span>
              <span className="text-slate-400">React 19 • Tailwind 4</span>
            </div>
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
