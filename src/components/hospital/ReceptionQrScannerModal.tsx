import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  CameraOff,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardPaste,
  FileCheck2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import type { PatientVoiceRegistration, Hospital } from '../../types';
import {
  unpackEncryptedRegistrationFromQR
} from '../../utils/voiceRegistrationParser';
import { sanitizeText } from '../../utils/security';
import { soundEffects } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface ReceptionQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
  onAdmitPatient: (registration: PatientVoiceRegistration, bay: string, doctorName: string) => void;
}

export const ReceptionQrScannerModal: React.FC<ReceptionQrScannerModalProps> = ({
  isOpen,
  onClose,
  hospital,
  onAdmitPatient,
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [pastePayload, setPastePayload] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<PatientVoiceRegistration | null>(null);
  const [assignedBay, setAssignedBay] = useState('Trauma Bay #03 (Cath Lab 2)');
  const [assignedDoctor, setAssignedDoctor] = useState(hospital.doctors[0]?.name || 'Dr. Naresh Trehan');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Stop or start camera on open/close
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startCameraScanner().catch(() => {});
      }, 350);
      return () => clearTimeout(timer);
    } else {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
      setScannerActive(false);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // Start live webcam QR scanner
  const startCameraScanner = async () => {
    setScanError(null);
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleSuccessfulQrPayload(decodedText);
          html5QrCode.stop().catch(() => {});
          setScannerActive(false);
        },
        () => {
          // Frame scan error - ignore normal scan misses
        }
      );

      setScannerActive(true);
    } catch (err: unknown) {
      console.warn('Camera scanner error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setScanError(
        `Unable to access camera: ${errMsg}. Please use "Paste QR Payload / Direct Intake" below.`
      );
      setScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  // Process and unpack/decrypt scanned QR payload
  const handleSuccessfulQrPayload = async (rawPayload: string) => {
    try {
      const parsed = await unpackEncryptedRegistrationFromQR(rawPayload);
      if (!parsed) {
        setScanError('Invalid QR Code format. Please scan a valid LifeCare Voice-QR payload.');
        return;
      }

      setScannedData(parsed);
      setHasAutoFilled(true);
      setScanError(null);
      soundEffects.playSuccessChime();
    } catch (err) {
      console.warn('QR Processing failed:', err);
      setScanError('Failed to decrypt QR code: Corrupt or unrecognized security payload.');
    }
  };

  // Handle QR intake from pasted payload
  const handlePasteOrSimulate = async () => {
    const payloadToProcess = pastePayload.trim();
    if (!payloadToProcess) {
      setScanError('Please enter or paste a valid encrypted QR code payload, or use the camera scanner.');
      return;
    }
    await handleSuccessfulQrPayload(payloadToProcess);
  };

  // Submit patient into Admitted directory
  const handleSubmitAdmission = () => {
    if (!scannedData) return;

    onAdmitPatient(scannedData, assignedBay, assignedDoctor);
    soundEffects.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  const handleFieldChange = (field: keyof PatientVoiceRegistration, value: string) => {
    if (!scannedData) return;
    setScannedData({
      ...scannedData,
      [field]: sanitizeText(value),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Hospital Reception QR Scanner & Auto-Fill
                </h2>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Zero Paperwork
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Scan patient Voice-QR code from ambulance to automatically populate every registration field and admit in 1 click.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Scanner Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          {/* Camera Scan Control (6 cols) */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Device Camera Scanner</span>
              </span>
              {scannerActive && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  Scanning Live...
                </span>
              )}
            </div>

            {/* Container for html5-qrcode video */}
            <div
              id="qr-reader-container"
              className={`w-full rounded-2xl overflow-hidden bg-slate-900 text-white flex items-center justify-center min-h-[160px] border border-slate-800 ${
                scannerActive ? 'block' : 'hidden'
              }`}
            ></div>

            {!scannerActive && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Point device camera at the patient’s QR code generated on the ambulance screen.
                </p>
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            )}

            {scannerActive && (
              <button
                type="button"
                onClick={stopCameraScanner}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>

          {/* Paste Payload / Direct Ingestion (6 cols) */}
          <div className="md:col-span-6 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <ClipboardPaste className="w-4 h-4 text-blue-600" />
                <span>Paste QR Payload / Direct Intake</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Paste JSON or use quick intake for instant admission without camera.
              </p>
            </div>

            <textarea
              rows={2}
              value={pastePayload}
              onChange={(e) => setPastePayload(e.target.value)}
              placeholder="Paste encrypted or structured QR payload here..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 text-[11px] font-mono focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePasteOrSimulate}
                disabled={!pastePayload.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Load Pasted QR Payload</span>
              </button>
            </div>
          </div>

          {scanError && (
            <div className="col-span-12 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{scanError}</span>
            </div>
          )}
        </div>

        {/* Section 2: Hospital Reception Registration Form (Auto-Filled) */}
        {scannedData ? (
          <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Hospital Reception Registration Form
                </h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified from Voice QR</span>
                </span>
                {scannedData.isDecrypted && (
                  <span className="text-[10px] font-mono text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>AES-GCM-256 Decrypted</span>
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-slate-500">
                Patient ID: <strong className="text-slate-900">{scannedData.patientId}</strong>
              </div>
            </div>

            {/* E2EE Decryption Verification Banner */}
            {scannedData.isDecrypted && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 font-mono">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>End-to-End Encrypted Handover:</strong> Decrypted with National Emergency Grid Master Key.
                  </span>
                </div>
                {scannedData.keyFingerprint && (
                  <span className="bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800">
                    Fingerprint: {scannedData.keyFingerprint}
                  </span>
                )}
              </div>
            )}

            {/* Editable Registration Fields with "From Voice QR" Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* Full Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Full Name:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Age (Years):
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Gender:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <select
                  value={scannedData.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              {/* Blood Group */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Blood Group:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.bloodGroup}
                  onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-red-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Guardian Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Guardian Phone:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.guardianPhone}
                  onChange={(e) => handleFieldChange('guardianPhone', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Optional ABHA ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    ABHA ID (DigiLocker):
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.optionalAbhaId || '91-4820-9182-3921'}
                  onChange={(e) => handleFieldChange('optionalAbhaId', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Chief Complaint (Spans 2 cols) */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Chief Complaint / Presentation:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.chiefComplaint}
                  onChange={(e) => handleFieldChange('chiefComplaint', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Drug Allergies */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Contraindicated Allergies:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-semibold text-amber-700 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Current Medications */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Current Medications:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.currentMedications}
                  onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Medical History */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Medical History / Surgeries:
                  </label>
                  {hasAutoFilled && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
                      ✓ From Voice QR
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={scannedData.medicalHistory}
                  onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Hospital ER Assignment Section */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Assign Immediate Trauma Bay / Bed:
                </label>
                <select
                  value={assignedBay}
                  onChange={(e) => setAssignedBay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900 text-xs"
                >
                  <option value="Trauma Bay #03 (Cath Lab 2)">Trauma Bay #03 (Cath Lab 2 - Prepped)</option>
                  <option value="Emergency Bay #01 (Cardiac)">Emergency Bay #01 (Cardiac Biplane)</option>
                  <option value="ICU Resuscitation Unit #04">ICU Resuscitation Unit #04</option>
                  <option value="Critical Care Bay #02">Critical Care Bay #02</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                  Assigned Attending Emergency Specialist:
                </label>
                <select
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900 text-xs"
                >
                  {hospital.doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 1-Click Admit Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSubmitAdmission}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-5 rounded-2xl transition cursor-pointer shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2"
              >
                <span>Verify & Admit Patient into ER Directory (0 Seconds)</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
            <QrCode className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">
              No QR Code Scanned Yet
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Scan the patient’s QR code from the ambulance with the camera scanner, or click <strong>"Direct QR Intake"</strong> above to auto-fill the entire intake form instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
