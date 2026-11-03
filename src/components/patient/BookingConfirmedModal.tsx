import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  CheckCircle2, 
  X, 
  Ambulance, 
  Clock, 
  ShieldCheck, 
  Stethoscope, 
  Copy, 
  Check, 
  User,
  Droplet,
  Navigation,
  Volume2,
  VolumeX
} from 'lucide-react';
import { fastScrollTo } from '../../utils/scrollHelper';
import { speakText, stopSpeaking } from '../../utils/speechService';

interface Props {
  onClose: () => void;
}

export const BookingConfirmedModal: React.FC<Props> = ({ onClose }) => {
  const { activeBooking, selectedAbhaProfile } = useEmergency();
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(1200);
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!activeBooking) return null;

  const handleReadAloud = () => {
    if (isReadingAloud) {
      stopSpeaking();
      setIsReadingAloud(false);
      return;
    }
    const speech = `Emergency bed confirmed at ${activeBooking.hospitalName}. Unique Patient ID is ${activeBooking.patientUniqueId}. Driver assigned is ${activeBooking.ambulanceDetails.driverName}. Ambulance arriving in ${activeBooking.ambulanceDetails.currentEtaMins} minutes. Bay reserved: ${activeBooking.reservedBay}.`;
    speakText(speech, {
      langCode: 'en-IN',
      onStart: () => setIsReadingAloud(true),
      onEnd: () => setIsReadingAloud(false),
      onError: () => setIsReadingAloud(false),
    });
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyCode = () => {
    if (activeBooking) {
      navigator.clipboard.writeText(activeBooking.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyPatientId = () => {
    if (activeBooking) {
      navigator.clipboard.writeText(activeBooking.patientUniqueId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleTrackGps = () => {
    onClose();
    setTimeout(() => {
      fastScrollTo('patient-active-booking-section', 85);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-4 sm:p-7 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Top Actions: Read Aloud & Close */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReadAloud}
            className={`p-1.5 px-2.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isReadingAloud
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title="Read confirmation pass aloud via Text-to-Speech"
          >
            {isReadingAloud ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-slate-600" />}
            <span className="hidden sm:inline">{isReadingAloud ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            title="Close Pass"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            Emergency Bed & Slot Confirmed
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bed Reserved • Ambulance Dispatched
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {activeBooking.hospitalName} has locked your bed in <strong className="text-slate-900">{activeBooking.reservedBay}</strong>.
          </p>
        </div>

        {/* Two IDs: Patient Unique ID & Driver Booking Code */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          {/* 1. Patient Unique ID */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Unique Patient ID</span>
            </div>
            <div className="text-lg font-mono font-bold text-slate-900 tracking-wider flex items-center justify-center gap-2">
              <span>{activeBooking.patientUniqueId}</span>
              <button
                onClick={copyPatientId}
                className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer"
                title="Copy Patient ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">Permanent ER Reference</div>
          </div>

          {/* 2. Driver Booking Code */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs uppercase tracking-wider text-red-700 font-bold flex items-center justify-center gap-1">
              <Ambulance className="w-3.5 h-3.5 text-red-600" />
              <span>Driver Booking Code</span>
            </div>
            <div className="text-2xl font-mono font-bold text-red-600 tracking-wider flex items-center justify-center gap-2">
              <span>{activeBooking.bookingCode}</span>
              <button
                onClick={copyCode}
                className="p-1 rounded-md bg-white hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                title="Copy Booking Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[11px] text-red-500">Give this code to the driver</div>
          </div>
        </div>

        {/* 20-min bed hold guarantee */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-red-600 animate-spin" />
            <span className="font-medium">Guaranteed Bed Lock Hold:</span>
          </div>
          <span className="font-mono font-bold text-red-600 text-xs">{timeFormatted}</span>
        </div>

        {/* Linked ABHA Patient Data Card in Modal */}
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Attached ABHA Patient Info</span>
            </span>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
              PM-JAY 100% Covered
            </span>
          </div>
          <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2">
            <span>Name: <strong className="text-slate-900">{activeBooking.patientName}</strong></span>
            <span>•</span>
            <span>ABHA ID: <strong className="font-mono text-slate-900">{selectedAbhaProfile?.abhaId || '91-4820-9182-3921'}</strong></span>
            <span>•</span>
            <span className="text-red-600 font-semibold flex items-center gap-1">
              <Droplet className="w-3 h-3 text-red-600" />
              <span>{selectedAbhaProfile?.bloodGroup || 'O +ve'}</span>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="text-[11px] uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <Ambulance className="w-3.5 h-3.5 text-slate-700" />
              <span>Ambulance Dispatched</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-xs">
              {activeBooking.ambulanceDetails.vehicleNumber}
            </div>
            <div className="text-slate-600 text-[11px]">
              Driver: {activeBooking.ambulanceDetails.driverName} ({activeBooking.ambulanceDetails.driverPhone})
            </div>
            <div className="text-emerald-700 text-[11px] font-semibold">
              ETA: {activeBooking.ambulanceDetails.currentEtaMins} mins
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="text-[11px] uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assigned Hospital ER</span>
            </div>
            <div className="font-bold text-slate-900 truncate">
              {activeBooking.hospitalName}
            </div>
            <div className="text-slate-600 text-[11px] flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-slate-500" />
              <span>{activeBooking.assignedDoctor.name}</span>
            </div>
            <div className="text-emerald-700 text-[11px] font-semibold">
              Bay: {activeBooking.reservedBay}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleTrackGps}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Navigation className="w-4 h-4 text-white" />
            <span>Track Live Ambulance GPS on Map</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer border border-slate-200 text-center"
          >
            Close Confirmation Pass
          </button>
        </div>
      </div>
    </div>
  );
};
