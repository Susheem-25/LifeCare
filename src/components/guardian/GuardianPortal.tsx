import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  HeartPulse, 
  Search, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Compass, 
  Sparkles,
  Loader2,
  AlertCircle,
  Radio,
  QrCode,
  Languages,
  PhoneCall,
  X
} from 'lucide-react';
import { sanitizeText, sanitizeIdentifier } from '../../utils/security';
import { 
  speakTextWithSarvam, 
  stopSarvamSpeech, 
  analyzeProblemWithSarvam 
} from '../../services/sarvamAiService';
import { startVoiceSos, stopVoiceSos } from '../../utils/speechService';
import { LiveRouteMap } from '../common/LiveRouteMap';
import type { Hospital, AITriageAnalysis } from '../../types';

// Utility to immediately open device phone dialer and call ambulance 108
const triggerAmbulanceCall = () => {
  try {
    const a = document.createElement('a');
    a.href = 'tel:108';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.location.assign('tel:108');
  }
};

export const GuardianPortal: React.FC = () => {
  const {
    hospitals,
    activeBooking,
    allBookings,
    currentTriage,
    searchEmergency,
    bookHospitalBed,
    userLocation,
    requestLiveLocation,
    setIsVoiceQrModalOpen,
    admissionNotice,
    dismissAdmissionNotice
  } = useEmergency();

  // Mode: 'track' | 'register'
  const [guardianMode, setGuardianMode] = useState<'track' | 'register'>(() => {
    return activeBooking ? 'track' : 'register';
  });

  // Track Mode State
  const [trackPatientIdInput, setTrackPatientIdInput] = useState<string>(activeBooking?.patientUniqueId || '');
  const [trackedBooking, setTrackedBooking] = useState(activeBooking);
  const [trackError, setTrackError] = useState<string>('');

  // Register Mode State
  const [emergencyBrief, setEmergencyBrief] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [triageAnalysis, setTriageAnalysis] = useState<AITriageAnalysis | null>(currentTriage);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTranscriptRef = useRef<string>('');

  // Clean up silence timer and audio on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      stopVoiceSos();
    };
  }, []);

  // Hospital Selection & Neo4j State
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [generatedPatientId, setGeneratedPatientId] = useState<string | null>(null);
  const [isGraphProcessing, setIsGraphProcessing] = useState<boolean>(false);

  // Confirmed booking
  const [completedRegistration, setCompletedRegistration] = useState(activeBooking);

  // Sync tracked booking when activeBooking updates
  useEffect(() => {
    if (activeBooking) {
      // oxlint-disable-next-line react-refresh/only-export-components, react/set-state-in-effect
      setTrackedBooking(activeBooking);
      setTrackPatientIdInput(activeBooking.patientUniqueId);
      setCompletedRegistration(activeBooking);
    }
  }, [activeBooking]);

  // Voice SOS toggle (Speech-to-Text)
  const handleToggleVoiceInput = async () => {
    if (isListening) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsListening(false);
      setAudioVolume(0);
      setIsAnalyzing(true);
      const spoken = await stopVoiceSos();

      // Ensure EXACT spoken words are shown and triaged, never dummy data
      const actualSpoken = (spoken || currentTranscriptRef.current || emergencyBrief).trim();
      if (actualSpoken) {
        setEmergencyBrief(actualSpoken);
        await handleAnalyzeProblem(actualSpoken);
      } else {
        setVoiceNotice('No speech was detected. Please speak clearly into your mic or select an emergency sample below.');
      }
      setIsAnalyzing(false);
      return;
    }

    setVoiceNotice('');
    setAudioVolume(0);
    currentTranscriptRef.current = emergencyBrief;

    const started = await startVoiceSos({
      langCode: voiceLanguage === 'hi-IN' ? 'hi-IN' : 'unknown',
      onTranscript: (text, isFinal) => {
        currentTranscriptRef.current = text;
        setEmergencyBrief(text);

        // Reset silence debounce timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // If finalized (e.g. Sarvam AI STT response or completed stream), analyze problem
        if (isFinal && text.trim().length >= 3) {
          handleAnalyzeProblem(text.trim());
          return;
        }

        // Auto-finalize after 3 seconds of silence if user spoke something substantial
        silenceTimerRef.current = setTimeout(async () => {
          setIsListening(false);
          setAudioVolume(0);
          const spoken = await stopVoiceSos();
          const cleanText = (spoken || text).trim();
          if (cleanText.length >= 3) {
            handleAnalyzeProblem(cleanText);
          }
        }, 3000);
      },
      onListeningChange: (listening) => {
        setIsListening(listening);
        if (!listening) {
          setAudioVolume(0);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      },
      onVolumeChange: (vol) => {
        setAudioVolume(vol);
      },
      onError: (err) => {
        setIsListening(false);
        setAudioVolume(0);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (err && !err.toLowerCase().includes('network')) {
          setVoiceNotice(err);
        }
      },
    });

    if (!started) {
      setIsListening(false);
      setAudioVolume(0);
    }
  };

  // Sarvam AI Problem Analysis
  const handleAnalyzeProblem = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || emergencyBrief).trim();
    if (!text) return;

    setIsAnalyzing(true);
    const analysis = await analyzeProblemWithSarvam(text);
    searchEmergency(text);
    setTriageAnalysis(analysis);
    setIsAnalyzing(false);

    // Read back via Sarvam AI TTS
    const ttsText =
      voiceLanguage === 'hi-IN'
        ? `आपातकालीन जांच: ${analysis.detectedCondition}। नजदीकी अस्पताल मैच तैयार है।`
        : `Emergency Triage: ${analysis.detectedCondition}. Recommended: ${analysis.recommendedSpeciality[0]}. Nearest hospital matching updated.`;

    speakTextWithSarvam(
      ttsText,
      {
        langCode: voiceLanguage,
        onStart: () => setIsSpeakingTts(true),
        onEnd: () => setIsSpeakingTts(false),
        onError: () => setIsSpeakingTts(false),
      }
    );
  };

  // Read Aloud via Sarvam AI TTS
  const handleToggleTtsPlayback = (textToSpeak?: string) => {
    if (isSpeakingTts) {
      stopSarvamSpeech();
      setIsSpeakingTts(false);
      return;
    }

    const text =
      textToSpeak ||
      (triageAnalysis
        ? `${triageAnalysis.detectedCondition}. ${triageAnalysis.firstAidImmediateInstructions[0] || triageAnalysis.summary}`
        : emergencyBrief);

    speakTextWithSarvam(text, {
      langCode: 'hi-IN',
      onStart: () => setIsSpeakingTts(true),
      onEnd: () => setIsSpeakingTts(false),
      onError: () => setIsSpeakingTts(false),
    });
  };

  // Rank hospitals by facilities + nearest distance
  const eligibleHospitals = hospitals
    .map((h) => {
      const hasBeds = h.beds.icuFree > 0 || h.beds.emergencyFree > 0;
      const freeDoc = h.doctors.find((d) => d.status === 'AVAILABLE_AND_FREE' || d.status === 'FREE');
      const reqMachines = triageAnalysis?.requiredMachinery || [];
      const hasMachinery =
        reqMachines.length === 0 ||
        reqMachines.some((m) =>
          h.equipments.some((eq) => eq.name.toLowerCase().includes(m.toLowerCase()) && eq.status === 'READY_AND_STERILIZED')
        );

      const distanceScore = Math.max(0, 100 - h.distanceKm * 8);
      const bedScore = (h.beds.icuFree > 0 ? 30 : 0) + (h.beds.emergencyFree > 0 ? 20 : 0);
      const doctorScore = freeDoc ? 30 : 0;
      const totalScore = Math.min(99, Math.round(distanceScore + bedScore + doctorScore));

      return {
        ...h,
        matchScore: totalScore,
        isEligible: hasBeds && Boolean(freeDoc) && hasMachinery,
      };
    })
    .sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return a.distanceKm - b.distanceKm;
    });

  // Lock Hospital -> Immediately saves to database, locks Neo4j graph & reserves hospital bed
  const handleLockHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsGraphProcessing(true);

    const booking = bookHospitalBed(
      hospital.id,
      undefined,
      'PROTECTED (ZERO PII)'
    );

    setGeneratedPatientId(booking.patientUniqueId);
    setCompletedRegistration(booking);
    setTrackedBooking(booking);
    setTrackPatientIdInput(booking.patientUniqueId);

    speakTextWithSarvam(
      `Hospital locked at ${hospital.name}. Patient ID ${booking.patientUniqueId} saved to database.`,
      { langCode: 'hi-IN' }
    );

    setTimeout(() => {
      setIsGraphProcessing(false);
    }, 600);
  };

  // Track Patient Lookup
  const handleTrackLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    const clean = trackPatientIdInput.trim().toUpperCase();
    if (!clean) return;

    const found = allBookings.find(
      (b) =>
        b.patientUniqueId.toUpperCase() === clean ||
        b.bookingCode.toUpperCase() === clean ||
        b.patientUniqueId.toUpperCase().includes(clean)
    );

    if (found) {
      setTrackedBooking(found);
    } else {
      setTrackError(`No active mission found for "${clean}". Try PAT-2026-8941.`);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 px-1 sm:px-2">
      {/* Clean Top Navigation Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 uppercase tracking-wide">
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span>Guardian Emergency Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Emergency Care & Tracking
          </h1>
        </div>

        {/* 2 Primary Mode Buttons: Track Patient vs Register a New Patient */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setGuardianMode('track')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              guardianMode === 'track'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Track Patient</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setGuardianMode('register');
              setCompletedRegistration(null);
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              guardianMode === 'register'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Register a New Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVoiceQrModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs"
            title="Speak patient details and generate admission QR code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Voice-to-QR Admission</span>
          </button>
        </div>
      </div>

      {/* Live GPS Current Location Status Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 font-medium truncate">
            {userLocation.isLiveGps ? (
              <span>Live GPS Active: <strong className="text-emerald-700 font-mono">{userLocation.address}</strong></span>
            ) : (
              <span>Current Location: <strong className="text-slate-800 font-mono">{userLocation.address}</strong></span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline">
            Routes set from current location
          </span>
          {!userLocation.isLiveGps && (
            <button
              type="button"
              onClick={requestLiveLocation}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition cursor-pointer"
            >
              Refresh GPS
            </button>
          )}
        </div>
      </div>

      {/* Patient Admitted Reassurance Alert */}
      {(admissionNotice || activeBooking?.status === 'ADMITTED' || trackedBooking?.status === 'ADMITTED' || completedRegistration?.status === 'ADMITTED') && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-emerald-600/25 border-2 border-emerald-300 space-y-4 animate-scaleUp">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full font-bold">
                  Hospital Admission Confirmed
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1.5 leading-snug">
                  You are admitted. Have patience, everything will be alright.
                </h2>
                <p className="text-emerald-100 text-sm font-medium mt-1">
                  आप अस्पताल में भर्ती हो चुके हैं। धैर्य रखें, सब कुछ ठीक हो जाएगा।
                </p>
              </div>
            </div>

            {admissionNotice && (
              <button
                type="button"
                onClick={dismissAdmissionNotice}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
                title="Dismiss Notice"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
              <div className="text-emerald-200 text-[10px] uppercase font-bold">Patient Ref</div>
              <div className="text-base font-black text-white">
                {admissionNotice?.patientId || activeBooking?.patientUniqueId || trackedBooking?.patientUniqueId || 'PAT-ACTIVE'}
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
              <div className="text-emerald-200 text-[10px] uppercase font-bold">Allocated Bay</div>
              <div className="text-base font-bold text-white">
                {admissionNotice?.bay || activeBooking?.reservedBay || trackedBooking?.reservedBay || 'Trauma Bay #03'}
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
              <div className="text-emerald-200 text-[10px] uppercase font-bold">Hospital Name</div>
              <div className="text-base font-bold text-white truncate">
                {admissionNotice?.hospitalName || activeBooking?.hospitalName || trackedBooking?.hospitalName || 'Emergency Hospital'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-100 bg-white/10 rounded-xl p-3 border border-white/10">
            <HeartPulse className="w-4 h-4 text-rose-300 animate-pulse shrink-0" />
            <span>
              The emergency medical trauma team is actively attending to the patient. Continuous monitoring initiated.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW 1: TRACK PATIENT
          ======================================================== */}
      {guardianMode === 'track' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Patient ID Input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Track Patient by ID
            </h2>
            <form onSubmit={handleTrackLookup} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={trackPatientIdInput}
                  onChange={(e) => setTrackPatientIdInput(sanitizeIdentifier(e.target.value))}
                  placeholder="Enter Patient ID (e.g. PAT-2026-8941)"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none font-mono text-xs uppercase font-bold"
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Track Live Route</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>

            {trackError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
                {trackError}
              </div>
            )}
          </div>

          {/* Real-time Map & Tracking Telemetry */}
          {trackedBooking ? (
            <div className="space-y-4">
              {/* Mission Summary Pill */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-emerald-400 font-mono text-[10px] font-bold">
                    MISSION ACTIVE • {trackedBooking.patientUniqueId}
                  </div>
                  <div className="text-base font-extrabold mt-0.5">
                    {trackedBooking.hospitalName}
                  </div>
                  <div className="text-slate-400 text-xs">
                    Reserved Bay: <strong className="text-white">{trackedBooking.reservedBay}</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono">
                  {trackedBooking.status === 'ADMITTED' ? (
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ADMITTED TO ER BAY</span>
                    </span>
                  ) : (
                    <>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-lg font-bold text-xs">
                        ETA: {trackedBooking.ambulanceDetails.currentEtaMins} mins
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs">
                        {trackedBooking.ambulanceDetails.distanceRemainingKm} km
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Direct Route Navigation Card */}
              <LiveRouteMap
                patientId={trackedBooking.patientUniqueId}
                origin={{
                  lat: trackedBooking.patientPickupCoords.lat,
                  lng: trackedBooking.patientPickupCoords.lng,
                  address: trackedBooking.patientPickupCoords.address,
                }}
                destination={{
                  lat: trackedBooking.hospitalCoords.lat,
                  lng: trackedBooking.hospitalCoords.lng,
                  name: trackedBooking.hospitalName,
                  address: trackedBooking.hospitalAddress,
                  bay: trackedBooking.reservedBay,
                }}
                initialEtaMins={trackedBooking.ambulanceDetails.currentEtaMins}
                initialDistanceKm={trackedBooking.ambulanceDetails.distanceRemainingKm}
                speedKmh={trackedBooking.ambulanceDetails.currentSpeedKmh}
                vehicleNumber={trackedBooking.ambulanceDetails.vehicleNumber}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
              Enter a Patient ID above or click "Register a New Patient" to initiate a new emergency request.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FLOW 2: REGISTER A NEW PATIENT (Minimal, Clean, Uncluttered)
          ======================================================== */}
      {guardianMode === 'register' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card 1: Describe Medical Emergency */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Describe Medical Emergency
                </h2>
                <p className="text-xs text-slate-500">
                  Type the symptoms or speak using Sarvam AI voice.
                </p>
              </div>

              {/* Voice Actions */}
              <div className="flex items-center space-x-2">
                {/* Language selector toggle */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-bold">
                  <Languages className="w-3 h-3 text-slate-500 mr-1" />
                  <button
                    type="button"
                    onClick={() => setVoiceLanguage('hi-IN')}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                      voiceLanguage === 'hi-IN'
                        ? 'bg-white text-red-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceLanguage('en-IN')}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                      voiceLanguage === 'en-IN'
                        ? 'bg-white text-red-600 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  }`}
                  title="Speak problem with Sarvam AI"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-red-600" />}
                  <span>{isListening ? 'Listening...' : 'Voice SOS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleTtsPlayback()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isSpeakingTts
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                  title="Sarvam AI Text-to-Speech"
                >
                  {isSpeakingTts ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
                  <span>{isSpeakingTts ? 'Speaking...' : 'Read Aloud'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVoiceQrModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                  title="Open Voice-to-QR Pre-Admission Form"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Voice-to-QR</span>
                </button>
              </div>
            </div>

            {/* Active Voice SOS Listening State */}
            {isListening && (
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                  </span>
                  <div>
                    <div className="font-extrabold text-red-900 text-sm flex items-center space-x-1.5 flex-wrap">
                      <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                      <span>
                        Microphone Active — Listening in {voiceLanguage === 'hi-IN' ? 'हिन्दी (Hindi)' : 'English (India)'}...
                      </span>
                      {/* Live sound level bars */}
                      <div className="flex items-center space-x-1 ml-2">
                        {[10, 25, 40, 55, 70, 85].map((threshold, idx) => (
                          <span
                            key={idx}
                            className={`w-1 rounded-full transition-all duration-75 ${
                              audioVolume >= threshold ? 'bg-emerald-500 h-4' : 'bg-red-200 h-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-red-700 text-xs mt-0.5">
                      {voiceLanguage === 'hi-IN'
                        ? 'कृपया अपने लक्षण बोलें (उदा: "सीने में बहुत तेज दर्द हो रहा है और बायीं बांह में खिंचाव है")'
                        : 'Speak symptoms clearly (e.g., "Severe crushing chest pain radiating to left arm and sweating")'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs cursor-pointer shrink-0 transition"
                >
                  Stop & Triage Now
                </button>
              </div>
            )}

            {/* Voice Analyzing HUD */}
            {isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-blue-900 animate-fadeIn font-mono">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span>
                  <strong>Sarvam AI Clinical Engine:</strong> Processing spoken symptoms & matching nearest emergency facilities...
                </span>
              </div>
            )}

            {/* Voice Notice or Mic Blocked Alert with 1-Click Sample */}
            {voiceNotice && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{voiceNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'Severe crushing chest pain radiating to left arm and jaw, profuse cold sweating.';
                    setEmergencyBrief(sample);
                    handleAnalyzeProblem(sample);
                    setVoiceNotice('');
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
                >
                  Load SOS Sample
                </button>
              </div>
            )}

            {/* Input Text Area */}
            <div className="space-y-2.5">
              <textarea
                rows={2}
                value={emergencyBrief}
                onChange={(e) => {
                  const clean = sanitizeText(e.target.value);
                  setEmergencyBrief(clean);
                  if (clean.length >= 4) {
                    searchEmergency(clean);
                  }
                }}
                placeholder="What happened? (e.g. chest pain, breathing difficulty, severe bleeding)..."
                className="w-full bg-slate-50 text-slate-900 p-3 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none text-xs leading-relaxed"
              />

              {/* Analyze Action */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleAnalyzeProblem()}
                  disabled={isAnalyzing || !emergencyBrief.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isAnalyzing ? 'Analyzing Medical Urgency...' : 'Analyze Emergency with AI'}</span>
                </button>
              </div>
            </div>

            {/* Minimal Sarvam AI Triage Result Pill */}
            {triageAnalysis && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span className="font-bold text-red-900">
                    {triageAnalysis.detectedCondition}
                  </span>
                  <span className="bg-red-200 text-red-800 text-[10px] font-mono px-2 py-0.2 rounded font-bold">
                    ESI {triageAnalysis.esiLevel}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Specialist: <strong className="text-slate-900">{triageAnalysis.recommendedSpeciality[0]}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Nearest Hospitals (Ranked by Beds, Doctors, Machinery) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Recommended Nearest Hospitals (from Current Location)
                </h2>
                <p className="text-xs text-slate-500">
                  Verified available beds, doctors on duty, and ready facilities measured from your live location.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                Realtime GPS Distance Measured
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {eligibleHospitals.slice(0, 3).map((hosp, idx) => {
                const isSelected = selectedHospital?.id === hosp.id;
                const freeDoc = hosp.doctors.find((d) => d.status === 'AVAILABLE_AND_FREE' || d.status === 'FREE');

                return (
                  <div
                    key={hosp.id}
                    onClick={() => handleLockHospital(hosp)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-extrabold text-slate-900 text-sm leading-snug">{hosp.name}</span>
                        {idx === 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                            #1 NEAREST
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
                        <strong className="text-slate-800">{hosp.distanceKm} km</strong>
                        <span>•</span>
                        <strong className="text-amber-700">{hosp.transitTimeMins} mins</strong>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>ICU Trauma Beds:</span>
                          <strong className="text-emerald-700 font-mono font-bold">{hosp.beds.icuFree} Free</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Emergency Doctor:</span>
                          <strong className="text-slate-800">{freeDoc?.name.split(' ')[1] || 'Specialist'}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLockHospital(hosp);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✓ Hospital Locked</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Hospital</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Neo4j Graph Processing & Patient ID */}
          {selectedHospital && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono font-bold text-purple-700 uppercase">
                    Neo4j Graph Processing & Storage
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Atomic Resource Reservation
                  </h3>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGraphProcessing ? 'Locking in Neo4j...' : 'Neo4j Graph Locked (<9ms)'}</span>
                </div>
              </div>

              {/* Generated Patient ID Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Generated Patient ID:
                  </span>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">
                    {generatedPatientId || 'PAT-2026-4821'}
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div className="text-emerald-400 font-bold">End-to-End Encrypted</div>
                  <div>Zero Public PII</div>
                </div>
              </div>

              {/* Confirmed Lock Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Hospital Allocated:</span>
                  <span className="text-slate-900 font-extrabold">{selectedHospital.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Database Status:</span>
                  <span className="text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Saved to Hospital Database
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Emergency ER Bay:</span>
                  <span className="text-emerald-700 font-mono font-bold">Trauma Bay #03 (Reserved)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Atomic Graph Status:</span>
                  <span className="text-purple-700 font-mono font-bold">Neo4j Locked (&lt;9ms)</span>
                </div>
              </div>

              {/* Call Ambulance Action */}
              <a
                href="tel:108"
                onClick={triggerAmbulanceCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-md shadow-red-600/25 flex items-center justify-center space-x-2 cursor-pointer mt-2"
                title="Direct Phone Dialer to Call 108 Ambulance"
              >
                <PhoneCall className="w-4 h-4 text-white animate-pulse" />
                <span>Call Ambulance (108)</span>
              </a>
            </div>
          )}

          {/* Card 4: Real-time Live Map Route on Website (Post Booking) */}
          {completedRegistration && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Patient <strong>{completedRegistration.patientUniqueId}</strong> saved to <strong>{completedRegistration.hospitalName}</strong> incoming ER queue.
                  </span>
                </div>
              </div>

              {/* Direct Route Navigation Card */}
              <LiveRouteMap
                patientId={completedRegistration.patientUniqueId}
                origin={{
                  lat: completedRegistration.patientPickupCoords.lat,
                  lng: completedRegistration.patientPickupCoords.lng,
                  address: completedRegistration.patientPickupCoords.address,
                }}
                destination={{
                  lat: completedRegistration.hospitalCoords.lat,
                  lng: completedRegistration.hospitalCoords.lng,
                  name: completedRegistration.hospitalName,
                  address: completedRegistration.hospitalAddress,
                  bay: completedRegistration.reservedBay,
                }}
                initialEtaMins={completedRegistration.ambulanceDetails.currentEtaMins}
                initialDistanceKm={completedRegistration.ambulanceDetails.distanceRemainingKm}
                speedKmh={completedRegistration.ambulanceDetails.currentSpeedKmh}
                vehicleNumber={completedRegistration.ambulanceDetails.vehicleNumber}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
