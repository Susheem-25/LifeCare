import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  RotateCcw,
  PhoneCall,
  ArrowLeft,
  User,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeBooking,
    resetEmergencyState,
    currentUser,
    setIsAuthModalOpen,
    theme,
    toggleTheme
  } = useEmergency();

  const isDarkTheme = theme === 'dark';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-colors duration-300 ${isDarkTheme ? 'bg-[#060913]/90 border-zinc-800/80 text-white shadow-2xl' : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-xs'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="min-h-14 sm:min-h-16 py-1.5 sm:py-2 flex items-center justify-between gap-2">
          {/* Brand & Home Navigation */}
          <div
            onClick={() => {
              if (currentUser) {
                setCurrentRole(currentUser.role);
              } else {
                setCurrentRole('welcome');
              }
            }}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
            title={currentUser ? `LifeCare ${currentUser.role === 'guardian' ? 'Guardian' : currentUser.role === 'driver' ? 'Driver' : 'Hospital'} Portal` : 'Go to LifeCare Welcome Home'}
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-4.5 h-4.5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1.5">
                <span className={`text-base sm:text-lg font-bold tracking-tight font-mono leading-none ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  Life<span className="text-red-500">Care</span>
                </span>
                <span className={`hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold ${isDarkTheme ? 'bg-red-950/70 text-red-400 border border-red-800/80' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  Caring for Lives
                </span>
              </div>
              <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] font-mono ${isDarkTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                  Autonomous Emergency Healthcare Network
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation / Role Indicator (Desktop) - No unauthorized cross-role switcher on normal pages */}
          <nav className="hidden sm:flex items-center space-x-2 text-xs">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {currentUser.role === 'guardian' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-xs">
                    <HeartPulse className="w-3.5 h-3.5 text-white" />
                    <span>Guardian Portal</span>
                  </div>
                )}
                {currentUser.role === 'driver' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-xs">
                    <Ambulance className="w-3.5 h-3.5 text-white" />
                    <span>108 Driver Cockpit</span>
                  </div>
                )}
                {currentUser.role === 'hospital' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span>Hospital ER Command</span>
                  </div>
                )}
              </div>
            ) : currentRole !== 'welcome' ? (
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
              </div>
            ) : null}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Google Authentication & Role Unique ID Pill */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs ${isDarkTheme ? 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
              title="Firebase Google Authentication & Unique Role ID"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span className="hidden xs:inline">
                {currentUser?.uniqueRoleId || 'Google Login'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            {/* Active Patient ID Pill */}
            {activeBooking?.patientUniqueId && (
              <div
                className="hidden md:inline-flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold"
                title="Active patient mission"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>ID: {activeBooking.patientUniqueId}</span>
              </div>
            )}

            <a
              href="tel:108"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-[11px] font-mono text-white font-bold transition cursor-pointer shadow-md shadow-red-600/30"
              title="Call 108 Ambulance Dispatch"
            >
              <PhoneCall className="w-3 h-3 text-white animate-pulse" />
              <span>Call 108</span>
            </a>

            <a
              href="tel:112"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs ${isDarkTheme ? 'bg-zinc-900/90 hover:bg-zinc-800 text-red-400 border-red-900/80' : 'bg-rose-50 hover:bg-rose-100 text-red-700 border-red-200'}`}
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3 h-3 text-red-500" />
              <span>112</span>
            </a>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center justify-center ${
                isDarkTheme
                  ? 'bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={`Switch to ${isDarkTheme ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
            </button>

            <button
              onClick={resetEmergencyState}
              className={`p-1.5 rounded-xl border transition cursor-pointer shadow-2xs ${isDarkTheme ? 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800' : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200'}`}
              title="Reset Emergency Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar - Single active portal indicator */}
        {currentRole !== 'welcome' && (
          <div className="sm:hidden pb-2.5 pt-0.5">
            <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full gap-2 text-xs">
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => setCurrentRole('welcome')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white text-slate-700 font-bold shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
              ) : (
                <span className="font-mono text-[11px] font-bold text-slate-600 px-2">
                  {currentUser.uniqueRoleId}
                </span>
              )}
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
