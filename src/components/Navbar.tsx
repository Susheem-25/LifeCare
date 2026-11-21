import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  RotateCcw,
  PhoneCall,
  Lock,
  Presentation,
  ArrowLeft
} from 'lucide-react';

interface NavbarProps {
  onOpenTrackModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrackModal }) => {
  const {
    currentRole,
    setCurrentRole,
    activeBooking,
    resetEmergencyState,
    loggedHospital,
    loggedDriver
  } = useEmergency();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="min-h-14 sm:min-h-16 py-1.5 sm:py-2 flex items-center justify-between gap-2">
          {/* Brand & Home Navigation */}
          <div
            onClick={() => setCurrentRole('welcome')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
            title="Go to LifeCare Welcome Home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-4.5 h-4.5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono leading-none">
                  Life<span className="text-red-600">Care</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-md font-semibold">
                  Caring for Lives
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-slate-500">
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                  Autonomous Emergency Healthcare Operating System
                </span>
              </div>
            </div>
          </div>

          {/* Center Role Navigation Switcher (Desktop) */}
          <nav className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {currentRole !== 'welcome' && (
              <button
                type="button"
                onClick={() => setCurrentRole('welcome')}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer font-bold text-xs"
                title="Back to Welcome Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            )}

            {/* Guardian Portal */}
            <button
              type="button"
              onClick={() => setCurrentRole('guardian')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                currentRole === 'guardian'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <HeartPulse className={`w-3.5 h-3.5 ${currentRole === 'guardian' ? 'text-white' : 'text-red-600'}`} />
              <span>Guardian</span>
            </button>

            {/* Driver Portal */}
            <button
              type="button"
              onClick={() => setCurrentRole('driver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                currentRole === 'driver'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>
                {loggedDriver ? loggedDriver.driverName.split(' ')[0] : 'Driver'}
              </span>
              {!loggedDriver && <Lock className="w-2.5 h-2.5 text-slate-400" />}
            </button>

            {/* Hospital Portal */}
            <button
              type="button"
              onClick={() => setCurrentRole('hospital')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                currentRole === 'hospital'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {loggedHospital ? loggedHospital.hospitalCode : 'Hospital'}
              </span>
              {!loggedHospital && <Lock className="w-2.5 h-2.5 text-slate-400" />}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Active Patient ID Pill */}
            {activeBooking?.patientUniqueId && (
              <button
                type="button"
                onClick={() => setCurrentRole('guardian')}
                className="hidden md:inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer"
                title="Active patient mission"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>ID: {activeBooking.patientUniqueId}</span>
              </button>
            )}

            {onOpenTrackModal && (
              <button
                type="button"
                onClick={onOpenTrackModal}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[11px] font-mono text-red-800 font-bold transition cursor-pointer shadow-2xs"
                title="View Architecture Pitch"
              >
                <Presentation className="w-3 h-3 text-red-600" />
                <span className="hidden xs:inline">Pitch</span>
              </button>
            )}

            <a
              href="tel:112"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-red-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-mono text-red-700 font-bold transition cursor-pointer shadow-2xs"
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3 h-3 text-red-600" />
              <span>112</span>
            </a>

            <button
              onClick={resetEmergencyState}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Reset Simulation to Initial State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab Bar (Visible on mobile <sm) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full gap-1 shadow-2xs text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrentRole('welcome')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                currentRole === 'welcome' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('guardian')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                currentRole === 'guardian' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Guardian
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('driver')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                currentRole === 'driver' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('hospital')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                currentRole === 'hospital' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Hospital
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
