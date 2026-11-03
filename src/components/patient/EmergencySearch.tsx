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
  Languages 
} from 'lucide-react';
import { SARVAM_SUPPORTED_LANGUAGES } from '../../data/trackMockData';
import { Neo4jGraphExplorer } from './Neo4jGraphExplorer';
import { fastScrollTo } from '../../utils/scrollHelper';
import { LiveGpsTracker } from '../common/LiveGpsTracker';
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
    loginAmbulanceDriver
  } = useEmergency();

  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [brief, setBrief] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceSuccessToast, setVoiceSuccessToast] = useState<string | null>(null);
  const [isGraphExpanded, setIsGraphExpanded] = useState<boolean>(false);
  
  const currentLang = SARVAM_SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SARVAM_SUPPORTED_LANGUAGES[0];

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

  // Real-time Voice SOS via Web Speech API (with seamless fallback)
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

  // Speak AI Triage diagnosis and golden window advisory
  const handleSpeakTriageAdvisory = () => {
    if (!currentTriage) return;
    if (isSpeakingTts) {
      stopSpeaking();
      setIsSpeakingTts(false);
      return;
    }

    const advisory = `${currentTriage.detectedCondition}. ${currentTriage.summary}. Recommended speciality: ${currentTriage.recommendedSpeciality.join(', ')}. Golden window: under ${currentTriage.goldenHourWindowMinutes} minutes.`;
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
    <div className="space-y-3.5 w-full max-w-full overflow-hidden">
      {/* Clean Modern Emergency Search Hero */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-sm space-y-4 relative overflow-hidden w-full max-w-full">
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600"></div>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-700 uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span>Live Emergency Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              What is the medical emergency?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Type patient symptoms to immediately discover & rank equipped trauma centers with ready ICU beds.
            </p>
          </div>

          {/* Clean Language Pill */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-center shadow-2xs">
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                const found = SARVAM_SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                if (found && !brief.trim()) setBrief(found.samplePrompt);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {SARVAM_SUPPORTED_LANGUAGES.map((lang) => (
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
            title="Search Ready Emergency Centers"
          >
            <Search className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
          </button>

          {/* Spacious Search Input with generous placeholder breathing room */}
          <input
            type="text"
            value={brief}
            onChange={handleInputChange}
            placeholder={isListening ? `Listening in ${currentLang.nativeName}... speak now` : `Describe emergency (e.g. chest pain, accident)...`}
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
                : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 hover:border-red-200 border border-slate-200'
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
                <span className="hidden sm:inline">Voice SOS</span>
              </>
            )}
          </button>

          {/* Text-To-Speech (TTS) Action */}
          <button
            type="button"
            onClick={() => handleToggleTts()}
            className={`flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              isSpeakingTts
                ? 'bg-red-50 text-red-700 border border-red-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title={isSpeakingTts ? 'Stop speech playback' : `Listen via Text-to-Speech in ${currentLang.nativeName}`}
          >
            {isSpeakingTts ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Speak (TTS)</span>
              </>
            )}
          </button>

          {/* Find Ready ER Button */}
          <button
            type="button"
            onClick={() => handleSearch()}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xs hover:shadow transition-all cursor-pointer shrink-0 ml-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Find Ready ER</span>
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

        {/* Clean Emergency Chips with subtle hover elevation */}
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

      {/* Live GPS Ambulance Tracker & Telemetry — Rendered when an emergency booking is active */}
      {activeBooking && (
        <div id="patient-active-booking-section" className="scroll-mt-24">
          <LiveGpsTracker 
            booking={activeBooking} 
            role="patient" 
            onSimulateDriverLogin={loginAmbulanceDriver} 
          />
        </div>
      )}

      {/* AI Clinical Diagnostic Strip — Streamlined & Compact */}
      {currentTriage && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentTriage.detectedCondition}
                </h2>
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  {currentTriage.icdCodeEstimate}
                </span>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                  {currentTriage.aiConfidenceScore}% Match
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-red-700 font-semibold bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-red-600 animate-spin" />
              <span>Golden Window: &lt; {currentTriage.goldenHourWindowMinutes}m</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <p className="text-slate-700 text-xs flex-1 line-clamp-2 sm:line-clamp-1">
              <strong className="text-slate-900 font-semibold">Triage:</strong> {currentTriage.summary}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {currentTriage.recommendedSpeciality.slice(0, 1).map((spec, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">
                  ✓ {spec}
                </span>
              ))}
              {currentTriage.requiredMachinery.slice(0, 1).map((mach, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                  ⚡ {mach.split(' ')[0]}
                </span>
              ))}

              {/* Spoken Clinical Advisory TTS Button */}
              <button
                type="button"
                onClick={handleSpeakTriageAdvisory}
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                  isSpeakingTts
                    ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
                title="Listen to Clinical Triage Advisory via Text-to-Speech"
              >
                {isSpeakingTts ? <VolumeX className="w-3 h-3 text-red-600" /> : <Volume2 className="w-3 h-3 text-slate-600" />}
                <span>{isSpeakingTts ? 'Stop Voice' : 'Listen Advisory'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGraphExpanded(prev => !prev)}
                className="text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-0.5 rounded transition cursor-pointer"
              >
                {isGraphExpanded ? 'Hide Query ▴' : 'Inspect Neo4j ▾'}
              </button>
            </div>
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
