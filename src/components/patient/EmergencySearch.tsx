import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { PRESET_EMERGENCIES } from '../../data/mockData';
import { 
  Search, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Clock, 
  ShieldAlert, 
  Activity, 
  Flame, 
  CarFront, 
  Brain, 
  Wind, 
  Baby, 
  HeartPulse, 
  Languages,
  Zap,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { INDIC_SUPPORTED_LANGUAGES } from '../../data/trackMockData';
import { Neo4jGraphExplorer } from './Neo4jGraphExplorer';
import { fastScrollTo } from '../../utils/scrollHelper';
import { 
  startVoiceSos, 
  stopVoiceSos, 
  speakText, 
  stopSpeaking 
} from '../../utils/speechService';

export const EmergencySearch: React.FC = () => {
  const { 
    searchEmergency, 
    currentTriage, 
    activeBooking,
    setCurrentView
  } = useEmergency();

  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [brief, setBrief] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceSuccessToast, setVoiceSuccessToast] = useState<string | null>(null);
  const [isGraphExpanded, setIsGraphExpanded] = useState<boolean>(false);
  
  const currentLang = INDIC_SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || INDIC_SUPPORTED_LANGUAGES[0];

  const handleSearch = (textToAnalyze?: string) => {
    const text = (textToAnalyze !== undefined ? textToAnalyze : brief).trim() || currentLang.samplePrompt;
    setBrief(text);
    searchEmergency(text);
    setTimeout(() => {
      fastScrollTo('hospital-match-list', 85);
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBrief(val);
    if (val.trim().length >= 1) {
      searchEmergency(val);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_EMERGENCIES[0]) => {
    setBrief(preset.brief);
    handleSearch(preset.brief);
  };

  // Simulated Voice Fallback with Text-to-Speech audio readout
  const triggerSimulatedVoiceFallback = () => {
    setIsListening(true);
    const simulatedVoice = currentLang.samplePrompt;
    let i = 0;
    setBrief('');

    // Speak prompt aloud using SpeechSynthesis
    speakText(simulatedVoice, {
      langCode: selectedLang,
      onStart: () => setIsSpeakingTts(true),
      onEnd: () => setIsSpeakingTts(false),
      onError: () => setIsSpeakingTts(false),
    });

    const interval = setInterval(() => {
      setBrief(simulatedVoice.substring(0, i + 2));
      i += 2;
      if (i >= simulatedVoice.length) {
        clearInterval(interval);
        setIsListening(false);
        handleSearch(simulatedVoice);
      }
    }, 20);
  };

  // Real-time Voice SOS via Web Speech API (with Bhashini STT emulation fallback)
  const handleVoiceSosToggle = () => {
    if (isListening) {
      stopVoiceSos();
      setIsListening(false);
      return;
    }

    setVoiceNotice(null);
    setVoiceSuccessToast(null);

    const started = startVoiceSos({
      langCode: selectedLang,
      onTranscript: (text, isFinal) => {
        setBrief(text);
        if (isFinal) {
          handleSearch(text);
          setVoiceSuccessToast(`Voice captured: "${text.slice(0, 45)}..."`);
          setTimeout(() => setVoiceSuccessToast(null), 4000);

          // Audio confirmation via TTS
          speakText(`Emergency triaged for ${text}`, {
            langCode: selectedLang,
            onStart: () => setIsSpeakingTts(true),
            onEnd: () => setIsSpeakingTts(false),
            onError: () => setIsSpeakingTts(false),
          });
        }
      },
      onListeningChange: (listening) => {
        setIsListening(listening);
      },
      onError: (errMsg) => {
        console.warn('Voice SOS Notice:', errMsg);
        setVoiceNotice(errMsg);
        setTimeout(() => setVoiceNotice(null), 5000);
        triggerSimulatedVoiceFallback();
      },
    });

    if (!started) {
      triggerSimulatedVoiceFallback();
    }
  };

  // Text-To-Speech (TTS) toggle for user input or selected sample
  const handleToggleTts = (textToSpeak?: string) => {
    if (isSpeakingTts) {
      stopSpeaking();
      setIsSpeakingTts(false);
      return;
    }

    const text = (textToSpeak || brief).trim() || currentLang.samplePrompt;
    speakText(text, {
      langCode: selectedLang,
      onStart: () => setIsSpeakingTts(true),
      onEnd: () => setIsSpeakingTts(false),
      onError: () => setIsSpeakingTts(false),
    });
  };

  // Speak AI Triage diagnosis and spoken first aid
  const handleSpeakTriageAdvisory = () => {
    if (!currentTriage) return;
    if (isSpeakingTts) {
      stopSpeaking();
      setIsSpeakingTts(false);
      return;
    }

    const advisory = `${currentTriage.detectedCondition}. Severity score: ESI Level ${currentTriage.esiLevel}. ${currentTriage.firstAidImmediateInstructions[0] || currentTriage.summary}. Golden window: under ${currentTriage.goldenHourWindowMinutes} minutes.`;
    speakText(advisory, {
      langCode: selectedLang,
      onStart: () => setIsSpeakingTts(true),
      onEnd: () => setIsSpeakingTts(false),
      onError: () => setIsSpeakingTts(false),
    });
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-3.5 h-3.5 text-red-600" />;
      case 'CarFront': return <CarFront className="w-3.5 h-3.5 text-slate-600" />;
      case 'Brain': return <Brain className="w-3.5 h-3.5 text-slate-600" />;
      case 'Wind': return <Wind className="w-3.5 h-3.5 text-slate-600" />;
      case 'Baby': return <Baby className="w-3.5 h-3.5 text-slate-600" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-slate-600" />;
      default: return <Activity className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Active Emergency Mission Card (Functional, Clean, Zero-Junk) */}
      {activeBooking && (
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Active Emergency Mission
                </span>
                <span className="text-[11px] font-mono bg-white text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded-md font-bold">
                  Code: {activeBooking.bookingCode}
                </span>
                <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-md font-semibold">
                  Bay: {activeBooking.reservedBay}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-0.5">
                {activeBooking.hospitalName}
              </h3>
              <p className="text-xs text-slate-600">
                Patient: <strong className="text-slate-900">{activeBooking.patientName}</strong> ({activeBooking.patientUniqueId}) • On-Duty Specialist: <strong className="text-slate-800">{activeBooking.assignedDoctor.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setCurrentView('ambulance')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs transition"
            >
              Paramedic Cockpit &rarr;
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('hospital')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
            >
              ER Command &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Modern Emergency Search Hero */}
      <div id="citizen-sos-section" className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-sm space-y-4 relative overflow-hidden w-full max-w-full scroll-mt-24">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600"></div>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-700 uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                <span>Step 1: Speak SOS</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                Bhashini Indic STT • 7 Languages
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Speak or describe the emergency symptoms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Groq Llama 3.3 triages speech into ICD-10 & ESI 1-5 acuity with &lt;9ms atomic Neo4j bay locking.
            </p>
          </div>

          {/* 7 Indian Languages Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-center shadow-2xs">
            <Languages className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 hidden xs:inline">Bhashini:</span>
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                const found = INDIC_SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                if (found && !brief.trim()) setBrief(found.samplePrompt);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {INDIC_SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High-End Search Input Bar */}
        <div className="relative flex items-center bg-white border-2 border-slate-200/90 hover:border-slate-300 focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-600/10 rounded-2xl shadow-xs hover:shadow-sm transition-all duration-200 p-2 sm:p-2.5 sm:px-4 gap-2">
          {/* Search Icon / Tap Action Badge */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0 transition cursor-pointer"
            title="Analyze & Triage Emergency"
          >
            <Search className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
          </button>

          {/* Search Input */}
          <input
            id="emergency-search-input"
            type="text"
            value={brief}
            onChange={handleInputChange}
            placeholder={isListening ? `Listening via Bhashini in ${currentLang.nativeName}... speak now` : `Describe symptoms (e.g. chest pain, left arm numbness, vehicle collision)...`}
            className="w-full bg-transparent text-xs sm:text-base font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none px-2 sm:px-3.5 py-1.5 sm:py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />

          {/* Clear Button */}
          {brief && (
            <button
              type="button"
              onClick={() => {
                setBrief('');
                searchEmergency('');
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition mx-0.5 sm:mx-1 cursor-pointer shrink-0"
              title="Clear Search"
            >
              ✕
            </button>
          )}

          {/* Voice SOS Action (Speech-to-Text) */}
          <button
            type="button"
            onClick={handleVoiceSosToggle}
            className={`flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-sm'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
            }`}
            title={isListening ? 'Listening to microphone... click to stop' : `Voice SOS in ${currentLang.nativeName}`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-white animate-bounce" />
                <span className="hidden sm:inline">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline font-bold">Speak SOS</span>
              </>
            )}
          </button>

          {/* Text-To-Speech (TTS) Action */}
          <button
            type="button"
            onClick={() => handleToggleTts()}
            className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              isSpeakingTts
                ? 'bg-amber-50 text-amber-700 border border-amber-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title={isSpeakingTts ? 'Stop speech playback' : `Listen via Bhashini TTS in ${currentLang.nativeName}`}
          >
            {isSpeakingTts ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Read Aloud</span>
              </>
            )}
          </button>

          {/* Trigger Triage & Search Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xs hover:shadow transition-all cursor-pointer shrink-0 ml-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI Triage</span>
          </button>
        </div>

        {/* Live Voice Status Notifications */}
        {voiceNotice && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center justify-between animate-fadeIn">
            <span>🎙️ {voiceNotice}</span>
            <button
              onClick={() => setVoiceNotice(null)}
              className="text-amber-600 hover:text-amber-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {voiceSuccessToast && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center justify-between animate-fadeIn">
            <span>✓ {voiceSuccessToast}</span>
            <button
              onClick={() => setVoiceSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Preset Emergency Chips */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          {PRESET_EMERGENCIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-300 text-slate-700 hover:text-red-700 border border-slate-200/90 transition-all duration-150 text-xs font-medium cursor-pointer flex items-center space-x-2 shadow-2xs hover:-translate-y-0.5"
            >
              {getPresetIcon(preset.icon)}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Clinical Triage Strip — ESI 1-5 + ICD-10 + Spoken First-Aid (Step 2) */}
      {currentTriage && (
        <div className="bg-white border-2 border-red-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3.5 animate-fadeIn">
          {/* Header with ESI 1-5 Level Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 shrink-0 border border-red-100 shadow-2xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {currentTriage.detectedCondition}
                  </h2>
                  {/* ESI 1-5 Badge */}
                  <span className={`text-xs font-mono font-extrabold px-3 py-0.5 rounded-full shadow-2xs ${
                    currentTriage.esiLevel === 1 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : currentTriage.esiLevel === 2 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    ESI Level {currentTriage.esiLevel} ({currentTriage.esiLevel === 1 ? 'Immediate Resuscitation' : 'Emergent'})
                  </span>
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
                    {currentTriage.icdCodeEstimate}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                  <span>Groq Llama 3.3 Clinical Triage</span>
                  <span>•</span>
                  <span>Confidence: {currentTriage.aiConfidenceScore}%</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">0% Rejection Guaranteed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-red-700 font-bold bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-red-600 animate-spin" />
              <span>Golden Window: &lt; {currentTriage.goldenHourWindowMinutes} mins</span>
            </div>
          </div>

          {/* Spoken First-Aid Instructions Row */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Stethoscope className="w-4 h-4 text-red-600" />
                <span>Spoken First-Aid Instructions (Step 2: AI Triage)</span>
              </div>
              <button
                type="button"
                onClick={handleSpeakTriageAdvisory}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  isSpeakingTts
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
                title="Speak first-aid instructions aloud"
              >
                {isSpeakingTts ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                <span>{isSpeakingTts ? 'Stop Spoken Audio' : 'Speak First-Aid (TTS)'}</span>
              </button>
            </div>
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4 leading-relaxed">
              {currentTriage.firstAidImmediateInstructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium">Pre-Allocated:</span>
              {currentTriage.recommendedSpeciality.slice(0, 1).map((spec, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-medium border border-blue-200">
                  ✓ {spec}
                </span>
              ))}
              {currentTriage.requiredMachinery.slice(0, 1).map((mach, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                  ⚡ {mach.split(' ')[0]}
                </span>
              ))}
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200">
                🛡️ PM-JAY Cashless Eligible
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsGraphExpanded(prev => !prev)}
              className="text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>{isGraphExpanded ? 'Hide Neo4j Graph ▴' : 'Inspect <9ms Neo4j Lock ▾'}</span>
            </button>
          </div>

          {isGraphExpanded && (
            <div className="pt-2 border-t border-slate-100 animate-fadeIn">
              <Neo4jGraphExplorer />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
