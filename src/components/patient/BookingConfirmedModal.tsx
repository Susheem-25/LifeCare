import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  CheckCircle2, 
  X, 
  Ambulance, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Stethoscope, 
  Copy, 
  Check, 
  ArrowRight, 
  User,
  Droplet,
  FileCheck
} from 'lucide-react';
import { fastScrollTo } from '../../utils/scrollHelper';

interface Props {
  onClose: () => void;
}

export const BookingConfirmedModal: React.FC<Props> = ({ onClose }) => {
  const { activeBooking, setCurrentView, selectedAbhaProfile } = useEmergency();
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(1200);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyCode = () => {
    navigator.clipboard.writeText(activeBooking.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyPatientId = () => {
    navigator.clipboard.writeText(activeBooking.patientUniqueId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleGoToDriver = () => {
    onClose();
    setCurrentView('ambulance');
  };

  const handleGoToHospital = () => {
    onClose();
    setCurrentView('hospital');
  };

  const handleGoToAbhaInfo = () => {
    onClose();
    setTimeout(() => {
      fastScrollTo('patient-info-abha-section', 85);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white/95 border border-white/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 oled-glow-red my-8 backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          title="Close Pass"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-mono tracking-wider uppercase font-bold">
            Emergency Bed & Slot Confirmed
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bed Reserved • Ambulance Dispatched
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {activeBooking.hospitalName} has locked your bed in <strong className="text-slate-900">{activeBooking.reservedBay}</strong>.
          </p>
        </div>

        {/* Two IDs: Patient Unique ID & Driver Booking Code */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          {/* 1. Patient Unique ID */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center justify-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Unique Patient ID</span>
            </div>
            <div className="text-xl font-mono font-bold text-slate-900 tracking-wider flex items-center justify-center gap-2">
              <span>{activeBooking.patientUniqueId}</span>
              <button
                onClick={copyPatientId}
                className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shadow-2xs"
                title="Copy Patient ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Permanent ER Reference</div>
          </div>

          {/* 2. Driver Booking Code */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1 shadow-2xs">
            <div className="text-[10px] font-mono uppercase tracking-widest text-rose-700 font-extrabold flex items-center justify-center gap-1">
              <Ambulance className="w-3.5 h-3.5 text-rose-600" />
              <span>Driver Booking Code</span>
            </div>
            <div className="text-2xl font-mono font-black text-rose-600 tracking-wider flex items-center justify-center gap-2">
              <span>{activeBooking.bookingCode}</span>
              <button
                onClick={copyCode}
                className="p-1 rounded-lg bg-white hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer shadow-2xs"
                title="Copy Booking Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-rose-500 font-mono">Give this code to the driver</div>
          </div>
        </div>

        {/* 20-min bed hold guarantee */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-spin" />
            <span>Guaranteed Bed Lock Hold:</span>
          </div>
          <span className="font-extrabold text-rose-600 text-sm">{timeFormatted}</span>
        </div>

        {/* Linked ABHA Patient Data Card in Modal */}
        <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Attached ABHA Patient Info</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              100% PM-JAY COVERED
            </span>
          </div>
          <div className="text-xs font-mono text-slate-700 flex flex-wrap items-center gap-2">
            <span>Name: <strong className="text-slate-900">{activeBooking.patientName}</strong></span>
            <span>•</span>
            <span>ABHA ID: <strong className="text-slate-900">{selectedAbhaProfile?.abhaId || '91-4820-9182-3921'}</strong></span>
            <span>•</span>
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <Droplet className="w-3 h-3 text-rose-600" />
              <span>{selectedAbhaProfile?.bloodGroup || 'O +ve'}</span>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
              <Ambulance className="w-3.5 h-3.5 text-slate-700" />
              <span>Ambulance Dispatched</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">
              {activeBooking.ambulanceDetails.vehicleNumber}
            </div>
            <div className="text-slate-600 text-[11px]">
              Driver: {activeBooking.ambulanceDetails.driverName} ({activeBooking.ambulanceDetails.driverPhone})
            </div>
            <div className="text-emerald-700 font-mono text-[10px] font-bold">
              ETA: {activeBooking.ambulanceDetails.currentEtaMins} mins
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
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
            <div className="text-emerald-700 font-mono text-[10px] font-bold">
              Bay: {activeBooking.reservedBay}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleGoToDriver}
              className="liquid-btn-red flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Ambulance className="w-4 h-4 text-white" />
              <span>Open Driver Cockpit & Maps</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGoToHospital}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Hospital ER Console</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToAbhaInfo}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Fast-Scroll to Patient Info & ABHA ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
