import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import type { Hospital } from '../../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Bed, 
  Stethoscope, 
  Activity, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { BookingConfirmedModal } from './BookingConfirmedModal';
import { AbhaIntakeModal } from './AbhaIntakeModal';
import type { ABHAMedicalRecord } from '../../types';
import { speakText } from '../../utils/speechService';

export const HospitalMatchList: React.FC = () => {
  const { hospitals, bookHospitalBed, activeBooking } = useEmergency();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState<Hospital | null>(null);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'level1' | 'icuBeds' | 'quickTransit'>('all');
  const [expandedRosterId, setExpandedRosterId] = useState<string | null>(null);

  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospitalForBooking(hospital);
    setIsAbhaModalOpen(true);
  };

  const handleConfirmWithAbha = (abha: ABHAMedicalRecord) => {
    if (!selectedHospitalForBooking) return;
    bookHospitalBed(selectedHospitalForBooking.id, abha.fullName, abha.phoneNumber, abha);
    setIsAbhaModalOpen(false);
    setIsModalOpen(true);
  };

  const handleProceedWithoutAbha = () => {
    if (!selectedHospitalForBooking) return;
    bookHospitalBed(selectedHospitalForBooking.id, 'Emergency Patient', '+91-98104-55678', null);
    setIsAbhaModalOpen(false);
    setIsModalOpen(true);
  };

  const displayedHospitals = hospitals.filter((h) => {
    if (filterType === 'level1') return h.traumaLevel === 1;
    if (filterType === 'icuBeds') return h.beds.icuFree >= 4;
    if (filterType === 'quickTransit') return h.transitTimeMins <= 15;
    return true;
  });

  return (
    <div id="hospital-match-list" className="space-y-3.5 scroll-mt-24 w-full max-w-full overflow-hidden">
      {/* Streamlined Section Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-red-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Verified Emergency Centers ({displayedHospitals.length})
          </h2>
        </div>

        {/* Compact Filters */}
        <div className="flex items-center flex-wrap gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium text-xs ${
              filterType === 'all'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All Centers
          </button>

          <button
            type="button"
            onClick={() => setFilterType('level1')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium text-xs ${
              filterType === 'level1'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Level 1 Trauma
          </button>

          <button
            type="button"
            onClick={() => setFilterType('icuBeds')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium text-xs ${
              filterType === 'icuBeds'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            ICU Beds (4+)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('quickTransit')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium text-xs ${
              filterType === 'quickTransit'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            Fast Transit (&le;15m)
          </button>
        </div>
      </div>

      {/* Hospital Cards List */}
      <div className="grid grid-cols-1 gap-3.5">
        {displayedHospitals.map((hospital, index) => {
          const isTopMatch = index === 0;
          const matchScore = hospital.matchScore || (isTopMatch ? 98 : 88 - index * 6);
          const availableDocs = hospital.doctors.filter((d) => d.status === 'AVAILABLE_AND_FREE');
          const isCurrentlyBooked = activeBooking && activeBooking.hospitalId === hospital.id;
          const isRosterExpanded = expandedRosterId === hospital.id;

          return (
            <div
              key={hospital.id}
              className={`rounded-2xl transition-all relative overflow-hidden bg-white border ${
                isCurrentlyBooked
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : isTopMatch
                  ? 'border-red-300 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              } p-4 sm:p-5 space-y-3`}
            >
              {/* Top Match Tag or Booked Tag */}
              {isCurrentlyBooked ? (
                <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-3 bg-emerald-600 text-white text-xs font-semibold px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-1.5 tracking-wide">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">Active Bed Reservation</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-mono shrink-0">
                    Code: {activeBooking?.bookingCode}
                  </span>
                </div>
              ) : isTopMatch ? (
                <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-3 bg-red-50 border-b border-red-100 text-red-800 text-xs font-semibold px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">#1 Recommended Center</span>
                  </div>
                  <span className="text-emerald-700 font-bold text-[11px] shrink-0">&lt;9ms Lock</span>
                </div>
              ) : null}

              {/* Header row: Title, Type, ETA & Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {hospital.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium shrink-0">
                      {hospital.type.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-slate-500 gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[260px] sm:max-w-sm">{hospital.address}</span>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <div className="bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase text-slate-500 block font-semibold">ETA</span>
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {hospital.transitTimeMins}m ({hospital.distanceKm}km)
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase text-emerald-700 block font-semibold">Match</span>
                    <span className="font-bold text-emerald-800 text-xs flex items-center gap-0.5">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      {matchScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Triple Check: Beds, Free Doctors, Ready Machinery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Bed className="w-3.5 h-3.5 text-emerald-600" />
                    ICU Beds:
                  </span>
                  <span className="font-bold text-slate-900">
                    <strong className="text-emerald-700">{hospital.beds.icuFree}</strong> / {hospital.beds.icuTotal} Free
                  </span>
                </div>

                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Specialists:
                  </span>
                  <span className="font-bold text-blue-800">
                    {availableDocs.length} On-Duty Free
                  </span>
                </div>

                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Activity className="w-3.5 h-3.5 text-red-600" />
                    Cath Lab / OT:
                  </span>
                  <span className="font-bold text-emerald-700">
                    Sterilized Ready
                  </span>
                </div>
              </div>

              {/* Expandable Doctor & Machine Roster */}
              {isRosterExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">On-Duty Doctors</span>
                    {hospital.doctors.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 truncate mr-2 font-medium">{doc.name} ({doc.specialization})</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          doc.status === 'AVAILABLE_AND_FREE' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {doc.status === 'AVAILABLE_AND_FREE' ? 'FREE' : 'IN OT'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Machinery & Labs</span>
                    {hospital.equipments.map((eq) => (
                      <div key={eq.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 truncate mr-2 font-medium">{eq.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-semibold">
                          {eq.quantityAvailable}/{eq.totalQuantity} READY
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-200">
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
                  <a
                    href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition"
                    title="Call ER Hotline"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                    <span>ER: <strong>{hospital.phone}</strong></span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setExpandedRosterId(isRosterExpanded ? null : hospital.id)}
                    className="text-slate-500 hover:text-slate-900 transition flex items-center gap-0.5 cursor-pointer text-xs font-medium"
                  >
                    <span>{isRosterExpanded ? 'Hide Roster' : 'View Roster'}</span>
                    {isRosterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      speakText(`${hospital.name}. ${hospital.beds.icuFree} ICU beds available. Estimated transit ${hospital.transitTimeMins} minutes.`);
                    }}
                    className="text-slate-500 hover:text-red-700 transition flex items-center gap-1 cursor-pointer text-xs font-medium"
                    title="Listen to hospital status via Text-to-Speech"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Listen Status</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isCurrentlyBooked ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>View Emergency Pass & GPS</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectHospital(hospital)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full sm:w-auto px-4 py-2 rounded-lg text-xs tracking-tight flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <span>Select Hospital & Reserve Bed</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedHospitals.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Hospitals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No trauma center matches your active filter or search keywords. Click below to show all ready emergency hubs.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            Reset Filters & Show All Hospitals
          </button>
        </div>
      )}

      <AbhaIntakeModal
        isOpen={isAbhaModalOpen}
        hospital={selectedHospitalForBooking}
        onConfirmWithAbha={handleConfirmWithAbha}
        onProceedWithoutAbha={handleProceedWithoutAbha}
        onClose={() => setIsAbhaModalOpen(false)}
      />

      {isModalOpen && (
        <BookingConfirmedModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
