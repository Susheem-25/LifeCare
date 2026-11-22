import React, { useEffect, useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { GuardianPortal } from './components/guardian/GuardianPortal';
import { DriverPortal } from './components/ambulance/DriverPortal';
import { HospitalPortal } from './components/hospital/HospitalPortal';
import { AdminConsole } from './components/admin/AdminConsole';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { VoiceToQrModal } from './components/common/VoiceToQrModal';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  Zap,
  Activity
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeBooking, 
    currentUser,
    isAuthModalOpen, 
    setIsAuthModalOpen,
    isVoiceQrModalOpen,
    setIsVoiceQrModalOpen
  } = useEmergency();

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    return p === '/admin' || p.startsWith('/admin') || h === '#/admin' || h.startsWith('#/admin');
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      setIsAdminRoute(p === '/admin' || p.startsWith('/admin') || h === '#/admin' || h.startsWith('#/admin'));
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Directly navigate to registered portal if user is already authenticated
  useEffect(() => {
    if (currentUser?.role && ['guardian', 'driver', 'hospital'].includes(currentUser.role)) {
      if (currentRole !== currentUser.role) {
        setCurrentRole(currentUser.role);
      }
    }
  }, [currentUser, currentRole, setCurrentRole]);

  if (isAdminRoute) {
    return <AdminConsole />;
  }

  const isDarkWelcome = !currentUser || currentRole === 'welcome';

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${isDarkWelcome ? 'bg-[#03060d] text-zinc-100 selection:bg-red-500 selection:text-white' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans antialiased relative transition-colors duration-300`}>
      {/* Top Application Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 space-y-6">
        {/* ========================================================
            PAGE 1: WELCOME & AUTHENTICATION SCREEN
            Requires real Google Sign-In to proceed to any portal
            ======================================================== */}
        {!currentUser && (
          <div className="animate-fadeIn">
            <WelcomeScreen
              onSelectRole={(role) => {
                setCurrentRole(role);
              }}
            />
          </div>
        )}

        {/* ========================================================
            RBAC Access Denied Fallback
            ======================================================== */}
        {currentUser && currentRole !== 'welcome' && currentRole !== currentUser.role && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600">
              You are authenticated as <strong className="capitalize text-slate-900">{currentUser.role}</strong> ({currentUser.uniqueRoleId}). You do not have permission to access the {currentRole} portal.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentRole(currentUser.role)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Return to {currentUser.role === 'guardian' ? 'Guardian Portal' : currentUser.role === 'driver' ? 'Driver Cockpit' : 'Hospital Portal'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PAGE 2: GUARDIAN PORTAL (Authenticated Google Guardians Only)
            ======================================================== */}
        {currentUser && currentUser.role === 'guardian' && (
          <div className="animate-fadeIn">
            <GuardianPortal />
          </div>
        )}

        {/* ========================================================
            PAGE 3: DRIVER PORTAL (Authenticated 108 Drivers Only)
            ======================================================== */}
        {currentUser && currentUser.role === 'driver' && (
          <div className="animate-fadeIn">
            <DriverPortal />
          </div>
        )}

        {/* ========================================================
            PAGE 4: HOSPITAL PORTAL (Authenticated Hospital Staff Only)
            ======================================================== */}
        {currentUser && currentUser.role === 'hospital' && (
          <div className="animate-fadeIn">
            <HospitalPortal />
          </div>
        )}
      </main>

      {/* Floating Active Emergency Quick Mission Bar (Only on Welcome screen for unauthenticated visitors) */}
      {activeBooking && currentRole === 'welcome' && !currentUser && (
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
                type="button"
                onClick={() => setCurrentRole('guardian')}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Go to Mission
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* High-End Healthcare Footer */}
      <footer className={`border-t transition-colors duration-300 pt-10 pb-8 px-3 sm:px-6 lg:px-8 mt-10 relative z-10 ${
        isDarkWelcome
          ? 'border-zinc-800/80 bg-[#060913] text-zinc-400'
          : 'border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b ${
            isDarkWelcome ? 'border-zinc-800/80' : 'border-slate-200/70'
          }`}>
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`font-mono text-xl font-bold tracking-tight ${isDarkWelcome ? 'text-white' : 'text-slate-900'}`}>
                    Life<span className="text-red-500">Care</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isDarkWelcome
                      ? 'bg-red-950/70 text-red-400 border-red-800/80'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    Caring for Lives
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDarkWelcome ? 'text-zinc-400 font-mono' : 'text-slate-500'}`}>
                  AI-Powered Emergency Triage & Atomic Hospital Bed Allocation
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold border shadow-2xs ${
                isDarkWelcome
                  ? 'bg-zinc-900 border-red-900/60 text-red-400'
                  : 'bg-white border-red-200 text-red-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Sarvam AI Voice Powered
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-mono border shadow-2xs ${
                isDarkWelcome
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                National 108 Emergency Grid
              </span>
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 font-mono font-bold transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
                Ambulance 108
              </a>
              <a
                href="tel:112"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold transition border shadow-2xs ${
                  isDarkWelcome
                    ? 'bg-zinc-900 hover:bg-zinc-800 border-red-900/80 text-red-400'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-red-700'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                Helpline 112
              </a>
            </div>
          </div>

          <div className="py-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-2xs font-bold ${
              isDarkWelcome
                ? 'bg-zinc-900/90 border-teal-900/60 text-teal-400'
                : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}>
              <Zap className="w-3.5 h-3.5 text-teal-500" />
              Cloud Atomic Lock &lt;10ms
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-2xs font-bold ${
              isDarkWelcome
                ? 'bg-zinc-900/90 border-emerald-900/60 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              0% Gate Rejection
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-2xs font-bold ${
              isDarkWelcome
                ? 'bg-zinc-900/90 border-blue-900/60 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              0 sec Reception Intake
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-2xs font-bold ${
              isDarkWelcome
                ? 'bg-zinc-900/90 border-amber-900/60 text-amber-400'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Sarvam AI (Indic STT + TTS)
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-2xs font-bold ${
              isDarkWelcome
                ? 'bg-zinc-900/90 border-rose-900/60 text-rose-400'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              7-10% Survival Preserved / Min
            </span>
          </div>

          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2 border-t text-center sm:text-left ${
            isDarkWelcome ? 'border-zinc-800/80 text-zinc-500' : 'border-slate-200/50 text-slate-500'
          }`}>
            <p>
              © 2026 <strong className={isDarkWelcome ? 'text-zinc-300 font-mono' : 'text-slate-700'}>LifeCare</strong> • Caring for Lives. All rights reserved.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                isDarkWelcome
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
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

      {/* Guardian Voice-to-QR Pre-Admission Modal (Restricted strictly to Guardian) */}
      {currentRole === 'guardian' && (!currentUser || currentUser.role === 'guardian') && (
        <VoiceToQrModal
          isOpen={isVoiceQrModalOpen}
          onClose={() => setIsVoiceQrModalOpen(false)}
        />
      )}
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
