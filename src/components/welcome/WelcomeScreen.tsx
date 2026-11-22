import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  HeartPulse, 
  Ambulance, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  Sparkles, 
  PhoneCall, 
  Zap, 
  FileCheck,
  Loader2,
  ShieldAlert,
  Activity,
  Radio
} from 'lucide-react';
import type { AppRole } from '../../types';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface WelcomeScreenProps {
  onSelectRole: (role: AppRole) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectRole }) => {
  const { hospitals, currentUser, loginWithGoogle, theme } = useEmergency();
  const [authenticatingRole, setAuthenticatingRole] = useState<AppRole | null>(null);
  const [authError, setAuthError] = useState<string>('');

  const isDark = theme === 'dark';

  // Quick stats summary
  const totalFreeBeds = hospitals.reduce((acc, h) => acc + (h.beds?.icuFree || 0) + (h.beds?.emergencyFree || 0), 0);

  const handleSelectRole = async (role: AppRole) => {
    setAuthError('');
    if (currentUser) {
      if (currentUser.role === role) {
        onSelectRole(role);
      }
      return;
    }

    setAuthenticatingRole(role);
    try {
      await loginWithGoogle(role);
      onSelectRole(role);
    } catch (err: unknown) {
      console.warn('[WelcomeScreen] Google Sign-In error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Google Sign-In failed or was cancelled.';
      setAuthError(errorMsg);
    } finally {
      setAuthenticatingRole(null);
    }
  };

  return (
    <div className={`w-full space-y-8 py-4 sm:py-6 animate-fadeIn transition-colors duration-300 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
      {/* HERO OS IDENTITY */}
      <div className="text-center space-y-4 max-w-4xl mx-auto px-4 pt-2">
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border ${
          isDark
            ? 'bg-red-950/60 border-red-800/70 text-red-400'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>AUTONOMOUS EMERGENCY HEALTHCARE OPERATING SYSTEM</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">Care</span>
        </h1>

        <p className={`text-base sm:text-xl font-medium max-w-2xl mx-auto ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Caring for Lives. Every Second Saved Is a Life Preserved.
        </p>
      </div>

      {/* Authentication Error Banner */}
      {authError && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-950/70 border border-red-800 text-red-200 rounded-2xl p-4 flex items-center space-x-3 text-xs shadow-xl animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="font-bold block text-red-300">Access Restricted</strong>
              <span>{authError}</span>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated Role Status Banner */}
      {currentUser && (
        <div className="max-w-2xl mx-auto px-4">
          <div className={`border rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-lg ${
            isDark ? 'bg-[#090d19] border-emerald-800/80 text-zinc-200' : 'bg-emerald-50 border-emerald-200 text-slate-800'
          }`}>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Active Session: <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.displayName}</strong> ({currentUser.uniqueRoleId})
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase shrink-0 border ${
              isDark ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : 'bg-white border-emerald-300 text-emerald-800'
            }`}>
              {currentUser.role} Authenticated
            </span>
          </div>
        </div>
      )}

      {/* 3. THREE OPERATIONAL COCKPIT TERMINALS */}
      <div className={currentUser ? "max-w-xl mx-auto px-4" : "grid grid-cols-1 md:grid-cols-3 gap-6 px-4"}>
        
        {/* ========================================================
            TERMINAL 01: CITIZEN GUARDIAN
            ======================================================== */}
        {(!currentUser || currentUser.role === 'guardian') && (
          <div
            onClick={() => handleSelectRole('guardian')}
            className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden macos-glass ${
              isDark
                ? 'macos-glass-dark hover:border-red-500/70 hover:shadow-red-500/20'
                : 'macos-glass-light hover:border-red-400 hover:shadow-red-500/10'
            }`}
          >
            {/* Ambient Corner Accents */}
            <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform ${isDark ? 'bg-red-600/10' : 'bg-red-500/5'}`}></div>
            <div className={`absolute top-3 right-3 text-[10px] font-mono select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              [ 01 // CITIZEN ]
            </div>

            <div className="space-y-5 relative z-10">
              {/* Terminal Badge & Status */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-all border ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-red-500 group-hover:border-red-500/50'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  isDark ? 'bg-red-950/60 border-red-800/60 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <Radio className="w-3 h-3 animate-pulse text-red-500" />
                  <span>RAPID TRIAGE</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  TERMINAL_01 // PUBLIC ADMISSION
                </span>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Guardian Portal
                </h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Emergency triage for family members & bystanders. Instant ABHA history uplink, Sarvam AI voice diagnosis, and nearest bed lock.
                </p>
              </div>

              {/* Module Specs Grid */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-[11px] font-mono">
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[AI_TRIAGE]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Sarvam Voice (Hindi / Eng)</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[BED_LOCK]</span>
                  <span className="text-emerald-500 font-semibold">&lt;10ms Atomic Lock</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[ABHA_SYNC]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Instant Health ID</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[ROUTE]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Priority ER Corridor</span>
                </div>
              </div>
            </div>

            {/* Terminal Action Button */}
            <div className={`relative z-10 mt-6 pt-4 border-t space-y-2.5 ${isDark ? 'border-zinc-800/80' : 'border-slate-100'}`}>
              <button
                type="button"
                disabled={authenticatingRole !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('guardian');
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold text-xs font-mono flex items-center justify-center space-x-2 transition shadow-lg shadow-red-600/25 cursor-pointer disabled:opacity-60"
              >
                {authenticatingRole === 'guardian' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : currentUser ? (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>
                  {authenticatingRole === 'guardian'
                    ? 'Connecting to Google...'
                    : currentUser
                    ? 'Enter Guardian Terminal'
                    : 'Initialize Guardian Session'}
                </span>
              </button>

              <div className={`flex items-center justify-between text-[10px] font-mono px-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                <span>AUTH: GOOGLE OAUTH 2.0</span>
                <span className="text-emerald-500 font-bold">ENCRYPTED</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TERMINAL 02: 108 AMBULANCE COCKPIT
            ======================================================== */}
        {(!currentUser || currentUser.role === 'driver') && (
          <div
            onClick={() => handleSelectRole('driver')}
            className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden macos-glass ${
              isDark
                ? 'macos-glass-dark hover:border-amber-500/70 hover:shadow-amber-500/20'
                : 'macos-glass-light hover:border-amber-400 hover:shadow-amber-500/10'
            }`}
          >
            {/* Ambient Corner Accents */}
            <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform ${isDark ? 'bg-amber-600/10' : 'bg-amber-500/5'}`}></div>
            <div className={`absolute top-3 right-3 text-[10px] font-mono select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              [ 02 // AMBULANCE ]
            </div>

            <div className="space-y-5 relative z-10">
              {/* Terminal Badge & Status */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-all border ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-amber-500 group-hover:border-amber-500/50'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}>
                  <Ambulance className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  isDark ? 'bg-amber-950/60 border-amber-800/60 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <Radio className="w-3 h-3 animate-pulse text-amber-500" />
                  <span>FLEET TELEMETRY</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  TERMINAL_02 // PARAMEDIC MOBILE ICU
                </span>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  108 Driver Cockpit
                </h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Paramedic tactical navigation console. Turn-by-turn emergency routing, in-transit vital signs telemetry, and direct ER bay bypass.
                </p>
              </div>

              {/* Module Specs Grid */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-[11px] font-mono">
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[CORRIDOR]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Priority GPS Routing</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[TELEMETRY]</span>
                  <span className="text-cyan-500 font-semibold">Real-Time Vitals Stream</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[BAY_BYPASS]</span>
                  <span className="text-emerald-500 font-semibold">Zero-Wait Gate Admission</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[VEHICLE_ID]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>ACLS / BLS Verified</span>
                </div>
              </div>
            </div>

            {/* Terminal Action Button */}
            <div className={`relative z-10 mt-6 pt-4 border-t space-y-2.5 ${isDark ? 'border-zinc-800/80' : 'border-slate-100'}`}>
              <button
                type="button"
                disabled={authenticatingRole !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('driver');
                }}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black py-3 rounded-2xl font-bold text-xs font-mono flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-600/25 cursor-pointer disabled:opacity-60"
              >
                {authenticatingRole === 'driver' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : currentUser ? (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>
                  {authenticatingRole === 'driver'
                    ? 'Connecting to Google...'
                    : currentUser
                    ? 'Enter Driver Cockpit'
                    : 'Initialize 108 Cockpit'}
                </span>
              </button>

              <div className={`flex items-center justify-between text-[10px] font-mono px-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                <span>AUTH: GOOGLE OAUTH 2.0</span>
                <span className="text-emerald-500 font-bold">FLEET VERIFIED</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TERMINAL 03: HOSPITAL ER COMMAND
            ======================================================== */}
        {(!currentUser || currentUser.role === 'hospital') && (
          <div
            onClick={() => handleSelectRole('hospital')}
            className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden macos-glass ${
              isDark
                ? 'macos-glass-dark hover:border-emerald-500/70 hover:shadow-emerald-500/20'
                : 'macos-glass-light hover:border-emerald-400 hover:shadow-emerald-500/10'
            }`}
          >
            {/* Ambient Corner Accents */}
            <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-500/5'}`}></div>
            <div className={`absolute top-3 right-3 text-[10px] font-mono select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              [ 03 // HOSPITAL ]
            </div>

            <div className="space-y-5 relative z-10">
              {/* Terminal Badge & Status */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-all border ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 text-emerald-400 group-hover:border-emerald-500/50'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  isDark ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                  <span>COMMAND HEADQUARTERS</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  TERMINAL_03 // TRAUMA CENTER
                </span>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hospital ER Command
                </h2>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Emergency department command center. Real-time ICU/ventilator capacity, on-duty specialist doctor rosters, and pre-arrival telemetry.
                </p>
              </div>

              {/* Module Specs Grid */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-[11px] font-mono">
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[BED_MESH]</span>
                  <span className="text-emerald-500 font-semibold">Live ICU / ER Capacity</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[DOCTOR_GRID]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>On-Duty Specialist Roster</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[EQUIPMENT]</span>
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Life-Support Machinery</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-xl border macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
                  <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>[PRE_ALERT]</span>
                  <span className="text-cyan-500 font-semibold">Incoming Telemetry Feed</span>
                </div>
              </div>
            </div>

            {/* Terminal Action Button */}
            <div className={`relative z-10 mt-6 pt-4 border-t space-y-2.5 ${isDark ? 'border-zinc-800/80' : 'border-slate-100'}`}>
              <button
                type="button"
                disabled={authenticatingRole !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('hospital');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-bold text-xs font-mono flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-60"
              >
                {authenticatingRole === 'hospital' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : currentUser ? (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>
                  {authenticatingRole === 'hospital'
                    ? 'Connecting to Google...'
                    : currentUser
                    ? 'Enter Hospital Command'
                    : 'Initialize Hospital Terminal'}
                </span>
              </button>

              <div className={`flex items-center justify-between text-[10px] font-mono px-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                <span>AUTH: GOOGLE OAUTH 2.0</span>
                <span className="text-emerald-500 font-bold">TRAUMA VALIDATED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. SYSTEM SPECIFICATIONS & NATIONAL GRID TELEMETRY */}
      <div className={`rounded-3xl p-6 sm:p-8 mx-4 space-y-6 macos-glass ${
        isDark ? 'macos-glass-dark' : 'macos-glass-light'
      }`}>
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b ${
          isDark ? 'border-zinc-800/80' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-base font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                NATIONAL HEALTHCARE GRID SPECIFICATION
              </h3>
            </div>
            <p className={`text-xs mt-1 font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Autonomous Cloud Resource Engine • Multi-Region Firestore Cluster • HL7/FHIR Telemetry
            </p>
          </div>

          <div className="flex items-center space-x-2.5 text-xs font-mono">
            <a
              href="tel:108"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl font-bold transition shadow-md shadow-red-600/30"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>DISPATCH: 108</span>
            </a>
            <a
              href="tel:112"
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition border ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-red-400 border-red-900/80'
                  : 'bg-rose-50 hover:bg-rose-100 text-red-700 border-red-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>HELPLINE: 112</span>
            </a>
          </div>
        </div>

        {/* 4 Metric Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
          <div className={`p-4 rounded-2xl border space-y-1.5 macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
            <div className="flex items-center space-x-1.5 text-red-500 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>ATOMIC BED MESH</span>
            </div>
            <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>&lt;10ms Latency</div>
            <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Deterministic cloud resource reservation</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
            <div className="flex items-center space-x-1.5 text-emerald-500 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LIVE TRAUMA BEDS</span>
            </div>
            <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalFreeBeds} Beds Online</div>
            <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Aggregated across all registered centers</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
            <div className="flex items-center space-x-1.5 text-cyan-500 text-[11px] font-bold">
              <Mic className="w-3.5 h-3.5" />
              <span>SARVAM INDIC AI</span>
            </div>
            <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Hindi & English</div>
            <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Sub-second emergency speech-to-triage</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 macos-glass-inner ${isDark ? 'macos-glass-inner-dark' : 'macos-glass-inner-light'}`}>
            <div className="flex items-center space-x-1.5 text-purple-500 text-[11px] font-bold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>ZERO-WAIT RECEPTION</span>
            </div>
            <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Instant QR Intake</div>
            <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Contactless reception ER gate clearance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
