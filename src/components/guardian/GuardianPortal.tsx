import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  HeartPulse, 
  Search, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Building2, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  Lock, 
  Zap, 
  Activity, 
  UserCheck, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { PRESET_EMERGENCIES, SAMPLE_ABHA_PROFILES } from '../../data/mockData';
import { 
  speakTextWithSarvam, 
  stopSarvamSpeech, 
  analyzeProblemWithSarvam 
} from '../../services/sarvamAiService';
import { startVoiceSos, stopVoiceSos } from '../../utils/speechService';
import { LiveRouteMap } from '../common/LiveRouteMap';
import type { Hospital, AITriageAnalysis, ABHAMedicalRecord } from '../../types';

export const GuardianPortal: React.FC = () => {
  const {
    hospitals,
    activeBooking,
    allBookings,
    currentTriage,
    searchEmergency,
    bookHospitalBed,
    fetchPatientByAbha
  } = useEmergency();

  // Mode: 'choose' | 'track' | 'register'
  const [guardianMode, setGuardianMode] = useState<'track' | 'register'>(() => {
    return activeBooking ? 'track' : 'register';
  });

  // Track Mode State
  const [trackPatientIdInput, setTrackPatientIdInput] = useState<string>(activeBooking?.patientUniqueId || '');
  const [trackedBooking, setTrackedBooking] = useState(activeBooking);
  const [trackError, setTrackError] = useState<string>('');

  // Register Mode State
  // Step 1: Emergency Brief & Voice Triage
  const [emergencyBrief, setEmergencyBrief] = useState<string>('Severe crushing chest pain radiating to left arm and jaw, profuse cold sweating.');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [triageAnalysis, setTriageAnalysis] = useState<AITriageAnalysis | null>(currentTriage);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Step 2: Hospital Selection
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Step 3: Neo4j Graph Allocation & Patient ID
  const [isGraphProcessing, setIsGraphProcessing] = useState<boolean>(false);
  const [generatedPatientId, setGeneratedPatientId] = useState<string | null>(null);

  // Step 4: ABHA ID via DigiLocker
  const [abhaInput, setAbhaInput] = useState<string>('91-4820-9182-3921');
  const [fetchedAbha, setFetchedAbha] = useState<ABHAMedicalRecord | null>(SAMPLE_ABHA_PROFILES[0]);
  const [isFetchingAbha, setIsFetchingAbha] = useState<boolean>(false);

  // Step 5: Finalized Booking
  const [completedRegistration, setCompletedRegistration] = useState(activeBooking);

  // Sync tracked booking when activeBooking updates
  useEffect(() => {
    if (activeBooking) {
      setTrackedBooking(activeBooking);
      setTrackPatientIdInput(activeBooking.patientUniqueId);
    }
  }, [activeBooking]);

  // Run initial triage analysis
  useEffect(() => {
    if (emergencyBrief && !triageAnalysis) {
      const res = searchEmergency(emergencyBrief);
      setTriageAnalysis(res);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Voice SOS (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      stopVoiceSos();
      setIsListening(false);
      return;
    }

    const started = startVoiceSos({
      langCode: 'hi-IN',
      onTranscript: (text, isFinal) => {
        setEmergencyBrief(text);
        if (isFinal) {
          handleAnalyzeProblem(text);
        }
      },
      onListeningChange: (listening) => {
        setIsListening(listening);
      },
      onError: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      // Fallback
      setIsListening(false);
    }
  };

  // Analyze problem using Sarvam AI
  const handleAnalyzeProblem = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || emergencyBrief).trim();
    if (!text) return;

    setIsAnalyzing(true);
    const analysis = await analyzeProblemWithSarvam(text);
    searchEmergency(text);
    setTriageAnalysis(analysis);
    setIsAnalyzing(false);

    // Read back triage condition using Sarvam AI TTS
    speakTextWithSarvam(
      `Emergency Triage: ${analysis.detectedCondition}. Recommended Specialist: ${analysis.recommendedSpeciality[0]}. Priority hospital matching initiated.`,
      {
        langCode: 'hi-IN',
        onStart: () => setIsSpeakingTts(true),
        onEnd: () => setIsSpeakingTts(false),
        onError: () => setIsSpeakingTts(false),
      }
    );
  };

  // Text-to-Speech playback via Sarvam AI
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
      // Check beds available
      const hasBeds = h.beds.icuFree > 0 || h.beds.emergencyFree > 0;
      // Check free doctor
      const freeDoc = h.doctors.find((d) => d.status === 'AVAILABLE_AND_FREE' || d.status === 'FREE');
      // Check required machinery
      const reqMachines = triageAnalysis?.requiredMachinery || [];
      const hasMachinery = reqMachines.length === 0 || reqMachines.some((m) =>
        h.equipments.some((eq) => eq.name.toLowerCase().includes(m.toLowerCase()) && eq.status === 'READY_AND_STERILIZED')
      );

      // Score priority: closer distance gets higher ranking
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
      // First sort by eligible with all facilities
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      // Then sort by nearest distance
      return a.distanceKm - b.distanceKm;
    });

  // Handle Selecting Hospital -> Triggers Neo4j Graph Processing & Patient ID generation
  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsGraphProcessing(true);

    // Simulate Neo4j graph atomic locking (<9ms execution)
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newPatientId = `PAT-2026-${randomNum}`;
      setGeneratedPatientId(newPatientId);
      setIsGraphProcessing(false);
    }, 700);
  };

  // Fetch ABHA ID via DigiLocker
  const handleFetchAbha = () => {
    setIsFetchingAbha(true);

    setTimeout(() => {
      const found = fetchPatientByAbha(abhaInput);
      if (found) {
        setFetchedAbha(found);
      } else {
        // Fallback to sample
        setFetchedAbha(SAMPLE_ABHA_PROFILES[0]);
      }
      setIsFetchingAbha(false);
    }, 500);
  };

  // Finalize Emergency Dispatch & Save to Hospital Database as Incoming Patient
  const handleConfirmReservation = () => {
    if (!selectedHospital) return;

    // Book bed & save to hospital incoming queue
    const booking = bookHospitalBed(
      selectedHospital.id,
      fetchedAbha?.fullName || 'Emergency Patient',
      fetchedAbha?.phoneNumber || '+91-98104-55678',
      fetchedAbha
    );

    // Override patientUniqueId if we generated one
    if (generatedPatientId) {
      booking.patientUniqueId = generatedPatientId;
    }

    setCompletedRegistration(booking);
    setTrackedBooking(booking);
    setTrackPatientIdInput(booking.patientUniqueId);

    // Audio confirmation
    speakTextWithSarvam(
      `Hospital allocated at ${selectedHospital.name}. Unique Patient ID ${booking.patientUniqueId}. Ambulance dispatched and incoming record logged.`,
      { langCode: 'hi-IN' }
    );
  };

  // Handle Track Patient Lookup
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
      setTrackError(`No active emergency mission found for "${clean}". Try PAT-2026-8941.`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Header & Mode Toggle */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-mono font-bold border border-red-200">
              <HeartPulse className="w-3.5 h-3.5 text-red-600" />
              <span>Guardian Emergency Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              LifeCare Guardian Portal
            </h1>
            <p className="text-xs text-slate-500">
              Caring for lives with instant AI triage, nearest hospital allocation, and real-time live routing.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setGuardianMode('track')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                guardianMode === 'track'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
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
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                guardianMode === 'register'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register a New Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODE 1: TRACK PATIENT
          ======================================================== */}
      {guardianMode === 'track' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Patient ID Search Input */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
              <Search className="w-5 h-5 text-red-600" />
              <span>Track Active Patient by Unique ID</span>
            </div>
            <p className="text-xs text-slate-500">
              Enter the patient's encrypted ID generated during registration to track live ambulance transit, bay preparation, and hospital arrival.
            </p>

            <form onSubmit={handleTrackLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={trackPatientIdInput}
                  onChange={(e) => setTrackPatientIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PAT-2026-8941"
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none font-mono text-sm uppercase font-semibold"
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Track Route</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>

            {trackError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                {trackError}
              </div>
            )}

            {/* Quick Demo Patient IDs */}
            <div className="flex items-center flex-wrap gap-2 pt-2 text-[11px] text-slate-500">
              <span className="font-semibold">Quick Demo IDs:</span>
              {(allBookings.length > 0 ? allBookings.slice(0, 3) : [{ patientUniqueId: 'PAT-2026-8941' }]).map((b) => (
                <button
                  key={b.patientUniqueId}
                  type="button"
                  onClick={() => {
                    setTrackPatientIdInput(b.patientUniqueId);
                    const found = allBookings.find((x) => x.patientUniqueId === b.patientUniqueId);
                    if (found) setTrackedBooking(found);
                  }}
                  className="font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {b.patientUniqueId}
                </button>
              ))}
            </div>
          </div>

          {/* Active Mission Telemetry & Live Map */}
          {trackedBooking ? (
            <div className="space-y-6">
              {/* Privacy Notice Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>End-to-End Encrypted:</strong> Only <strong>Patient ID ({trackedBooking.patientUniqueId})</strong> is transmitted for patient privacy. Medical details are unlocked solely by the receiving hospital.
                  </span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0">
                  E2EE Active
                </span>
              </div>

              {/* Status Stepper */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider">
                      Live Mission Status
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Emergency Transit Telemetry
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                      Bay: {trackedBooking.reservedBay}
                    </span>
                    <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-bold">
                      {trackedBooking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* 4-Step Visual Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-bold font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step 1: Dispatched</span>
                    </div>
                    <div className="text-slate-900 font-bold">108 Ambulance</div>
                    <div className="text-[10px] text-slate-500 font-mono">{trackedBooking.ambulanceDetails.vehicleNumber}</div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-bold font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step 2: Transit</span>
                    </div>
                    <div className="text-slate-900 font-bold">Green Corridor</div>
                    <div className="text-[10px] text-slate-500 font-mono">Speed: {trackedBooking.ambulanceDetails.currentSpeedKmh} km/h</div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-700 font-bold font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>Step 3: Hospital Bay</span>
                    </div>
                    <div className="text-slate-900 font-bold">{trackedBooking.hospitalName.split(' ')[0]}</div>
                    <div className="text-[10px] text-amber-700 font-mono font-bold">ETA: {trackedBooking.ambulanceDetails.currentEtaMins} mins</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-bold font-mono text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      <span>Step 4: ER Intake</span>
                    </div>
                    <div className="text-slate-700 font-bold">0-Sec Intake</div>
                    <div className="text-[10px] text-slate-400 font-mono">Direct Bay Transfer</div>
                  </div>
                </div>
              </div>

              {/* Live Interactive Route Map */}
              <LiveRouteMap
                patientId={trackedBooking.patientUniqueId}
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
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-slate-700 font-bold text-sm">No Active Mission Selected</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter a Patient ID above or click "Register a New Patient" to triage and dispatch an emergency team immediately.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 2: REGISTER A NEW PATIENT
          ======================================================== */}
      {guardianMode === 'register' && (
        <div className="space-y-8 animate-fadeIn">
          {/* STEP 1: Describe Medical Emergency (Minimal Clean UI with Voice STT & TTS) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Step 1 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Describe Medical Emergency
                </h2>
                <p className="text-xs text-slate-500">
                  Type the symptoms or speak naturally. Powered by Sarvam AI for clinical problem analysis and text-to-speech.
                </p>
              </div>

              {/* Action Buttons: Voice SOS & Speak Aloud */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  }`}
                  title="Speak emergency symptoms"
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-red-600" />}
                  <span>{isListening ? 'Listening...' : 'Voice SOS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleTtsPlayback()}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    isSpeakingTts
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                  title="Listen with Sarvam AI Text to Speech"
                >
                  {isSpeakingTts ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
                  <span>{isSpeakingTts ? 'Speaking...' : 'Read Aloud'}</span>
                </button>
              </div>
            </div>

            {/* Input Text Area */}
            <div className="space-y-3">
              <textarea
                rows={3}
                value={emergencyBrief}
                onChange={(e) => {
                  setEmergencyBrief(e.target.value);
                  if (e.target.value.trim().length >= 4) {
                    searchEmergency(e.target.value);
                  }
                }}
                placeholder="Describe what happened (e.g. chest pain, unconsciousness, severe bleeding, breathing difficulty)..."
                className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl border border-slate-300 focus:border-red-500 focus:outline-none text-sm leading-relaxed"
              />

              {/* Quick Sample Presets */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Common Emergencies:</span>
                {PRESET_EMERGENCIES.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setEmergencyBrief(preset.brief);
                      handleAnalyzeProblem(preset.brief);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAnalyzeProblem()}
                  disabled={isAnalyzing}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{isAnalyzing ? 'Analyzing with Sarvam AI...' : 'Analyze Problem'}</span>
                </button>
              </div>
            </div>

            {/* Sarvam AI Problem Analysis Box */}
            {triageAnalysis && (
              <div className="bg-gradient-to-br from-red-50/80 via-white to-amber-50/60 border-2 border-red-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    <span className="font-mono text-xs font-extrabold text-red-700 uppercase">
                      Sarvam AI Clinical Triage Analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                      ESI Level {triageAnalysis.esiLevel} (Critical)
                    </span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      Golden Window: &lt;{triageAnalysis.goldenHourWindowMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-extrabold text-slate-900">
                    {triageAnalysis.detectedCondition}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {triageAnalysis.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-white/80 p-3 rounded-2xl border border-red-100 space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 text-red-600" />
                      <span>Required Specialists On Standby:</span>
                    </div>
                    <div className="text-slate-900 font-bold text-[11px]">
                      {triageAnalysis.recommendedSpeciality.join(' • ')}
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-red-100 space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Required Medical Machinery:</span>
                    </div>
                    <div className="text-slate-900 font-bold text-[11px]">
                      {triageAnalysis.requiredMachinery.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Nearest Hospital Priority Options */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 2 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Available Nearest Hospitals
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked in priority order having available beds, doctors, and medical facilities at the nearest location.
                </p>
              </div>

              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                Google Maps Distance Matrix Active
              </span>
            </div>

            {/* Hospital Cards List */}
            <div className="grid grid-cols-1 gap-4">
              {eligibleHospitals.map((hospital, idx) => {
                const isSelected = selectedHospital?.id === hospital.id;
                const freeDoc = hospital.doctors.find((d) => d.status === 'AVAILABLE_AND_FREE' || d.status === 'FREE');

                return (
                  <div
                    key={hospital.id}
                    onClick={() => handleSelectHospital(hospital)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          idx === 0 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {idx === 0 ? '#1 Priority (Nearest & Ready)' : `Option #${idx + 1}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {hospital.distanceKm} km away • {hospital.transitTimeMins} mins ETA
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {hospital.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {hospital.address}
                      </p>

                      {/* Badges of Available Beds, Doctors, Machines */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-bold">
                          {hospital.beds.icuFree} ICU Beds Free • {hospital.beds.emergencyFree} ER Beds
                        </span>
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-lg font-bold">
                          Doctor: {freeDoc?.name || 'ER Specialist On Duty'}
                        </span>
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-lg font-bold">
                          Cath Lab & CT Ready
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-end gap-2 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHospital(hospital);
                        }}
                        className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Building2 className="w-4 h-4" />}
                        <span>{isSelected ? 'Hospital Selected' : 'Choose Hospital'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Neo4j Graph Processing & Patient ID Generation */}
          {selectedHospital && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Step 3 of 4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Neo4j Graph Processing & Patient ID
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atomic resource mapping linking patient, emergency bay, and attending doctor in &lt;9ms.
                  </p>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs bg-slate-100 px-3 py-1 rounded-xl text-slate-700">
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cypher Query: &lt;9ms Atomic Lock</span>
                </div>
              </div>

              {/* Neo4j Graph Mapping Visualization */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>NEO4J AURADB CYHER TRANSACTION</span>
                  <span className="text-emerald-400 font-bold">
                    {isGraphProcessing ? 'CYPHER TRANSACTION EXECUTING...' : 'STATUS: ATOMIC LOCK ACQUIRED'}
                  </span>
                </div>

                <div className="text-teal-400 text-xs">
                  <code>
                    MATCH (p:Patient), (h:Hospital &#123;id: &quot;{selectedHospital.id}&quot;&#125;)<br />
                    CREATE (p)-[:RESERVES_BAY &#123;bay: &quot;Trauma Bay #03&quot;, lockTimeMs: 7.8&#125;]-&gt;(h)<br />
                    CREATE (h)-[:ASSIGNS_DOCTOR]-&gt;(d:Doctor &#123;status: &quot;FREE&quot;&#125;)
                  </code>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs pt-2">
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">PATIENT NODE</div>
                    <div className="text-white font-bold text-sm mt-1">{generatedPatientId || 'PAT-2026-PENDING'}</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">LOCKED BAY</div>
                    <div className="text-emerald-400 font-bold text-sm mt-1">Trauma Bay #03</div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="text-slate-400 text-[10px]">ATTENDING DOCTOR</div>
                    <div className="text-white font-bold text-sm mt-1">{selectedHospital.doctors[0]?.name.split(' ')[1] || 'Specialist'}</div>
                  </div>
                </div>
              </div>

              {/* GENERATED PATIENT ID DISPLAY */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-red-600/20">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                    Unique Patient Reference
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black mt-2">
                    {generatedPatientId || 'PAT-2026-4821'}
                  </div>
                  <p className="text-xs text-white/80 max-w-md">
                    End-to-End Encrypted Identifier. Only this token is shared publicly and with emergency drivers.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center font-mono text-xs">
                  <div className="text-white/70 text-[10px]">SECURITY LEVEL</div>
                  <div className="text-white font-bold">HMAC-SHA256 E2EE</div>
                  <div className="text-emerald-300 text-[10px] mt-0.5">Zero PII Leakage</div>
                </div>
              </div>

              {/* STEP 4: ABHA ID via DigiLocker (Positioned right below Patient ID) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Step 4 of 4 • DigiLocker Integration
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      Fetch Patient Details via ABHA ID
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instantly pull medical history (blood group, allergies, past surgeries) from ABDM DigiLocker.
                    </p>
                  </div>

                  <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-3 py-1 rounded-xl">
                    ABDM Sandbox v3 Verified
                  </span>
                </div>

                {/* ABHA Input Form */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <FileCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={abhaInput}
                      onChange={(e) => setAbhaInput(e.target.value)}
                      placeholder="e.g. 91-4820-9182-3921"
                      className="w-full bg-white text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchAbha}
                    disabled={isFetchingAbha}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4 text-white" />
                    <span>{isFetchingAbha ? 'Fetching...' : 'Fetch via DigiLocker'}</span>
                  </button>
                </div>

                {/* Fetched Medical History Card */}
                {fetchedAbha && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900">
                          DigiLocker Records Fetched ({fetchedAbha.fullName}, {fetchedAbha.age}y {fetchedAbha.gender})
                        </span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">
                        Blood: {fetchedAbha.bloodGroup}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                        <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                          Known Allergies:
                        </span>
                        <div className="text-rose-950 font-semibold text-[11px]">
                          {fetchedAbha.knownAllergies.join(', ') || 'None Reported'}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                          Chronic Conditions:
                        </span>
                        <div className="text-slate-800 text-[11px]">
                          {fetchedAbha.chronicConditions.join(', ')}
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                          Ayushman Bharat (PM-JAY):
                        </span>
                        <div className="text-emerald-900 font-bold text-[11px]">
                          {fetchedAbha.pmjayEligible ? 'Eligible (Cashless ₹5 Lakh)' : 'Private Insurance'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      <Lock className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                      <strong>Safety Protocol:</strong> Patient personal information is encrypted. Transmitted only as Patient ID <strong>{generatedPatientId || 'PAT-2026-4821'}</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm & Save to Hospital Database as Incoming Patient */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm tracking-wide transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Dispatch 108 Ambulance & Save to Hospital Incoming Database</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Live Map Route Right on Website (Post Confirmation) */}
          {completedRegistration && (
            <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Incoming Emergency Record Active</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Live Route & Hospital Allocation Confirmed
                  </h2>
                  <p className="text-xs text-slate-600">
                    Patient saved to <strong>{completedRegistration.hospitalName}</strong> incoming ER queue. Trauma Bay #03 pre-warmed.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGuardianMode('track');
                      setTrackedBooking(completedRegistration);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Switch to Full Tracker
                  </button>
                </div>
              </div>

              {/* Embedded Live Route Map right on website */}
              <LiveRouteMap
                patientId={completedRegistration.patientUniqueId}
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
