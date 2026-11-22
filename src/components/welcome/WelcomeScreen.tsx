import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  Search, 
  ShieldAlert, 
  Activity, 
  X
} from 'lucide-react';
import { startVoiceSos, stopVoiceSos } from '../../utils/speechService';
import type { AppRole } from '../../types';

interface WelcomeScreenProps {
  onSelectRole: (role: AppRole) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectRole }) => {
  const { hospitals, currentUser, searchEmergency, theme } = useEmergency();
  const [authError] = useState<string>('');

  // Search & Speech-to-Text State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [audioVolume, setAudioVolume] = useState<number>(0);

  const isDark = theme === 'dark';

  // Quick stats summary
  const totalFreeBeds = hospitals.reduce(
    (acc, h) => acc + (h.beds?.icuFree || 0) + (h.beds?.emergencyFree || 0),
    0
  );

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      stopVoiceSos();
    };
  }, []);

  // Directly bypasses guardian authentication and immediately shows results
  const handleEmergencySearch = (query: string) => {
    const clean = query.trim();
    if (!clean) {
      searchEmergency('Acute Emergency Triage');
    } else {
      searchEmergency(clean);
    }
    // Directly routes to guardian portal results without blocking on Google login
    onSelectRole('guardian');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmergencySearch(searchQuery);
  };

  const toggleListening = async () => {
    if (isListening) {
      await stopVoiceSos();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    await startVoiceSos({
      langCode: voiceLang,
      onTranscript: (text: string) => {
        setSearchQuery(text);
        if (text.trim().length > 2) {
          stopVoiceSos();
          setIsListening(false);
          handleEmergencySearch(text);
        }
      },
      onListeningChange: (listening: boolean) => setIsListening(listening),
      onVolumeChange: (vol: number) => setAudioVolume(vol),
      onError: (err: string) => {
        console.warn('[WelcomeScreen] Speech SOS error:', err);
        setIsListening(false);
      },
    });
  };

  const quickSymptoms = [
    { label: 'Chest Pain (Heart Attack)', icon: '⚡', query: 'Severe Acute Chest Pain Heart Attack Cardiac Arrest' },
    { label: 'Road Accident / Polytrauma', icon: '🚨', query: 'Road Traffic Accident Severe Trauma Blood Loss Fracture' },
    { label: 'Acute Stroke / Paralysis', icon: '🧠', query: 'Acute Brain Stroke Slurred Speech Facial Paralysis' },
    { label: 'ICU & Ventilator Required', icon: '🫁', query: 'Critical Respiratory Distress Emergency ICU Ventilator' },
    { label: 'Pediatric Emergency', icon: '👶', query: 'Pediatric Child Emergency Neonatal High Fever Seizure' },
    { label: 'Severe Burn Trauma', icon: '🔥', query: 'Third Degree Burns Plastic Surgery Emergency Trauma' },
  ];

  return (
    <div className={`w-full space-y-6 sm:space-y-8 py-4 sm:py-8 animate-fadeIn transition-colors duration-300 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
      
      {/* 1. HERO BRANDING */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4 pt-2 sm:pt-4">
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border ${
          isDark
            ? 'bg-red-950/60 border-red-800/70 text-red-400'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>AUTONOMOUS EMERGENCY HEALTHCARE NETWORK</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Life<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-600">Care</span>
        </h1>

        <p className={`text-base sm:text-xl font-medium max-w-2xl mx-auto ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Caring for Lives. Every Second Saved Is a Life Preserved.
        </p>

        {/* Live Network Health Status Pill */}
        <div className="flex items-center justify-center space-x-3 pt-0.5">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-2xs ${
            isDark ? 'bg-zinc-900/80 border-zinc-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{totalFreeBeds} ER & ICU Beds Available Live Across Network</span>
          </span>
        </div>
      </div>

      {/* 2. BEAUTIFUL EMERGENCY SEARCH PILL (Directly Below LifeCare - Bypasses Auth on Search) */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-3">
        <form
          onSubmit={handleFormSubmit}
          className={`relative rounded-full p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 border transition-all duration-300 backdrop-blur-2xl shadow-xl ${
            isDark
              ? 'bg-[#090e1c]/95 border-red-500/35 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/20 shadow-[0_12px_40px_-8px_rgba(220,38,38,0.25)]'
              : 'bg-white/95 border-red-200/90 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15 shadow-[0_12px_36px_-8px_rgba(220,38,38,0.18)]'
          }`}
        >
          {/* Glowing Search Icon */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>

          {/* Search Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, trauma center, ICU beds (English or हिन्दी)..."
            className={`flex-1 min-w-0 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Speech-to-Text Microphone Button */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Language Switcher Badge */}
            <button
              type="button"
              onClick={() => {
                const next = voiceLang === 'en-IN' ? 'hi-IN' : 'en-IN';
                setVoiceLang(next);
                try {
                  localStorage.setItem('lifecare_guardian_language', next);
                } catch {}
              }}
              className={`hidden xs:inline-flex items-center px-2 py-1 rounded-full text-[10px] font-mono font-extrabold border transition cursor-pointer ${
                isDark
                  ? 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Click to toggle Voice Language (English / हिन्दी)"
            >
              {voiceLang === 'hi-IN' ? 'हिन्दी' : 'EN'}
            </button>

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 sm:px-3 sm:py-2 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/40 shadow-lg shadow-red-600/40'
                  : isDark
                  ? 'bg-zinc-800 text-red-400 hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
              title={isListening ? 'Stop listening' : 'Speak emergency symptoms via Sarvam AI Voice SOS'}
            >
              <Mic className="w-4 h-4" />
              <span className="hidden md:inline font-mono">
                {isListening ? 'Listening...' : 'Voice SOS'}
              </span>
            </button>

            {/* Action / Submit Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center space-x-1.5 shadow-md shadow-red-600/30 cursor-pointer transition active:scale-95 shrink-0"
              title="Find nearest trauma center with guaranteed bed lock"
            >
              <span>Find ER</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </form>

        {/* Live Audio Visualizer Banner (When Voice SOS is active) */}
        {isListening && (
          <div className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn ${
            isDark ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>
                <strong>Recording Voice SOS ({voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'}):</strong> Speak symptoms, age, or emergency...
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {[15, 30, 45, 60, 75, 90].map((level, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    audioVolume >= level ? 'bg-emerald-500 h-4' : isDark ? 'bg-red-900 h-1.5' : 'bg-red-200 h-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Emergency Symptom Badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              ⚡ Instant 1-Tap Triage Bypass:
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              No Login Required to View Beds
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {quickSymptoms.map((symptom, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleEmergencySearch(symptom.query)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98 ${
                  isDark
                    ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-red-500/50'
                    : 'bg-white hover:bg-red-50/70 text-slate-700 hover:text-red-700 border-slate-200 hover:border-red-300'
                }`}
                title={`Instant triage search for ${symptom.label}`}
              >
                <span>{symptom.icon}</span>
                <span>{symptom.label}</span>
              </button>
            ))}
          </div>
        </div>
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
    </div>
  );
};
