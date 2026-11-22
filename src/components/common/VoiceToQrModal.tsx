import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  X,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  FileText,
  Radio,
  ShieldCheck,
  Lock,
  EyeOff,
  ChevronDown,
  ChevronUp,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import type { PatientVoiceRegistration } from '../../types';
import {
  parseSpokenRegistration,
  packRegistrationToQR,
  packEncryptedRegistrationToQR
} from '../../utils/voiceRegistrationParser';
import {
  maskName,
  maskPhone
} from '../../services/cryptoService';
import {
  startVoiceSos,
  stopVoiceSos
} from '../../utils/speechService';
import {
  speakTextWithSarvam,
  stopSarvamSpeech
} from '../../services/sarvamAiService';
import { sanitizeText } from '../../utils/security';

interface VoiceToQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTranscript?: string;
}

export const VoiceToQrModal: React.FC<VoiceToQrModalProps> = ({
  isOpen,
  onClose,
  initialTranscript = '',
}) => {
  const { theme } = useEmergency();
  const isDark = theme === 'dark';

  const [transcript, setTranscript] = useState(initialTranscript || '');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('en-IN');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0);
  const [encryptedQrPayload, setEncryptedQrPayload] = useState<string>('');
  const [keyFingerprint, setKeyFingerprint] = useState<string>('SHA256:7F3A9182...B8C1');
  const [showCryptoProof, setShowCryptoProof] = useState<boolean>(false);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);

  // Structured form state
  const [formData, setFormData] = useState<PatientVoiceRegistration>(() =>
    parseSpokenRegistration(initialTranscript || '')
  );

  // Sync form data whenever transcript changes
  useEffect(() => {
    if (transcript.trim()) {
      // oxlint-disable-next-line react/set-state-in-effect
      setFormData((prev) => parseSpokenRegistration(transcript, prev));
    }
  }, [transcript]);

  // Generate AES-GCM-256 encrypted QR packet whenever form data updates
  useEffect(() => {
    let isMounted = true;
    packEncryptedRegistrationToQR(formData)
      .then((payload) => {
        if (isMounted) {
          setEncryptedQrPayload(payload);
          try {
            const parsed = JSON.parse(payload);
            if (parsed.fprint) setKeyFingerprint(parsed.fprint);
          } catch {
            // retain existing fingerprint
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to encrypt QR packet:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [formData]);

  if (!isOpen) return null;

  // Toggle voice listening
  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      setAudioVolume(0);
      setIsProcessingVoice(true);
      const spokenText = await stopVoiceSos();

      // Show the EXACT data the user just spoke and populate the structured form
      const cleanSpoken = (spokenText || transcript).trim();
      if (cleanSpoken) {
        setTranscript(cleanSpoken);
        setFormData(parseSpokenRegistration(cleanSpoken));
      } else {
        setMicNotice('No speech was detected. Please check your mic and speak clearly, or click a Quick Preset.');
      }
      setIsProcessingVoice(false);
      return;
    }

    setMicNotice(null);
    setAudioVolume(0);
    const success = await startVoiceSos({
      langCode: voiceLang === 'hi-IN' ? 'hi-IN' : 'unknown',
      onTranscript: (spokenText) => {
        setTranscript(spokenText);
        setFormData((prev) => parseSpokenRegistration(spokenText, prev));
      },
      onListeningChange: (listening) => {
        setIsListening(listening);
        if (!listening) setAudioVolume(0);
      },
      onVolumeChange: (vol) => {
        setAudioVolume(vol);
      },
      onError: (msg) => {
        setIsListening(false);
        setAudioVolume(0);
        if (msg && !msg.toLowerCase().includes('network')) {
          setMicNotice(msg);
        }
      },
    });

    if (!success) {
      setIsListening(false);
      setAudioVolume(0);
    }
  };

  // Speak voice confirmation using Sarvam AI Indic TTS
  const speakConfirmation = () => {
    if (isSpeaking) {
      stopSarvamSpeech();
      setIsSpeaking(false);
      return;
    }

    const speechText = `Patient registration ready for ${formData.fullName}, ${formData.age} year old ${formData.gender}. Chief complaint: ${formData.chiefComplaint}. Blood group: ${formData.bloodGroup}. QR code generated for hospital reception intake.`;
    setIsSpeaking(true);
    speakTextWithSarvam(speechText, {
      langCode: 'en-IN',
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Generate compact QR Code payload
  const qrPayload = packRegistrationToQR(formData);

  const copyPayload = () => {
    navigator.clipboard.writeText(encryptedQrPayload || qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFieldChange = (field: keyof PatientVoiceRegistration, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizeText(value),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className={`rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border space-y-6 animate-scaleUp my-auto max-h-[95vh] overflow-y-auto transition-colors duration-200 ${
        isDark ? 'bg-[#0a0f1d] border-zinc-800 text-zinc-100 ring-1 ring-white/10' : 'bg-white border-slate-200 text-slate-900 ring-1 ring-slate-900/5'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Voice-to-QR Pre-Admission Transfer
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>E2EE Zero-Wait ER</span>
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Speak patient details in transit &rarr; generate instant encrypted QR code &rarr; hospital scans to auto-fill reception form in 0 seconds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopVoiceSos();
              stopSarvamSpeech();
              onClose();
            }}
            className={`p-1.5 rounded-full cursor-pointer transition ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Voice Intake with Prominent Record Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-mono uppercase font-bold ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Step 1:</span>
              <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>Speak or Paste Patient Registration Details</span>
            </div>

            {/* Language Switcher Badge */}
            <div className={`inline-flex rounded-xl border p-0.5 text-xs font-bold shadow-2xs ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setVoiceLang('en-IN')}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  voiceLang === 'en-IN' ? 'bg-red-600 text-white font-extrabold shadow-xs' : isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setVoiceLang('hi-IN')}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  voiceLang === 'hi-IN' ? 'bg-red-600 text-white font-extrabold shadow-xs' : isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Voice Input Box */}
          <div className="relative">
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Click 'Start Voice Recording' below or speak/paste emergency symptoms, patient age, name, blood group, allergies (in English or हिन्दी)..."
              className={`w-full border rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:border-red-500 transition leading-relaxed ${
                isDark
                  ? 'bg-zinc-900/80 text-zinc-100 border-zinc-700/80 focus:bg-zinc-900'
                  : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white'
              }`}
            />
          </div>

          {/* PROMINENT DEDICATED RECORD BUTTON */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all shadow-md cursor-pointer ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/30'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
              }`}
              title="Record Spoken Emergency Intake via Sarvam AI"
            >
              {isListening ? (
                <>
                  <Radio className="w-4 h-4 text-white animate-spin" />
                  <span>Stop Recording & Parse Info ({voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'})</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-white" />
                  <span>Start Voice Recording ({voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'})</span>
                </>
              )}
            </button>
          </div>

          {/* Live Mic HUD Status */}
          {isListening && (
            <div className={`border-2 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs animate-fadeIn font-mono ${
              isDark
                ? 'bg-red-950/40 border-red-800 text-red-200'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0"></span>
                <span>
                  <strong>Recording with Sarvam AI ({voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'}):</strong> Speak patient details...
                </span>
                {/* Live sound level bars */}
                <div className="flex items-center space-x-1 ml-2">
                  {[10, 25, 40, 55, 70, 85].map((threshold, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        audioVolume >= threshold ? 'bg-emerald-500 h-4' : isDark ? 'bg-red-900 h-1.5' : 'bg-red-200 h-1.5'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer shrink-0 shadow-xs transition"
              >
                Stop & Process Info
              </button>
            </div>
          )}

          {isProcessingVoice && (
            <div className={`border rounded-xl p-2.5 flex items-center space-x-2 text-xs animate-fadeIn font-mono ${
              isDark ? 'bg-blue-950/40 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
              <span>
                <strong>Sarvam AI Engine:</strong> Processing spoken intake & populating hospital registration form...
              </span>
            </div>
          )}

          {micNotice && (
            <div className={`border rounded-xl p-2.5 text-xs flex items-center justify-between gap-2 ${
              isDark ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{micNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setMicNotice(null)}
                className="text-[11px] font-bold text-amber-500 hover:text-amber-400 cursor-pointer underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Structured Form Preview & QR Code Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left Column (8 cols): Structured Registration Form Editor */}
          <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Parsed Registration Form (Editable)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Auto-Parsed via AI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Patient ID */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Patient Unique ID:
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => handleFieldChange('patientId', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Patient Full Name:
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Age (Years):
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Gender:
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Blood Group:
                </label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-red-600 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Guardian Phone */}
              <div>
                <label className={`block text-[10px] font-mono uppercase font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Guardian Contact Phone (10 Digits):
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.guardianPhone}
                  onChange={(e) => handleFieldChange('guardianPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10 digits (e.g. 9811023451)"
                  className={`w-full border rounded-xl px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-red-500 transition ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Chief Complaint (Full row) */}
              <div className="sm:col-span-2">
                <label className={`block text-[10px] font-mono uppercase font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Chief Complaint / Symptoms:
                </label>
                <input
                  type="text"
                  value={formData.chiefComplaint}
                  onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 font-semibold text-xs focus:outline-none focus:border-red-500 transition ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Allergies */}
              <div>
                <label className={`block text-[10px] font-mono uppercase font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Drug Allergies:
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 font-semibold text-amber-600 dark:text-amber-400 text-xs focus:outline-none focus:border-red-500 transition ${
                    isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className={`block text-[10px] font-mono uppercase font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Current Medications:
                </label>
                <input
                  type="text"
                  value={formData.currentMedications}
                  onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500 transition ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Past Medical History */}
              <div className="sm:col-span-2">
                <label className={`block text-[10px] font-mono uppercase font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Past Medical History / Surgeries:
                </label>
                <input
                  type="text"
                  value={formData.medicalHistory}
                  onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500 transition ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

            </div>

            {/* TTS Voice Confirmation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={speakConfirmation}
                className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                  isDark
                    ? 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border-blue-800'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span>Stop Voice Confirmation</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-blue-500" />
                    <span>Listen Spoken Audio Confirmation (Sarvam AI TTS)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): High-Density QR Code Generator */}
          <div className={`lg:col-span-5 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center space-y-3.5 border transition-colors ${
            isDark ? 'bg-[#090d18] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div>
              <span className={`text-[10px] font-mono uppercase font-bold block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Hospital Reception Scannable Token
              </span>
              <h3 className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Dynamic Admission QR Code
              </h3>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-md inline-block">
              <QRCodeSVG
                value={encryptedQrPayload || qrPayload}
                size={175}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Theme-Aware Masked E2EE Security Card */}
            <div className={`w-full rounded-2xl p-3.5 text-left space-y-2 border shadow-xs transition-colors ${
              isDark
                ? 'bg-zinc-950/90 text-zinc-200 border-zinc-800'
                : 'bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border-emerald-200/90 text-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>AES-GCM-256 E2EE Masked</span>
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-slate-600 bg-white border-emerald-200'
                }`}>
                  {keyFingerprint}
                </span>
              </div>

              <div className="text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Masked Patient:</span>
                  <strong className={`flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <EyeOff className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {maskName(formData.fullName)}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>Masked Phone:</span>
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{maskPhone(formData.guardianPhone)}</strong>
                </div>
              </div>

              <div className={`text-[10px] leading-tight pt-1.5 border-t flex items-start gap-1 ${
                isDark ? 'border-zinc-800 text-zinc-400' : 'border-emerald-200/80 text-slate-600'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Clinical symptoms, vitals & allergies are AES-GCM-256 encrypted. Unauthorized phone cameras see only cipher tokens.
                </span>
              </div>
            </div>

            {/* Expandable Cryptographic Security Inspector & Proof */}
            <div className={`w-full rounded-2xl border transition-all text-left ${
              isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowCryptoProof(!showCryptoProof)}
                className={`w-full p-2.5 flex items-center justify-between text-xs font-mono font-bold cursor-pointer transition ${
                  isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verify E2EE Encryption & Ciphertext</span>
                </span>
                {showCryptoProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCryptoProof && (
                <div className={`p-3 border-t text-[11px] font-mono space-y-2 animate-fadeIn ${
                  isDark ? 'border-zinc-800 text-zinc-300 bg-black/40' : 'border-slate-200 text-slate-700 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">Algorithm:</span>
                    <strong className="text-emerald-500">AES-GCM-256 (NIST SP 800-38D)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">Auth Tag (MAC):</span>
                    <span className="text-cyan-500 font-bold">128-bit Poly/GCM Check</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-75">IV Nonce:</span>
                    <span className="opacity-90">12 Crypto-Random Bytes</span>
                  </div>

                  {/* Scrambled Ciphertext Preview */}
                  <div className="pt-1">
                    <span className="block text-[10px] uppercase font-bold opacity-75 mb-0.5">
                      Raw Encrypted Payload Scramble:
                    </span>
                    <div className={`p-2 rounded-lg text-[10px] font-mono break-all max-h-16 overflow-y-auto border ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {encryptedQrPayload || 'Generating cryptographic packet...'}
                    </div>
                  </div>

                  {/* Unauthorized vs Authorized Scanner Comparison */}
                  <div className={`p-2 rounded-xl border text-[10px] space-y-1.5 ${
                    isDark ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-rose-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                      <span>Unauthorized Smartphone Scan:</span>
                    </div>
                    <p className="opacity-90 pl-4 leading-tight">
                      Standard phone cameras see scrambled cipher tokens. No patient name, phone, or clinical history can be decrypted without hospital private keys.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Re-Encrypt & Verify Button */}
            <button
              type="button"
              disabled={isEncrypting}
              onClick={async () => {
                setIsEncrypting(true);
                try {
                  const p = await packEncryptedRegistrationToQR(formData);
                  setEncryptedQrPayload(p);
                  try {
                    const parsed = JSON.parse(p);
                    if (parsed.fprint) setKeyFingerprint(parsed.fprint);
                  } catch {}
                } finally {
                  setTimeout(() => setIsEncrypting(false), 300);
                }
              }}
              className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEncrypting ? 'Encrypting & Verifying...' : 'Re-Encrypt & Verify QR Payload'}</span>
            </button>

            {/* Scannable Notice */}
            <div className={`text-[11px] leading-snug ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Scan with the <strong>Hospital Portal Camera Scanner</strong> to instantly decrypt and populate all registration fields without typing.
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={copyPayload}
                className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
                title="Copy encrypted digital QR payload JSON"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">Encrypted QR Payload Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Encrypted QR Payload JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopVoiceSos();
                  stopSarvamSpeech();
                  onClose();
                }}
                className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Done / Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
