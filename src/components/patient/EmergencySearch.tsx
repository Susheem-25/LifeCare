import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { PRESET_EMERGENCIES, SAMPLE_ABHA_PROFILES } from '../../data/mockData';
import { 
  Search, 
  Mic, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Stethoscope, 
  Activity, 
  CheckCircle2, 
  Flame,
  CarFront,
  Brain,
  Wind,
  Baby,
  HeartPulse,
  CreditCard,
  AlertTriangle,
  UserCheck,
  X,
  Droplet,
  ShieldCheck,
  Languages,
  Ambulance,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { SARVAM_SUPPORTED_LANGUAGES } from '../../data/trackMockData';
import { Neo4jGraphExplorer } from './Neo4jGraphExplorer';
import { fastScrollTo } from '../../utils/scrollHelper';

export const EmergencySearch: React.FC = () => {
  const { 
    searchEmergency, 
    currentTriage, 
    selectedAbhaProfile, 
    setSelectedAbhaProfile, 
    fetchPatientByAbha,
    activeBooking,
    setCurrentView
  } = useEmergency();

  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [brief, setBrief] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  const currentLang = SARVAM_SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SARVAM_SUPPORTED_LANGUAGES[0];
  
  // ABHA ID fetch state
  const [abhaInput, setAbhaInput] = useState<string>('91-4820-9182-3921');
  const [abhaError, setAbhaError] = useState<string>('');
  const [isAbhaLoading, setIsAbhaLoading] = useState<boolean>(false);

  const handleSearch = (textToAnalyze?: string) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : brief).trim() || currentLang.samplePrompt;
    if (!brief.trim()) {
      setBrief(text);
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      searchEmergency(text);
      setIsAnalyzing(false);

      // Fast-scroll down to open the matching ER & Doctors section
      setTimeout(() => {
        fastScrollTo('hospital-match-list', 85);
      }, 50);
    }, 320);
  };

  const handleSelectPreset = (preset: typeof PRESET_EMERGENCIES[0]) => {
    setBrief(preset.brief);
    handleSearch(preset.brief);
  };

  const handleFetchAbha = (idToLookup?: string) => {
    const target = (idToLookup || abhaInput).trim();
    if (!target) {
      setAbhaError('Please enter a 14-digit ABHA ID');
      return;
    }

    setIsAbhaLoading(true);
    setAbhaError('');

    setTimeout(() => {
      const found = fetchPatientByAbha(target);
      setIsAbhaLoading(false);
      if (!found) {
        setAbhaError(`No record found for ABHA ID "${target}". Try a preset profile below.`);
      }
    }, 300);
  };

  const handleSelectAbhaPreset = (id: string) => {
    setAbhaInput(id);
    handleFetchAbha(id);
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    const simulatedVoice = currentLang.samplePrompt;
    let i = 0;
    setBrief('');
    const interval = setInterval(() => {
      setBrief(simulatedVoice.substring(0, i + 2));
      i += 2;
      if (i >= simulatedVoice.length) {
        clearInterval(interval);
        setIsRecording(false);
        handleSearch(simulatedVoice);
      }
    }, 20);
  };

  const copyBookingCode = () => {
    if (!activeBooking) return;
    navigator.clipboard.writeText(activeBooking.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      case 'CarFront': return <CarFront className="w-3.5 h-3.5 text-slate-600" />;
      case 'Brain': return <Brain className="w-3.5 h-3.5 text-slate-600" />;
      case 'Wind': return <Wind className="w-3.5 h-3.5 text-slate-600" />;
      case 'Baby': return <Baby className="w-3.5 h-3.5 text-slate-600" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-slate-600" />;
      default: return <Activity className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Liquid Glass Hero Intake Card */}
      <div className="relative rounded-3xl liquid-glass-card border border-white/90 p-6 sm:p-8 oled-glow-red overflow-hidden shadow-xl bg-white/75 backdrop-blur-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/[0.08] rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 dot-pulse"></span>
            <span>AI EMERGENCY TRIAGE & ZERO-WAIT BED RESERVATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Medical Emergency Response.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Speak or type symptoms in your native language. Our clinical engine analyzes severity in &lt;500ms and immediately pre-reserves an ICU bed, on-duty specialist, and verified machinery at the nearest trauma center.
          </p>
        </div>

        {/* Input Interface with Built-In Sarvam Indic Language Bar */}
        <div className="mt-6 space-y-4">
          {/* Integrated Language Selection Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Languages className="w-4 h-4 text-rose-600" />
              <span>SOS Language / भाषा:</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold hidden md:inline">
                Sarvam Indic Voice AI
              </span>
            </div>

            {/* Language Selector Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {SARVAM_SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang.code);
                      if (!brief.trim() || SARVAM_SUPPORTED_LANGUAGES.some(l => l.samplePrompt === brief)) {
                        setBrief(lang.samplePrompt);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'liquid-btn-red text-white shadow-xs font-bold scale-105'
                        : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-2xs'
                    }`}
                    title={`Switch SOS language to ${lang.name}`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                      ({lang.name.replace(' (Indian)', '')})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search / Voice Input Box */}
          <div className="relative rounded-2xl bg-white/90 border border-slate-200/90 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all p-3 shadow-inner">
            {/* Live Audio Equalizer Waveform while Voice SOS is dictating */}
            {isRecording && (
              <div className="mb-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 via-rose-100/50 to-rose-50 border border-rose-200/80 flex items-center justify-between text-xs font-mono text-rose-700 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span className="font-bold">Sarvam Saaras ASR: Transcribing in {currentLang.nativeName} ({currentLang.name})...</span>
                </div>
                <div className="flex items-center gap-1 h-4 pr-1">
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 bg-rose-600 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }}></span>
                  <span className="w-1 bg-rose-600 rounded-full animate-bounce h-4" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-2" style={{ animationDelay: '100ms' }}></span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-start sm:items-center gap-3 px-2 py-1">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mt-2 sm:mt-0" />
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder={`Describe emergency in ${currentLang.nativeName} (${currentLang.name}) or type in English...`}
                  rows={2}
                  className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm resize-none focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={simulateVoiceInput}
                  disabled={isRecording}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs'
                  }`}
                  title={`Simulate Sarvam Saaras Voice Dictation in ${currentLang.nativeName}`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-white animate-bounce' : 'text-rose-600'}`} />
                  <span>{isRecording ? 'Listening...' : `Voice SOS (${currentLang.nativeName})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isAnalyzing}
                  className="liquid-btn-red px-5 py-2.5 rounded-xl text-white font-bold text-xs tracking-tight flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                  title="Find Ready ER & Doctors (Fast-scrolls to Hospital Match List)"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Find Ready ER & Doctors</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick 1-Click Voice Dictation Helper */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-slate-700">Sample {currentLang.nativeName} SOS:</span>
                <span className="italic text-slate-600 truncate max-w-md">"{currentLang.samplePrompt}"</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBrief(currentLang.samplePrompt);
                  handleSearch(currentLang.samplePrompt);
                }}
                className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>⚡ Fill & Test {currentLang.nativeName} Prompt</span>
              </button>
            </div>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
              Or Select Immediate Emergency Preset:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PRESET_EMERGENCIES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center space-x-2 p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-rose-300 text-left transition text-xs cursor-pointer group active:scale-95 shadow-2xs hover:shadow-xs"
                >
                  <div className="p-1 rounded-lg bg-rose-50 border border-rose-100 shrink-0">
                    {getPresetIcon(preset.icon)}
                  </div>
                  <span className="text-slate-700 font-medium group-hover:text-slate-900 truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ABHA ID PATIENT DATA INTEGRATION (FETCH DATA USING ABHA ID) */}
      <div 
        id="patient-info-abha-section" 
        className="rounded-3xl liquid-glass-card border border-white/90 p-5 sm:p-6 space-y-4 shadow-md bg-white/75 backdrop-blur-xl scroll-mt-24 transition-all duration-300 ring-2 ring-emerald-500/20"
      >
        {/* Live Active Emergency Bed Lock Banner (Visible when booked) */}
        {activeBooking && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-white/80 to-teal-500/15 border-2 border-emerald-500/40 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Bed Reserved & Linked to ABHA
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {activeBooking.reservedBay}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {activeBooking.hospitalName}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Driver Booking Code */}
                <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 shadow-2xs font-mono text-xs">
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Driver Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-rose-600 text-sm tracking-wider">{activeBooking.bookingCode}</span>
                    <button
                      type="button"
                      onClick={copyBookingCode}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Driver Code"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                
                {/* Patient Unique ID */}
                <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 shadow-2xs font-mono text-xs">
                  <span className="text-slate-500 text-[10px] uppercase block font-semibold">Patient ID:</span>
                  <span className="font-bold text-slate-900 text-xs">{activeBooking.patientUniqueId}</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
              <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dot-pulse"></span>
                <span>Ambulance crew & hospital ER staff can see this ABHA profile in real-time.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('ambulance')}
                  className="liquid-btn-red px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Ambulance className="w-3.5 h-3.5 text-white" />
                  <span>Open Driver Cockpit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('hospital')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hospital ER Console</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold">
                  National Digital Health Mission
                </span>
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                  ABDM Verified
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Patient Info & ABHA Digital Health Record
              </h3>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Directly attaches blood group, allergies & PM-JAY ₹5L cashless cover
          </div>
        </div>

        {/* ABHA Input Form & Quick Chips */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
                placeholder="Enter 14-digit ABHA ID (e.g. 91-4820-9182-3921)"
                className="w-full bg-white text-slate-900 font-mono text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:outline-none shadow-2xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFetchAbha();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleFetchAbha()}
              disabled={isAbhaLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              {isAbhaLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching ABDM...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Fetch Patient Record</span>
                </>
              )}
            </button>
          </div>

          {abhaError && (
            <div className="text-xs text-rose-600 font-mono bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{abhaError}</span>
            </div>
          )}

          {/* Quick 1-Tap ABHA Test Profiles */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[11px] text-slate-500 font-medium">Quick Test Profiles:</span>
            {SAMPLE_ABHA_PROFILES.map((profile) => (
              <button
                key={profile.abhaId}
                type="button"
                onClick={() => handleSelectAbhaPreset(profile.abhaId)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                  selectedAbhaProfile?.abhaId === profile.abhaId
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{profile.fullName}</span>
                <span className="text-slate-400 text-[10px]">({profile.bloodGroup.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected ABHA Profile Badge Card */}
        {selectedAbhaProfile && (
          <div className="mt-3 p-4 rounded-2xl bg-white/90 border border-emerald-200 space-y-3 animate-fadeIn shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-sm">
                  {selectedAbhaProfile.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedAbhaProfile.fullName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>ABDM VERIFIED</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>ABHA ID: <strong className="text-slate-800">{selectedAbhaProfile.abhaId}</strong></span>
                    <span>•</span>
                    <span>{selectedAbhaProfile.age} Yrs, {selectedAbhaProfile.gender}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-bold flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-rose-600" />
                  <span>Blood: {selectedAbhaProfile.bloodGroup}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedAbhaProfile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Unlink ABHA Record"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Medical Insights & Insurance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Critical Drug Allergies Alert */}
              <div className="bg-slate-50 p-3 rounded-xl border border-rose-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Known Drug Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedAbhaProfile.knownAllergies.map((allg, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-semibold"
                    >
                      ⚠️ {allg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions & Past Surgeries */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-500" />
                  <span>Chronic History</span>
                </div>
                <div className="text-slate-700 text-[11px] leading-tight font-medium">
                  {selectedAbhaProfile.chronicConditions.join(', ')}
                </div>
                {selectedAbhaProfile.pastSurgeries.length > 0 && (
                  <div className="text-slate-500 text-[10px] font-mono pt-1">
                    Past: {selectedAbhaProfile.pastSurgeries.join(', ')}
                  </div>
                )}
              </div>

              {/* Insurance & PM-JAY Cashless Cover */}
              <div className="bg-slate-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-600" />
                  <span>Ayushman PM-JAY Cover</span>
                </div>
                <div className="text-slate-900 font-mono font-bold text-xs flex items-center gap-1">
                  <span>₹{(selectedAbhaProfile.coverageAmountINR).toLocaleString('en-IN')} Cashless</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-bold">100% COVERED</span>
                </div>
                <div className="text-slate-500 text-[10px] font-mono truncate">
                  {selectedAbhaProfile.insuranceProvider}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>This ABDM record will automatically attach to your emergency hospital bed reservation.</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Clinical Diagnostic HUD */}
      {currentTriage && (
        <div className="space-y-6">
          <div className="rounded-3xl liquid-glass-card border border-white/90 p-6 oled-glow-red space-y-4 shadow-xl bg-white/75 backdrop-blur-xl">
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 font-bold">
                      AI Clinical Triage Assessment
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded bg-white">
                      {currentTriage.icdCodeEstimate}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      {currentTriage.aiConfidenceScore}% Match
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {currentTriage.detectedCondition}
                  </h2>
                </div>
              </div>

              {/* Golden Hour Countdown Box */}
              <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 shadow-2xs">
                <Clock className="w-4 h-4 text-rose-600 animate-spin" />
                <div>
                  <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">Golden Window</div>
                  <div className="text-xs font-mono font-bold text-rose-700">
                    &lt; {currentTriage.goldenHourWindowMinutes} mins to Needle / Balloon
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Column Diagnostic Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Pathology Summary */}
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="font-mono text-[10px] uppercase text-slate-600 tracking-wider font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clinical Pathology</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {currentTriage.summary}
                </p>
              </div>

              {/* Mandatory Specialists & Machinery */}
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                <div>
                  <div className="font-mono text-[10px] uppercase text-slate-600 tracking-wider font-bold flex items-center gap-1.5 mb-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mandatory Specialists (Must be Free)</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentTriage.recommendedSpeciality.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] uppercase text-slate-600 tracking-wider font-bold flex items-center gap-1.5 mb-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Required Ready Machinery</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentTriage.requiredMachinery.map((mach, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                      >
                        ⚡ {mach}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Immediate Bystander First-Aid */}
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="font-mono text-[10px] uppercase text-slate-600 tracking-wider font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Immediate First-Aid (Do this NOW)</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 text-xs">
                  {currentTriage.firstAidImmediateInstructions.slice(0, 3).map((instr, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-mono font-bold">{idx + 1}.</span>
                      <span>{instr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Neo4j Knowledge Graph & Cypher Engine directly below Triage */}
          <Neo4jGraphExplorer />
        </div>
      )}
    </div>
  );
};
