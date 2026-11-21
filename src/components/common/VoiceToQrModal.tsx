import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  Radio
} from 'lucide-react';
import type { PatientVoiceRegistration } from '../../types';
import {
  parseSpokenRegistration,
  packRegistrationToQR
} from '../../utils/voiceRegistrationParser';
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

const DEMO_VOICE_PRESETS = [
  {
    label: 'Cardiac (STEMI)',
    badge: 'Code Red',
    text: 'Patient name is Ramesh Sharma, 54-year-old male, blood group B positive. Severe chest pain radiating to left arm. Allergic to penicillin. Taking aspirin 75mg and atorvastatin. History of angioplasty stent in 2021. Guardian phone 9810455678. ABHA ID 91-4820-9182-3921.',
  },
  {
    label: 'Asthma Attack',
    badge: 'Urgent',
    text: 'Patient is Priya Mehra, 29-year-old female, blood group O negative. Severe shortness of breath and wheezing. Allergic to ibuprofen and NSAIDs. Taking budesonide inhaler. History of bronchial asthma. Guardian phone 9911288771.',
  },
  {
    label: 'Accident Trauma',
    badge: 'Emergency',
    text: 'Patient is Harpreet Singh, 42-year-old male, blood group A positive. Right leg compound fracture and blunt chest trauma from road traffic collision. No known drug allergies. Guardian phone 9872165432.',
  },
];

export const VoiceToQrModal: React.FC<VoiceToQrModalProps> = ({
  isOpen,
  onClose,
  initialTranscript = '',
}) => {
  const [transcript, setTranscript] = useState(initialTranscript || '');
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('en-IN');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);

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

  if (!isOpen) return null;

  // Toggle voice listening
  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      await stopVoiceSos();
      return;
    }

    setMicNotice(null);
    const success = await startVoiceSos({
      langCode: voiceLang,
      onTranscript: (spokenText) => {
        setTranscript(spokenText);
        setFormData((prev) => parseSpokenRegistration(spokenText, prev));
      },
      onListeningChange: (listening) => {
        setIsListening(listening);
      },
      onError: (msg) => {
        setMicNotice(msg);
        setIsListening(false);
      },
    });

    if (!success) {
      setIsListening(false);
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
    navigator.clipboard.writeText(qrPayload);
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
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Voice-to-QR Pre-Admission Transfer
                </h2>
                <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                  Zero-Wait ER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Speak patient details in transit &rarr; generate instant QR code &rarr; hospital scans to auto-fill reception form in 0 seconds.
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
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Voice Intake & Presets */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase font-bold text-slate-400">Step 1:</span>
              <span className="text-xs font-bold text-slate-800">Speak or Paste Patient Registration Details</span>
            </div>

            {/* Quick Demo Voice Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
              {DEMO_VOICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setTranscript(p.text);
                    setFormData(parseSpokenRegistration(p.text));
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Box with Live Microphone Button */}
          <div className="relative">
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Click microphone and speak: 'Patient is Ramesh Sharma, 54 Male, severe chest pain, allergic to Penicillin...'"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-2xl p-3.5 pr-28 text-xs font-medium focus:outline-none focus:border-red-500 focus:bg-white transition leading-relaxed"
            />

            <div className="absolute right-3 top-3 flex items-center space-x-1.5">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-IN')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    voiceLang === 'en-IN' ? 'bg-red-50 text-red-600 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('hi-IN')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    voiceLang === 'hi-IN' ? 'bg-red-50 text-red-600 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  HI
                </button>
              </div>

              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                }`}
                title="Toggle Voice Microphone"
              >
                {isListening ? (
                  <>
                    <Radio className="w-3.5 h-3.5 text-white animate-spin" />
                    <span>Listening ({voiceLang === 'hi-IN' ? 'HI' : 'EN'})...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-red-600" />
                    <span>Speak SOS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Mic HUD Status */}
          {isListening && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-red-800 animate-fadeIn font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0"></span>
              <span>
                <strong>Sarvam AI Speech Engine ({voiceLang === 'hi-IN' ? 'Hindi हिन्दी' : 'Indian English'}):</strong> Listening live... Speak patient name, age, symptoms, allergies, and contact phone number.
              </span>
            </div>
          )}

          {micNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{micNotice}</span>
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
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Guardian Contact Phone:
                </label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => handleFieldChange('guardianPhone', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Chief Complaint (Full row) */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Chief Complaint / Symptoms:
                </label>
                <input
                  type="text"
                  value={formData.chiefComplaint}
                  onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Drug Allergies:
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-semibold text-amber-700 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Current Medications:
                </label>
                <input
                  type="text"
                  value={formData.currentMedications}
                  onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Past Medical History */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Past Medical History / Surgeries:
                </label>
                <input
                  type="text"
                  value={formData.medicalHistory}
                  onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Optional ABHA ID */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Optional ABHA Health ID (DigiLocker):
                </label>
                <input
                  type="text"
                  value={formData.optionalAbhaId || ''}
                  placeholder="e.g. 91-4820-9182-3921"
                  onChange={(e) => handleFieldChange('optionalAbhaId', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* TTS Voice Confirmation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={speakConfirmation}
                className="w-full py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Stop Voice Confirmation</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>Listen Spoken Audio Confirmation (Sarvam AI TTS)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): High-Density QR Code Generator */}
          <div className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-between text-center space-y-4 shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                Hospital Reception Scannable Token
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                Dynamic Admission QR Code
              </h3>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-md inline-block">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Scannable Notice */}
            <div className="text-[11px] text-slate-500 leading-snug">
              Scan with the <strong>Hospital Portal Camera Scanner</strong> to instantly populate all registration fields without typing.
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={copyPayload}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                title="Copy QR payload JSON for desktop simulation"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">QR Payload Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Payload JSON (For Test Simulation)</span>
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
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
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
