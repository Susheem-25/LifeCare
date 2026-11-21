import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  RotateCcw,
  PhoneCall,
  ArrowLeft,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeBooking,
    resetEmergencyState,
    currentUser,
    setIsAuthModalOpen
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

          {/* Center Navigation / Role Indicator (Desktop) - No unauthorized cross-role switcher on normal pages */}
          <nav className="hidden sm:flex items-center space-x-2 text-xs">
            {currentRole !== 'welcome' ? (
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentRole('welcome')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer font-bold text-xs"
                  title="Back to Welcome Portal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <span className="text-slate-300">•</span>
                {currentRole === 'guardian' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-xs">
                    <HeartPulse className="w-3.5 h-3.5 text-white" />
                    <span>Guardian Portal</span>
                  </div>
                )}
                {currentRole === 'driver' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-xs">
                    <Ambulance className="w-3.5 h-3.5 text-white" />
                    <span>108 Driver Cockpit</span>
                  </div>
                )}
                {currentRole === 'hospital' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span>Hospital ER Command</span>
                  </div>
                )}
              </div>
            ) : currentUser ? (
              <button
                type="button"
                onClick={() => setCurrentRole(currentUser.role)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white transition shadow-xs cursor-pointer ${
                  currentUser.role === 'guardian'
                    ? 'bg-red-600 hover:bg-red-700'
                    : currentUser.role === 'driver'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {currentUser.role === 'guardian' && <HeartPulse className="w-3.5 h-3.5" />}
                {currentUser.role === 'driver' && <Ambulance className="w-3.5 h-3.5" />}
                {currentUser.role === 'hospital' && <Building2 className="w-3.5 h-3.5" />}
                <span>Enter {currentUser.role === 'guardian' ? 'Guardian Portal' : currentUser.role === 'driver' ? 'Driver Cockpit' : 'Hospital Command'}</span>
              </button>
            ) : null}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Google Authentication & Role Unique ID Pill */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-mono text-slate-700 font-bold transition cursor-pointer shadow-2xs"
              title="Firebase Google Authentication & Unique Role ID"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="hidden xs:inline">
                {currentUser?.uniqueRoleId || 'Google Login'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            {/* Active Patient ID Pill */}
            {activeBooking?.patientUniqueId && (
              <div
                className="hidden md:inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold"
                title="Active patient mission"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>ID: {activeBooking.patientUniqueId}</span>
              </div>
            )}

            <a
              href="tel:108"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-[11px] font-mono text-white font-bold transition cursor-pointer shadow-xs"
              title="Call 108 Ambulance Dispatch"
            >
              <PhoneCall className="w-3 h-3 text-white animate-pulse" />
              <span>Call 108</span>
            </a>

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
              title="Reset Emergency Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar - Single active portal indicator, no unauthorized switcher */}
        {currentRole !== 'welcome' && (
          <div className="sm:hidden pb-2.5 pt-0.5">
            <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCurrentRole('welcome')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white text-slate-700 font-bold shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <div
                className={`px-3 py-1.5 rounded-lg text-white font-bold flex items-center space-x-1.5 shadow-xs ${
                  currentRole === 'guardian'
                    ? 'bg-red-600'
                    : currentRole === 'driver'
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
              >
                {currentRole === 'guardian' && <HeartPulse className="w-3.5 h-3.5 text-white" />}
                {currentRole === 'driver' && <Ambulance className="w-3.5 h-3.5 text-white" />}
                {currentRole === 'hospital' && <Building2 className="w-3.5 h-3.5 text-white" />}
                <span>
                  {currentRole === 'guardian'
                    ? 'Guardian'
                    : currentRole === 'driver'
                    ? '108 Driver'
                    : 'Hospital'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
