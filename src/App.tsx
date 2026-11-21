import React from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { GuardianPortal } from './components/guardian/GuardianPortal';
import { DriverPortal } from './components/ambulance/DriverPortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { VoiceToQrModal } from './components/common/VoiceToQrModal';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Zap,
  Activity
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeBooking, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    isVoiceQrModalOpen,
    setIsVoiceQrModalOpen
  } = useEmergency();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans antialiased relative">
      {/* Top Application Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-6">
        {/* ========================================================
            PAGE 1: WELCOME SCREEN (Welcome to LifeCare - Caring for Lives)
            Role Selection: Guardian, Driver, Hospital
            ======================================================== */}
        {currentRole === 'welcome' && (
          <div className="animate-fadeIn">
            <WelcomeScreen
              onSelectRole={(role) => {
                setCurrentRole(role);
              }}
            />
          </div>
        )}

        {/* ========================================================
            PAGE 2: GUARDIAN PORTAL
            Options: Track Patient or Register a New Patient
            ======================================================== */}
        {currentRole === 'guardian' && (
          <div className="animate-fadeIn">
            <GuardianPortal />
          </div>
        )}

        {/* ========================================================
            PAGE 3: DRIVER PORTAL
            Login with Driver ID -> Enter Patient ID -> Live Navigation Map
            ======================================================== */}
        {currentRole === 'driver' && (
          <div className="animate-fadeIn">
            <DriverPortal />
          </div>
        )}

        {/* ========================================================
            PAGE 4: HOSPITAL PORTAL
            Login with Hospital ID -> Editable Beds, Doctors, Machines,
            and Segregated Patient Directory (Incoming, Admitted, Discharged)
            ======================================================== */}
        {currentRole === 'hospital' && (
          <div className="animate-fadeIn">
            <HospitalPortal />
          </div>
        )}
      </main>

      {/* Floating Active Emergency Quick Mission Bar */}
      {activeBooking && currentRole !== 'guardian' && (
        <aside aria-label="Active emergency mission" className="sticky bottom-4 z-40 max-w-2xl mx-auto px-3 sm:px-4 w-full">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <div>
                <div className="text-slate-900 flex flex-wrap items-center gap-1.5 font-bold">
                  <span>Active Mission:</span>
                  <span className="text-red-600 font-mono font-extrabold">{activeBooking.patientUniqueId}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-mono text-[11px]">{activeBooking.bookingCode}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {activeBooking.hospitalName.split(' ')[0]} • Bay: <strong className="text-emerald-700">{activeBooking.reservedBay}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
              <button
                onClick={() => setCurrentRole('guardian')}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold transition cursor-pointer bg-red-600 text-white shadow-xs"
              >
                Track Live Route
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* High-End Healthcare Footer */}
      <footer className="border-t border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 pt-10 pb-8 px-3 sm:px-6 lg:px-8 mt-10 relative z-10 text-slate-600">
        <div className="max-w-7xl mx-auto space-y-8">
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
                    Caring for Lives
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
                Sarvam AI Voice Powered
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs font-mono text-slate-600">
                National 108 Emergency Grid
              </span>
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-2xs font-mono font-bold transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
                Ambulance 108
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
              Sarvam AI (Indic STT + TTS)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs font-bold">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              7-10% Survival Preserved / Min
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200/50 text-center sm:text-left">
            <p>
              © 2026 <strong>LifeCare</strong> • Caring for Lives. All rights reserved.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Emergency OS Online
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Firebase Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Ambulance / Guardian Voice-to-QR Pre-Admission Modal */}
      <VoiceToQrModal
        isOpen={isVoiceQrModalOpen}
        onClose={() => setIsVoiceQrModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EmergencyProvider>
      <MainAppContent />
    </EmergencyProvider>
  );
};

export default App;
