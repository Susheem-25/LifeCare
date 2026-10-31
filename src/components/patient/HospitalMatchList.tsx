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
  FileCheck,
  Search,
  Filter
} from 'lucide-react';
import { BookingConfirmedModal } from './BookingConfirmedModal';
import { fastScrollTo } from '../../utils/scrollHelper';

export const HospitalMatchList: React.FC = () => {
  const { hospitals, bookHospitalBed, activeBooking } = useEmergency();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'level1' | 'icuBeds' | 'quickTransit'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleBook = (hospital: Hospital) => {
    setIsBooking(hospital.id);
    setTimeout(() => {
      bookHospitalBed(hospital.id);
      setIsBooking(null);

      // Fast scroll to patient info (ABHA ID) section
      setTimeout(() => {
        fastScrollTo('patient-info-abha-section', 85);
      }, 60);
    }, 280);
  };

  const displayedHospitals = hospitals.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.type.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterType === 'level1') return h.traumaLevel === 1;
    if (filterType === 'icuBeds') return h.beds.icuFree >= 4;
    if (filterType === 'quickTransit') return h.transitTimeMins <= 15;
    return true;
  });

  return (
    <div id="hospital-match-list" className="space-y-6 scroll-mt-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-600" />
            <span>Emergency Hospital & Trauma Center Hubs</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time verified: beds, on-duty free specialists, and sterilized machinery ready for immediate admission.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-pulse"></span>
            <span>Live Inventory Active</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-mono">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer font-bold ${
              filterType === 'all'
                ? 'liquid-btn-red text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            All Centers ({hospitals.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('level1')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer font-bold ${
              filterType === 'level1'
                ? 'liquid-btn-red text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            Level 1 Trauma Only
          </button>

          <button
            type="button"
            onClick={() => setFilterType('icuBeds')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer font-bold ${
              filterType === 'icuBeds'
                ? 'liquid-btn-red text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            Available ICU Beds (4+)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('quickTransit')}
            className={`px-3 py-1 rounded-xl transition cursor-pointer font-bold ${
              filterType === 'quickTransit'
                ? 'liquid-btn-red text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            Fast Transit (&le;15m)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital or area..."
            className="w-full bg-white text-slate-800 placeholder:text-slate-400 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Hospital Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {displayedHospitals.map((hospital, index) => {
          const isTopMatch = index === 0;
          const matchScore = hospital.matchScore || (isTopMatch ? 98 : 88 - index * 6);
          const availableDocs = hospital.doctors.filter((d) => d.status === 'AVAILABLE_AND_FREE');
          const isCurrentlyBooked = activeBooking && activeBooking.hospitalId === hospital.id;

          return (
            <div
              key={hospital.id}
              className={`rounded-3xl transition-all duration-200 relative overflow-hidden liquid-glass-card border ${
                isCurrentlyBooked
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                  : isTopMatch
                  ? 'border-rose-300 ring-1 ring-rose-200 bg-white/80'
                  : 'border-white/90 bg-white/70 hover:bg-white/90 hover:border-slate-300'
              } p-5 sm:p-6 space-y-5 shadow-md`}
            >
              {/* Top Match Tag or Booked Tag */}
              {isCurrentlyBooked ? (
                <div className="-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 bg-emerald-600 text-white text-[11px] font-mono font-bold px-5 py-2 flex items-center justify-between tracking-wider uppercase shadow-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Active Bed Reservation At This Hospital</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
                    Driver Code: {activeBooking.bookingCode}
                  </span>
                </div>
              ) : isTopMatch ? (
                <div className="-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-[10px] font-mono font-bold px-5 py-1.5 flex items-center justify-between tracking-wider uppercase">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>#1 Recommended Hospital for this Emergency</span>
                  </div>
                  <span className="text-emerald-700 font-extrabold">Zero Triage Delay</span>
                </div>
              ) : null}

              {/* Header row: Title, Type, ETA & Score */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {hospital.type}
                    </span>
                    {hospital.accreditation.map((acc, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                        {acc}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {hospital.name}
                  </h3>

                  <div className="flex items-center text-xs text-slate-500 gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hospital.address}</span>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="bg-white/90 border border-slate-200 p-2.5 rounded-2xl text-center min-w-[85px] shadow-2xs">
                    <div className="text-[9px] font-mono uppercase text-slate-400 font-semibold">Transit ETA</div>
                    <div className="text-xl font-mono font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{hospital.transitTimeMins}m</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{hospital.distanceKm} km</div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl text-center min-w-[85px] shadow-2xs">
                    <div className="text-[9px] font-mono uppercase text-emerald-700 font-bold">Match Score</div>
                    <div className="text-xl font-mono font-bold text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{matchScore}%</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold">Ready</div>
                  </div>
                </div>
              </div>

              {/* Triple Check: Beds, Free Doctors, Ready Machinery */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Beds */}
                <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-700 uppercase font-bold flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      Live Beds
                    </span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="text-[9px] text-slate-500 font-mono uppercase font-semibold">ICU Beds</div>
                      <div className="font-mono font-bold text-slate-900 text-base">
                        <span className="text-emerald-600">{hospital.beds.icuFree}</span>
                        <span className="text-slate-400 text-xs font-normal"> / {hospital.beds.icuTotal}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="text-[9px] text-slate-500 font-mono uppercase font-semibold">ER Bays</div>
                      <div className="font-mono font-bold text-slate-900 text-base">
                        <span className="text-emerald-600">{hospital.beds.emergencyFree}</span>
                        <span className="text-slate-400 text-xs font-normal"> / {hospital.beds.emergencyTotal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    <span>Ventilators: {hospital.beds.ventilatorFree} Free</span>
                  </div>
                </div>

                {/* Free On-Duty Specialists */}
                <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-700 uppercase font-bold flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      On-Duty Specialists
                    </span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                      {availableDocs.length} FREE NOW
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1">
                    {hospital.doctors.map((doc) => {
                      const isFree = doc.status === 'AVAILABLE_AND_FREE';
                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-1.5 rounded-xl border text-xs ${
                            isFree
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-slate-50/50 border-transparent text-slate-400'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-bold truncate text-[11px] text-slate-900">{doc.name}</div>
                            <div className="text-[9px] text-slate-500 truncate font-mono">{doc.specialization}</div>
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                              isFree
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isFree ? 'FREE' : 'IN SURGERY'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ready Sterilized Machinery */}
                <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-700 uppercase font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      Equipment & Labs
                    </span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                      STERILIZED
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1">
                    {hospital.equipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <span className="truncate mr-2 text-[11px] text-slate-700 font-medium">
                          {eq.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                          READY ({eq.quantityAvailable}/{eq.totalQuantity})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>ER Direct Line: <strong className="text-slate-800">{hospital.phone}</strong></span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isCurrentlyBooked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fastScrollTo('patient-info-abha-section', 85)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs tracking-tight flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-200 shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Patient Info & ABHA Record</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs tracking-tight flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300 shadow-2xs"
                      >
                        <span>View Bed Lock Pass</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBook(hospital)}
                      disabled={isBooking === hospital.id}
                      className="liquid-btn-red w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-bold text-xs tracking-tight flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-95"
                      title="Reserve bed and fast-scroll to Patient Info (ABHA ID)"
                    >
                      {isBooking === hospital.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Locking Bed & Machinery...</span>
                        </>
                      ) : (
                        <>
                          <span>Reserve Bed & Dispatch Ambulance</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <BookingConfirmedModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
