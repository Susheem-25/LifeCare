import React from 'react';
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
  Layers,
  FileCheck
} from 'lucide-react';
import type { AppRole } from '../../types';

interface WelcomeScreenProps {
  onSelectRole: (role: AppRole) => void;
  onOpenPitchModal?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectRole, onOpenPitchModal }) => {
  const { hospitals } = useEmergency();

  // Quick stats summary
  const totalFreeBeds = hospitals.reduce((acc, h) => acc + h.beds.icuFree + h.beds.emergencyFree, 0);

  return (
    <div className="w-full space-y-10 py-6 sm:py-10 animate-fadeIn px-1 sm:px-2">
      {/* Hero Welcome Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-2xs">
          <HeartPulse className="w-4 h-4 text-red-600 animate-pulse" />
          <span>Zero-Wait Emergency Healthcare Operating System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">LifeCare</span>
        </h1>
        <p className="text-lg sm:text-2xl font-medium text-slate-600 font-sans">
          Caring for Lives. Every Second Saved Is a Life Preserved.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Select your portal to proceed. Seamlessly connecting citizen guardians, 108 emergency ambulance drivers, and hospital trauma centers with AI triage and atomic bed reservation.
        </p>
      </div>

      {/* Role Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {/* Card 1: Guardian */}
        <div 
          onClick={() => onSelectRole('guardian')}
          className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-red-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                Citizen Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Login as Guardian
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Emergency reporting for families and bystanders. Track active patients or register a new emergency with Sarvam AI voice triage.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Track existing patient by <strong>Patient ID</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Register new patient with <strong>Sarvam AI Voice</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Nearest priority hospital with available beds</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>DigiLocker ABHA medical history fetch</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full bg-red-600 group-hover:bg-red-700 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-red-600/25 cursor-pointer"
            >
              <span>Continue as Guardian</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Driver */}
        <div 
          onClick={() => onSelectRole('driver')}
          className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Ambulance className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                108 Emergency Network
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Login as Driver
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Paramedic cockpit interface. Login with Driver Badge ID, enter Patient ID, and access direct navigation straight to the allocated hospital ER bay.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Driver Unique ID authentication</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Enter/Link Patient ID for instant mission</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Live map straight to destination ER bay</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Turn-by-turn routing with Google Maps</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full bg-amber-600 group-hover:bg-amber-700 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-amber-600/25 cursor-pointer"
            >
              <span>Continue as Paramedic Driver</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 3: Hospital */}
        <div 
          onClick={() => onSelectRole('hospital')}
          className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ER Command Center
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Login as Hospital
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hospital staff portal. Login with Unique Hospital ID to manage editable beds, doctor rosters (Free/Busy/Absent), equipment, and patient admissions.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Editable Bed counts (Total, ICU, Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Doctors: Free, Busy, Absent + Add Doctor</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Facilities & Machines: Add / Remove</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Patient tabs: Incoming, Admitted, Discharged</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full bg-emerald-600 group-hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-600/25 cursor-pointer"
            >
              <span>Continue as Hospital ER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Architecture Capability Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 mx-4 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>National Healthcare Grid Integration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Sarvam AI Indic Speech, Neo4j Graph Resource Engine, and ABDM DigiLocker
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {onOpenPitchModal && (
              <button
                type="button"
                onClick={onOpenPitchModal}
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Architecture & Pitch</span>
              </button>
            )}
            <a
              href="tel:112"
              className="inline-flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl font-bold border border-red-200 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Emergency 112</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-red-600 font-bold font-mono text-[11px]">
              <Zap className="w-3.5 h-3.5" />
              <span>&lt;9ms Graph Lock</span>
            </div>
            <div className="text-slate-900 font-extrabold text-sm">Neo4j AuraDB</div>
            <p className="text-[11px] text-slate-500">Atomic bed, doctor & machine reservation</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-600 font-bold font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0% Gate Rejection</span>
            </div>
            <div className="text-slate-900 font-extrabold text-sm">{totalFreeBeds} ER Beds Live</div>
            <p className="text-[11px] text-slate-500">Across 3 top trauma hospitals in Delhi NCR</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-600 font-bold font-mono text-[11px]">
              <Mic className="w-3.5 h-3.5" />
              <span>Sarvam AI Engine</span>
            </div>
            <div className="text-slate-900 font-extrabold text-sm">Voice STT & TTS</div>
            <p className="text-[11px] text-slate-500">Bhashini Indic voice triage in 7 languages</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-600 font-bold font-mono text-[11px]">
              <FileCheck className="w-3.5 h-3.5" />
              <span>ABHA & DigiLocker</span>
            </div>
            <div className="text-slate-900 font-extrabold text-sm">0 Sec Intake</div>
            <p className="text-[11px] text-slate-500">Pre-admit records & PM-JAY verification</p>
          </div>
        </div>
      </div>
    </div>
  );
};
