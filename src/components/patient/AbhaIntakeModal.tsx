import React, { useState } from 'react';
import type { Hospital, ABHAMedicalRecord } from '../../types';
import { SAMPLE_ABHA_PROFILES } from '../../data/mockData';
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  UserX,
  Droplet,
  AlertTriangle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  hospital: Hospital | null;
  onConfirmWithAbha: (abha: ABHAMedicalRecord) => void;
  onProceedWithoutAbha: () => void;
  onClose: () => void;
}

export const AbhaIntakeModal: React.FC<Props> = ({
  isOpen,
  hospital,
  onConfirmWithAbha,
  onProceedWithoutAbha,
  onClose,
}) => {
  const [abhaInput, setAbhaInput] = useState<string>('91-4820-9182-3921');
  const [selectedRecord, setSelectedRecord] = useState<ABHAMedicalRecord | null>(SAMPLE_ABHA_PROFILES[0]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  if (!isOpen || !hospital) return null;

  const handleFetch = (idToLookup?: string) => {
    const target = (idToLookup || abhaInput).trim().replace(/[^0-9]/g, '');
    setIsFetching(true);
    setFetchError('');

    setTimeout(() => {
      const match = SAMPLE_ABHA_PROFILES.find(
        (p) => p.abhaId.replace(/[^0-9]/g, '').includes(target) || target.includes(p.abhaId.replace(/[^0-9]/g, ''))
      );
      setIsFetching(false);
      if (match) {
        setSelectedRecord(match);
      } else {
        setFetchError('ABHA ID not found in ABDM registry. Try one of the test profiles below.');
      }
    }, 250);
  };

  const handleSelectPreset = (record: ABHAMedicalRecord) => {
    setAbhaInput(record.abhaId);
    setSelectedRecord(record);
    setFetchError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-5 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Selected Hospital Confirmation Pill */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Reserving Bed At</div>
            <div className="font-bold text-slate-900 truncate text-sm">{hospital.name}</div>
            <div className="text-slate-500 text-[11px]">
              ETA: <strong className="text-slate-800">{hospital.transitTimeMins} mins</strong> • {hospital.distanceKm} km away
            </div>
          </div>
        </div>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ayushman Bharat Digital Mission (ABDM)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient ABHA Health ID
          </h2>
          <p className="text-xs text-slate-500">
            Fetch medical history (blood group, allergies, PM-JAY ₹5L cover) to pre-admit patient with zero waiting.
          </p>
        </div>

        {/* ABHA Input & Lookup Form */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
                placeholder="Enter 14-digit ABHA ID (e.g. 91-4820-9182-3921)"
                className="w-full bg-white text-slate-900 font-mono text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFetch();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleFetch()}
              disabled={isFetching}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {isFetching ? 'Fetching...' : 'Fetch History'}
            </button>
          </div>

          {fetchError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
              {fetchError}
            </div>
          )}

          {/* Quick Demo Profile Chips */}
          <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Demo ABHA:</span>
            {SAMPLE_ABHA_PROFILES.map((p) => (
              <button
                key={p.abhaId}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                  selectedRecord?.abhaId === p.abhaId
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {p.fullName} ({p.bloodGroup.split(' ')[0]})
              </button>
            ))}
          </div>

          {/* Fetched Record Preview */}
          {selectedRecord && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedRecord.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedRecord.fullName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{selectedRecord.abhaId} • {selectedRecord.age}y/{selectedRecord.gender.charAt(0)}</div>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ABDM Verified</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">Blood</span>
                  <span className="font-bold text-red-600 flex items-center gap-0.5 mt-0.5">
                    <Droplet className="w-3 h-3 text-red-500" />
                    {selectedRecord.bloodGroup}
                  </span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">Allergies</span>
                  <span className="font-bold text-amber-700 flex items-center gap-0.5 mt-0.5 truncate">
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    {selectedRecord.knownAllergies[0] || 'None'}
                  </span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-semibold text-[10px]">Insurance</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block truncate">
                    PM-JAY ₹5L
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 border-t border-slate-200">
          {selectedRecord && (
            <button
              type="button"
              onClick={() => onConfirmWithAbha(selectedRecord)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Confirm Reservation with ABHA Records</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            type="button"
            onClick={onProceedWithoutAbha}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
          >
            <UserX className="w-4 h-4 text-slate-500" />
            <span>Proceed without ABHA ID (Emergency / Unconscious Patient)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

