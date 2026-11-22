import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  PhoneCall,
  ArrowLeft,
  User,
  Sun,
  Moon,
  Activity,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeBooking,
    currentUser,
    setIsAuthModalOpen,
    theme,
    toggleTheme,
    loginWithGoogle,
    logoutUser
  } = useEmergency();

  const isDarkTheme = theme === 'dark';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-300 ${
      isDarkTheme
        ? 'bg-[#060913]/90 border-zinc-800/80 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
        : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.04)]'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* ========================================================
              LEFT: EXECUTIVE BRAND IDENTITY
              ======================================================== */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              onClick={() => {
                if (currentUser) {
                  setCurrentRole(currentUser.role);
                } else {
                  setCurrentRole('welcome');
                }
              }}
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
              title={currentUser ? `LifeCare ${currentUser.role === 'guardian' ? 'Guardian' : currentUser.role === 'driver' ? 'Driver' : 'Hospital'} Portal` : 'Go to LifeCare Welcome Home'}
            >
              {/* Luminous Cardiac Icon Badge */}
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-600 text-white shadow-md shadow-red-600/35 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060913] animate-pulse"></span>
              </div>

              {/* Brand Typography & Status Pill */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg sm:text-xl font-black tracking-tight font-mono leading-none ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">Care</span>
                  </span>
                  <span className={`hidden sm:inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    isDarkTheme
                      ? 'bg-red-950/70 text-red-400 border-red-800/80'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>EMERGENCY GRID</span>
                  </span>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] font-mono ${
                  isDarkTheme ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  <span className="font-medium">
                    Zero-Wait Emergency Healthcare Network
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              CENTER: ACTIVE PORTAL INDICATOR (Desktop)
              ======================================================== */}
          <nav className="hidden md:flex items-center space-x-2 text-xs">
            {currentUser ? (
              <div className={`flex items-center space-x-2 p-1 rounded-2xl border ${
                isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100/90 border-slate-200'
              }`}>
                {currentUser.role === 'guardian' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs">
                    <HeartPulse className="w-3.5 h-3.5 text-white" />
                    <span>Guardian Portal</span>
                  </div>
                )}
                {currentUser.role === 'driver' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-xs">
                    <Ambulance className="w-3.5 h-3.5 text-white" />
                    <span>108 Driver Cockpit</span>
                  </div>
                )}
                {currentUser.role === 'hospital' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                    <span>Hospital ER Command</span>
                  </div>
                )}
              </div>
            ) : currentRole !== 'welcome' ? (
              <button
                type="button"
                onClick={() => setCurrentRole('welcome')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDarkTheme
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
                title="Return to Welcome Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            ) : null}
          </nav>

          {/* ========================================================
              RIGHT: TOP RIGHT CAPSULE PILL & CONTROLS
              ======================================================== */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Top Right Capsule Pill for Driver Login & Hospital Login */}
            {!currentUser && (
              <div className={`inline-flex items-center p-0.5 sm:p-1 rounded-full border shadow-sm backdrop-blur-xl transition-all ${
                isDarkTheme
                  ? 'bg-zinc-900/90 border-zinc-800 ring-1 ring-white/5'
                  : 'bg-white/95 border-slate-200/90 shadow-2xs ring-1 ring-slate-900/5'
              }`}>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const u = await loginWithGoogle('driver');
                      if (u) setCurrentRole('driver');
                    } catch (err) {
                      console.warn('Driver login error:', err);
                    }
                  }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                    isDarkTheme
                      ? 'text-amber-400 hover:bg-amber-950/70 hover:text-amber-300'
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                  title="108 Ambulance Driver Cockpit Login"
                >
                  <Ambulance className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xs:inline">108 </span><span>Driver</span>
                </button>
                <span className={`w-px h-3.5 sm:h-4 mx-0.5 sm:mx-1 ${isDarkTheme ? 'bg-zinc-800' : 'bg-slate-200'}`}></span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const u = await loginWithGoogle('hospital');
                      if (u) setCurrentRole('hospital');
                    } catch (err) {
                      console.warn('Hospital login error:', err);
                    }
                  }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                    isDarkTheme
                      ? 'text-emerald-400 hover:bg-emerald-950/70 hover:text-emerald-300'
                      : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                  title="Hospital ER Command Center Login"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden xs:inline">Hospital </span><span>ER</span>
                </button>
              </div>
            )}

            {/* Authenticated User Status Pill */}
            {currentUser && (
              <div className={`inline-flex items-center p-0.5 sm:p-1 rounded-full border shadow-2xs ${
                isDarkTheme ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition cursor-pointer ${
                    isDarkTheme ? 'text-zinc-200 hover:text-white' : 'text-slate-800 hover:text-slate-900'
                  }`}
                  title="Account Details & Role Information"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="font-bold">{currentUser.uniqueRoleId}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
                <span className={`w-px h-3.5 mx-1 ${isDarkTheme ? 'bg-zinc-800' : 'bg-slate-200'}`}></span>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUser();
                    setCurrentRole('welcome');
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Emergency 108 Dispatch Pill */}
            <a
              href="tel:108"
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-[11px] sm:text-xs font-mono text-white font-bold transition shadow-md shadow-red-600/30 cursor-pointer active:scale-95 shrink-0"
              title="Call 108 Emergency Ambulance Dispatch"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>108</span>
            </a>

            {/* Dark / Light Theme Toggle Pill */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 ${
                isDarkTheme
                  ? 'bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={`Switch to ${isDarkTheme ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Indicator Bar (When not on welcome screen) */}
        {currentRole !== 'welcome' && (
          <div className="md:hidden pb-2.5 pt-0.5">
            <div className={`flex items-center justify-between p-1.5 rounded-xl border w-full gap-2 text-xs ${
              isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setCurrentRole('welcome')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold shadow-xs transition cursor-pointer ${
                  isDarkTheme ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>

              {currentUser && (
                <span className={`font-mono text-[11px] font-bold px-2 ${
                  isDarkTheme ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  {currentUser.role.toUpperCase()} // {currentUser.uniqueRoleId}
                </span>
              )}

              {activeBooking?.patientUniqueId && (
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ID: {activeBooking.patientUniqueId}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
