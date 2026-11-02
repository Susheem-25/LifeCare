import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  RotateCcw,
  PhoneCall,
  Lock,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onOpenTrackModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrackModal }) => {
  const {
    currentView,
    setCurrentView,
    activeBooking,
    resetEmergencyState,
    loggedHospital,
    logoutHospital
  } = useEmergency();

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06),inset_0_-1px_1px_rgba(255,255,255,0.9)]">
      {/* Top info ticker */}
      <div className="bg-red-500/10 backdrop-blur-md border-b border-red-200/50 px-4 py-1.5 text-[11px] flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center space-x-2.5 text-slate-700">
          <span className="w-2 h-2 rounded-full bg-red-600 dot-pulse"></span>
          <span className="font-mono text-[10px] text-red-700 font-extrabold tracking-wider">
            HACKFRONT INDIA 2026 • WHEREUELEVATE.COM
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600 hidden sm:inline font-mono text-[10px]">
            LifeCare AI Emergency Triage • Resource Locking • Ambulance Telemetry • ABHA Zero-Wait
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenTrackModal && (
            <button
              type="button"
              onClick={onOpenTrackModal}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-mono text-slate-800 font-bold transition cursor-pointer shadow-xs"
              title="View Tracks Used & Future Tracks"
            >
              <span className="text-red-700 font-extrabold">Tracks Used:</span>
              <span className="text-slate-700">Neo4j • Sarvam • General</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-blue-600 font-bold hidden sm:inline">Future: Arduino UnoQ</span>
            </button>
          )}

          <a
            href="tel:112"
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full border border-red-200/80 bg-white/80 hover:bg-red-50 backdrop-blur-sm text-[10px] font-mono text-red-700 font-bold shadow-xs transition cursor-pointer"
            title="Emergency National Helpline (112 / 108)"
          >
            <PhoneCall className="w-2.5 h-2.5 text-red-600" />
            <span>ER: 112 / 108</span>
          </a>

          <button
            onClick={resetEmergencyState}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-lg border border-slate-200/80 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 text-[10px] font-mono transition cursor-pointer shadow-xs"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setCurrentView('patient')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_8px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
            <HeartPulse className="w-4 h-4 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                Life<span className="text-red-600">Care</span>
              </span>
              <span className="text-[9px] font-mono uppercase bg-red-100/80 text-red-700 border border-red-200 px-1.5 py-0.2 rounded-full font-bold">
                EMERGENCY 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Role-Based Portal Tabs: Emergency SOS | Login as Ambulance | Login as Hospital */}
        <nav className="flex items-center space-x-1 bg-slate-100/70 backdrop-blur-xl p-1 rounded-2xl border border-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          {/* 1. Main Public Site: Emergency SOS */}
          <button
            onClick={() => setCurrentView('patient')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer ${currentView === 'patient'
                ? 'liquid-btn-red text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
          >
            <HeartPulse className={`w-3.5 h-3.5 ${currentView === 'patient' ? 'text-white' : 'text-red-600'}`} />
            <span>Emergency SOS</span>
          </button>

          {/* 2. Login as Ambulance */}
          <button
            onClick={() => setCurrentView('ambulance')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer ${currentView === 'ambulance'
                ? 'liquid-btn-red text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
          >
            <Ambulance className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login as</span>
            <span>Ambulance</span>
            {activeBooking.bookingCode && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${currentView === 'ambulance'
                    ? 'bg-white/30 text-white'
                    : 'bg-red-100 text-red-700'
                  }`}
              >
                {activeBooking.bookingCode}
              </span>
            )}
          </button>

          {/* 3. Login as Hospital */}
          <button
            onClick={() => setCurrentView('hospital')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer ${currentView === 'hospital'
                ? 'liquid-btn-red text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {loggedHospital ? (
              <>
                <span className={currentView === 'hospital' ? 'text-white font-bold' : 'text-red-600 font-bold'}>
                  {loggedHospital.hospitalCode}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Login as</span>
                <span>Hospital</span>
              </>
            )}
          </button>
        </nav>

        {/* Logged in status or active code */}
        <div className="hidden lg:flex items-center space-x-2 font-mono text-xs">
          {loggedHospital ? (
            <div className="bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-xl text-[11px] text-emerald-800 flex items-center space-x-2 shadow-xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dot-pulse"></span>
              <span>Hospital: <strong className="text-slate-900">{loggedHospital.name.split(' ')[0]}</strong></span>
              <button
                onClick={logoutHospital}
                className="text-slate-400 hover:text-red-600 transition ml-1 cursor-pointer"
                title="Logout Hospital"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView('ambulance')}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-200/80 px-2.5 py-1 rounded-xl text-[11px] text-red-800 flex items-center space-x-1.5 shadow-xs backdrop-blur-sm transition cursor-pointer"
              title="Click to open Active Ambulance Mission"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 dot-pulse"></span>
              <span>Active Code: <strong className="text-red-700 font-bold">{activeBooking.bookingCode}</strong></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
