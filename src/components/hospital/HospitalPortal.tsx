import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { INITIAL_HOSPITALS } from '../../data/mockData';
import type { Doctor, Equipment } from '../../types';
import { 
  Building2, 
  Lock, 
  LogOut, 
  Bed, 
  Stethoscope, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Droplet,
  Edit3,
  Trash2,
  Check,
  Fingerprint,
  Gauge
} from 'lucide-react';

export const HospitalPortal: React.FC = () => {
  const { 
    loggedHospital, 
    loginHospital, 
    logoutHospital, 
    allBookings, 
    updatePatientVitals,
    updateHospitalBeds, 
    updateDoctorStatus,
    addDoctor,
    removeDoctor,
    updateEquipmentStatus,
    addEquipment,
    removeEquipment,
    updateHospitalDetails,
    assignTraumaBay,
    admitPatient
  } = useEmergency();

  // Authentication State
  const [hospCodeInput, setHospCodeInput] = useState<string>('AIIMS-DELHI');
  const [passwordInput, setPasswordInput] = useState<string>('aiims123');
  const [loginError, setLoginError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'incoming' | 'resources' | 'doctors' | 'equipment' | 'history'>('incoming');

  // Edit Hospital Info Modal/Inline State
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');

  // Add Doctor Form State
  const [showAddDoctor, setShowAddDoctor] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocSpec, setNewDocSpec] = useState<string>('Interventional Cardiology & Cath Lab');
  const [newDocBay, setNewDocBay] = useState<string>('Cath Lab 1');
  const [newDocStatus, setNewDocStatus] = useState<Doctor['status']>('AVAILABLE_AND_FREE');

  // Add Equipment Form State
  const [showAddEq, setShowAddEq] = useState<boolean>(false);
  const [newEqName, setNewEqName] = useState<string>('');
  const [newEqCategory, setNewEqCategory] = useState<Equipment['category']>('LIFE_SUPPORT');
  const [newEqLoc, setNewEqLoc] = useState<string>('Trauma Resuscitation');
  const [newEqQty, setNewEqQty] = useState<number>(2);
  const [newEqTotal, setNewEqTotal] = useState<number>(3);

  // Status feedback toast
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginHospital(hospCodeInput, passwordInput);
    if (!success) {
      setLoginError('Invalid Hospital ID or Password. Try AIIMS-DELHI with aiims123.');
    }
  };

  // If not logged in, show Hospital Login screen
  if (!loggedHospital) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-6 animate-fadeIn">
        <div className="liquid-glass-card border border-white/90 rounded-3xl p-6 sm:p-8 oled-glow-emerald space-y-6 bg-white/80 backdrop-blur-xl shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-slate-200 flex items-center justify-center mx-auto text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hospital Staff Portal
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Secure authentication for ER doctors and hospital administrators to manage incoming traumas, bed inventory, and staff rosters.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block uppercase text-slate-500 font-bold mb-1.5 text-[10px]">
                Unique Hospital ID Code
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={hospCodeInput}
                  onChange={(e) => setHospCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AIIMS-DELHI"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:outline-none uppercase shadow-2xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-slate-500 font-bold mb-1.5 text-[10px]">
                Hospital Staff Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:outline-none shadow-2xs"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Login as Hospital Staff</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 text-center font-bold">
              1-Click Demo Hospital Credentials:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {INITIAL_HOSPITALS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setHospCodeInput(h.hospitalCode);
                    setPasswordInput(h.password);
                    loginHospital(h.hospitalCode, h.password);
                  }}
                  className="p-2 rounded-xl bg-black border border-slate-200 hover:border-white/[0.18] text-left transition cursor-pointer"
                >
                  <div className="font-bold text-white text-[11px] truncate">{h.name.split(' ')[0]}</div>
                  <div className="text-[9px] text-slate-500">{h.hospitalCode}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter active incoming bookings for this hospital
  const hospitalBookings = allBookings.filter(
    (b) => b.hospitalId === loggedHospital.id || b.hospitalName.toLowerCase().includes(loggedHospital.name.toLowerCase().split(' ')[0])
  );

  // Save edited hospital info
  const handleSaveHospitalInfo = () => {
    updateHospitalDetails(loggedHospital.id, {
      phone: editPhone || loggedHospital.phone,
      address: editAddress || loggedHospital.address,
    });
    setIsEditingInfo(false);
    showFeedback('Hospital details updated successfully!');
  };

  // Add doctor to hospital roster
  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    addDoctor(loggedHospital.id, {
      name: newDocName.trim(),
      specialization: newDocSpec,
      qualifications: 'MBBS, MD, DM',
      experienceYears: 12,
      status: newDocStatus,
      currentBay: newDocBay,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      phone: '+91-98100-' + Math.floor(10000 + Math.random() * 90000),
    });

    setNewDocName('');
    setShowAddDoctor(false);
    showFeedback(`Dr. ${newDocName} added to the active hospital roster!`);
  };

  // Add equipment to hospital inventory
  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName.trim()) return;

    addEquipment(loggedHospital.id, {
      name: newEqName.trim(),
      category: newEqCategory,
      status: 'READY_AND_STERILIZED',
      location: newEqLoc,
      quantityAvailable: Number(newEqQty),
      totalQuantity: Number(newEqTotal),
    });

    setNewEqName('');
    setShowAddEq(false);
    showFeedback(`${newEqName} added to emergency equipment inventory!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-black font-bold font-mono text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Authenticated Hospital Header */}
      <div className="liquid-glass-card rounded-3xl p-6 border border-white/90 shadow-xl bg-white/80 backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 oled-glow-emerald">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/[0.05] border border-slate-200 text-emerald-400 shrink-0 mt-1 sm:mt-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Hospital ER Command Console
              </span>
              <span className="text-[9px] font-mono bg-white/[0.04] text-slate-700 border border-slate-200 px-2 py-0.2 rounded font-bold">
                ID: {loggedHospital.hospitalCode}
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>ONLINE & LIVE</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {loggedHospital.name}
            </h1>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 font-mono">
              <span>{loggedHospital.address}</span>
              <span>•</span>
              <span className="text-slate-700">Hotline: {loggedHospital.phone}</span>
              <button
                type="button"
                onClick={() => {
                  setEditPhone(loggedHospital.phone);
                  setEditAddress(loggedHospital.address);
                  setIsEditingInfo(!isEditingInfo);
                }}
                className="text-[10px] text-slate-500 hover:text-white underline cursor-pointer ml-1"
              >
                {isEditingInfo ? 'Cancel Edit' : 'Edit Info'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Quick Counters & Logout */}
        <div className="flex items-center space-x-3 self-end md:self-center">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl text-center text-xs font-mono shadow-2xs">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Free ICU Beds</div>
            <div className="text-base font-bold text-emerald-400">{loggedHospital.beds.icuFree} / {loggedHospital.beds.icuTotal}</div>
          </div>

          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl text-center text-xs font-mono shadow-2xs">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Free ER Bays</div>
            <div className="text-base font-bold text-blue-400">{loggedHospital.beds.emergencyFree} / {loggedHospital.beds.emergencyTotal}</div>
          </div>

          <button
            onClick={logoutHospital}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-500 hover:text-rose-300 border border-slate-200 hover:border-rose-500/30 text-xs font-mono transition cursor-pointer"
            title="Logout of Hospital Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Inline Hospital Info Editor */}
      {isEditingInfo && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 animate-fadeIn text-xs font-mono shadow-sm">
          <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Hospital Contact & ER Dispatch Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Emergency Hotline Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 mt-1 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Address & Trauma Center Wing</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 mt-1 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditingInfo(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 text-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveHospitalInfo}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Internal Navigation Tabs (Liquid Glass Dock) */}
      <div className="flex items-center space-x-1.5 bg-slate-100/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'incoming'
              ? 'liquid-btn-red text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'incoming' ? 'text-white' : 'text-red-600'}`} />
          <span>Incoming Patients ({hospitalBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'resources'
              ? 'liquid-btn-red text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Bed className={`w-3.5 h-3.5 ${activeTab === 'resources' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Live Beds Capacity</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'liquid-btn-red text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Stethoscope className={`w-3.5 h-3.5 ${activeTab === 'doctors' ? 'text-white' : 'text-blue-600'}`} />
          <span>Doctor Specialists Roster ({loggedHospital.doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'equipment'
              ? 'liquid-btn-red text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${activeTab === 'equipment' ? 'text-white' : 'text-amber-600'}`} />
          <span>Machinery & OT Suites ({loggedHospital.equipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'liquid-btn-red text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-white' : 'text-purple-600'}`} />
          <span>Admissions Archive</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: ACTIVE INCOMING BOOKINGS (WITH LIVE TELEMETRY)
      ======================================================== */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {hospitalBookings.length > 0 ? (
            hospitalBookings.map((booking) => {
              const vitals = booking.inTransitPaperwork?.initialVitals;
              const abha = booking.inTransitPaperwork?.abhaDetails;
              const isArrived = booking.status === 'ARRIVED_ER';

              return (
                <div
                  key={booking.bookingCode}
                  className="liquid-glass-card rounded-3xl p-6 space-y-5 border border-rose-200/80 bg-white/85 backdrop-blur-xl shadow-lg"
                >
                  {/* Top Row: Patient, ETA & Bay */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          isArrived 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                        }`}>
                          {isArrived ? 'PATIENT ADMITTED IN BAY' : 'CODE RED INCOMING AMBULANCE'}
                        </span>
                        <span className="text-xs font-mono text-slate-700">
                          Patient ID: <strong className="text-white font-mono">{booking.patientUniqueId}</strong>
                        </span>
                        <span className="text-xs font-mono text-slate-700">
                          Driver Code: <strong className="text-emerald-400 font-mono">{booking.bookingCode}</strong>
                        </span>
                        {booking.inTransitPaperwork?.isSubmitted && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>ABHA PRE-ADMITTED</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                        {booking.patientName} ({abha?.age || '54'}y/{abha?.gender || 'M'}) — {booking.aiAnalysis.detectedCondition}
                      </h3>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 font-mono">
                        <span>Ambulance: <strong className="text-white">{booking.ambulanceDetails.vehicleNumber}</strong></span>
                        <span>•</span>
                        <span>Driver: {booking.ambulanceDetails.driverName} ({booking.ambulanceDetails.driverPhone})</span>
                        <span>•</span>
                        <span>Assigned Doctor: Dr. {booking.assignedDoctor.name.split(' ')[1]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[110px] shadow-2xs">
                        <div className="text-[9px] font-mono uppercase text-slate-400">TRAFFIC ETA</div>
                        <div className="text-2xl font-mono font-black text-rose-400 mt-0.5">
                          {isArrived ? 'ARRIVED' : `${booking.ambulanceDetails.currentEtaMins} Mins`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {isArrived ? 'In Trauma Bay' : `${booking.ambulanceDetails.distanceRemainingKm} km away`}
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center min-w-[130px] shadow-2xs">
                        <div className="text-[9px] font-mono uppercase text-emerald-400 font-bold">RESERVED BAY</div>
                        <div className="text-xs font-mono font-bold text-white mt-1">
                          {booking.reservedBay}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400">STATUS: READY</div>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Streamed from Ambulance + ABHA Records */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Live Streamed In-Ambulance Vitals — FULLY EDITABLE TELEMETRY */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200 pb-2">
                        <span className="flex items-center gap-1.5 text-rose-500">
                          <Activity className="w-3.5 h-3.5 animate-pulse" />
                          Live Streamed Vitals (Directly Editable)
                        </span>
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                          EDITABLE • 2-WAY SYNC
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        {/* 1. SpO2 */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold">
                            <span>SpO2 %</span>
                            <span className="text-blue-400">Oxygen</span>
                          </div>

                          <div className="flex items-center justify-center gap-1 my-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newSpO2 = Math.max(60, (vitals?.spO2 || 92) - 1);
                                updatePatientVitals(booking.bookingCode, { spO2: newSpO2 });
                                showFeedback(`SpO2 updated to ${newSpO2}%`);
                              }}
                              className="w-6 h-6 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-xs font-bold cursor-pointer"
                              title="Decrease SpO2"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="60"
                              max="100"
                              value={vitals?.spO2 || 92}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(60, Number(e.target.value)));
                                updatePatientVitals(booking.bookingCode, { spO2: val });
                              }}
                              className="w-12 text-center text-lg font-bold text-blue-400 bg-transparent border-b border-blue-500/40 focus:border-blue-400 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newSpO2 = Math.min(100, (vitals?.spO2 || 92) + 1);
                                updatePatientVitals(booking.bookingCode, { spO2: newSpO2 });
                                showFeedback(`SpO2 updated to ${newSpO2}%`);
                              }}
                              className="w-6 h-6 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-xs font-bold cursor-pointer"
                              title="Increase SpO2"
                            >
                              +
                            </button>
                          </div>

                          <div className={`text-[9px] text-center font-bold ${
                            (vitals?.spO2 || 92) < 90 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {(vitals?.spO2 || 92) < 90 ? '⚠️ Hypoxic' : '✓ Stable'}
                          </div>
                        </div>

                        {/* 2. Heart Rate */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold">
                            <span>Heart Rate</span>
                            <span className="text-rose-400">BPM</span>
                          </div>

                          <div className="flex items-center justify-center gap-1 my-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newHR = Math.max(40, (vitals?.heartRate || 112) - 2);
                                updatePatientVitals(booking.bookingCode, { heartRate: newHR });
                                showFeedback(`Heart rate updated to ${newHR} BPM`);
                              }}
                              className="w-6 h-6 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-xs font-bold cursor-pointer"
                              title="Decrease HR"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="40"
                              max="220"
                              value={vitals?.heartRate || 112}
                              onChange={(e) => {
                                const val = Math.min(220, Math.max(40, Number(e.target.value)));
                                updatePatientVitals(booking.bookingCode, { heartRate: val });
                              }}
                              className="w-14 text-center text-lg font-bold text-rose-400 bg-transparent border-b border-rose-500/40 focus:border-rose-400 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newHR = Math.min(220, (vitals?.heartRate || 112) + 2);
                                updatePatientVitals(booking.bookingCode, { heartRate: newHR });
                                showFeedback(`Heart rate updated to ${newHR} BPM`);
                              }}
                              className="w-6 h-6 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-xs font-bold cursor-pointer"
                              title="Increase HR"
                            >
                              +
                            </button>
                          </div>

                          <div className={`text-[9px] text-center font-bold ${
                            (vitals?.heartRate || 112) > 100 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {(vitals?.heartRate || 112) > 100 ? '⚡ Tachycardia' : '✓ Normal Sinus'}
                          </div>
                        </div>

                        {/* 3. Blood Pressure */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold">
                            <span>BP (Sys/Dia)</span>
                            <span className="text-slate-500">mmHg</span>
                          </div>

                          <div className="flex items-center justify-center gap-1 my-1">
                            <input
                              type="number"
                              min="70"
                              max="240"
                              value={vitals?.bloodPressureSys || 154}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updatePatientVitals(booking.bookingCode, { bloodPressureSys: val });
                              }}
                              className="w-11 text-center text-base font-bold text-white bg-transparent border-b border-white/30 focus:border-white focus:outline-none"
                              title="Systolic"
                            />
                            <span className="text-slate-400 font-bold">/</span>
                            <input
                              type="number"
                              min="40"
                              max="140"
                              value={vitals?.bloodPressureDia || 94}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updatePatientVitals(booking.bookingCode, { bloodPressureDia: val });
                              }}
                              className="w-11 text-center text-base font-bold text-white bg-transparent border-b border-white/30 focus:border-white focus:outline-none"
                              title="Diastolic"
                            />
                          </div>

                          <div className="text-[9px] text-center text-slate-500">
                            {(vitals?.bloodPressureSys || 154) > 140 ? '⚠️ Stage 2 HTN' : '✓ Normotensive'}
                          </div>
                        </div>
                      </div>

                      {/* Respiratory Rate & GCS Steppers */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-700 pt-2 border-t border-slate-200 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[10px]">Resp:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newResp = Math.max(8, (vitals?.respiratoryRate || 24) - 1);
                              updatePatientVitals(booking.bookingCode, { respiratoryRate: newResp });
                            }}
                            className="w-5 h-5 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <strong className="text-white font-mono">{vitals?.respiratoryRate || 24}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              const newResp = Math.min(45, (vitals?.respiratoryRate || 24) + 1);
                              updatePatientVitals(booking.bookingCode, { respiratoryRate: newResp });
                            }}
                            className="w-5 h-5 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-slate-400 text-[10px]">bpm</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[10px]">GCS:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newGcs = Math.max(3, (vitals?.gcsScore || 15) - 1);
                              updatePatientVitals(booking.bookingCode, { gcsScore: newGcs });
                            }}
                            className="w-5 h-5 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <strong className="text-white font-mono">{vitals?.gcsScore || 15}/15</strong>
                          <button
                            type="button"
                            onClick={() => {
                              const newGcs = Math.min(15, (vitals?.gcsScore || 15) + 1);
                              updatePatientVitals(booking.bookingCode, { gcsScore: newGcs });
                            }}
                            className="w-5 h-5 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-slate-500 text-[10px] font-mono">
                          Changes sync live to ambulance
                        </span>
                      </div>
                    </div>

                    {/* Pre-Arrival ABHA Health Passport */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200 pb-2">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Pre-Arrival ABHA Dossier
                        </span>
                        <span className="text-slate-500">ABDM VERIFIED</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="text-[9px] text-slate-400 uppercase">Verified Blood Group</div>
                          <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1">
                            <Droplet className="w-3.5 h-3.5 text-rose-500" />
                            <span>{abha?.bloodGroup || 'B+ (Positive)'}</span>
                          </div>
                        </div>

                        <div className="bg-neutral-950 p-2.5 rounded-xl border border-rose-500/30">
                          <div className="text-[9px] text-rose-400 uppercase font-bold">Critical Drug Allergy</div>
                          <div className="text-xs font-bold text-rose-300 mt-0.5 truncate">
                            ⚠️ {abha?.knownAllergies[0] || 'Penicillin (Anaphylaxis)'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-950 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-between text-[11px]">
                        <span className="text-slate-700">Scheme: {abha?.insuranceProvider || 'PM-JAY Scheme'}</span>
                        <span className="font-bold text-emerald-400">₹5,00,000 Cashless Pre-Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Hospital Action Controls */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase text-slate-500 font-bold shrink-0">
                        Assign / Change Bay:
                      </label>
                      <select
                        value={booking.reservedBay}
                        onChange={(e) => {
                          assignTraumaBay(booking.bookingCode, e.target.value);
                          showFeedback(`Bay updated to ${e.target.value}!`);
                        }}
                        className="bg-neutral-950 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none"
                      >
                        <option value="Trauma Resuscitation Bay #01">Trauma Resuscitation Bay #01</option>
                        <option value="Trauma Bay #03 (Cath Lab 2)">Trauma Bay #03 (Cath Lab 2)</option>
                        <option value="Emergency Cardiac Suite 4">Emergency Cardiac Suite 4</option>
                        <option value="ICU Red Zone Bed #02">ICU Red Zone Bed #02</option>
                        <option value="Burn Resuscitation Unit 1">Burn Resuscitation Unit 1</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isArrived ? (
                        <button
                          type="button"
                          onClick={() => {
                            admitPatient(booking.bookingCode);
                            showFeedback(`Patient ${booking.patientName} marked as ARRIVED & ADMITTED to ${booking.reservedBay}!`);
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Patient Arrived & Admitted to Bay</span>
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Patient Admitted in Bay</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-neutral-950 border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-2">
              <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Active Incoming Dispatches</h4>
              <p className="text-xs text-slate-400">
                When a patient reserves an emergency bed, live patient telemetry and ETA will display here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: FULLY EDITABLE LIVE BEDS CAPACITY CONTROLLER
      ======================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-neutral-950 border border-slate-200 p-5 rounded-3xl text-xs space-y-1">
            <h3 className="text-base font-bold text-white">Live Hospital Bed Capacity Controller</h3>
            <p className="text-slate-500">
              Type numbers directly into the inputs OR use the + / - buttons. Changes immediately update the public emergency patient search and lock algorithm!
            </p>
          </div>

          {/* Future Hardware Track: Piezoelectric Automatic Bed Availability Updating Sensor Grid */}
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/25 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 flex items-center justify-center font-bold">
                <Gauge className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Future Hardware Track
                  </span>
                  <strong className="text-slate-900">Piezoelectric Auto-Bed Updating Sensor Grid</strong>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Under-mattress pressure transducers automatically detect patient weight (&gt;15 kg = Occupied, &lt;5 kg = Vacant) with instant &lt;250ms zero-touch auto-updates.
                </p>
              </div>
            </div>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-pulse"></span>
              <span>Sensors Connected: 12 Bays</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            {/* 1. ICU Beds Controller */}
            <div className="bg-black border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-emerald-400" />
                  ICU Beds
                </span>
                <span className="text-[10px] text-slate-400 font-bold">CRITICAL CARE</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Free Available ICU Beds</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = Math.max(0, loggedHospital.beds.icuFree - 1);
                        updateHospitalBeds(loggedHospital.id, { icuFree: newVal });
                        showFeedback(`ICU free beds updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max={loggedHospital.beds.icuTotal}
                      value={loggedHospital.beds.icuFree}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        updateHospitalBeds(loggedHospital.id, { icuFree: val });
                      }}
                      className="flex-1 bg-neutral-950 text-white font-bold text-2xl text-center py-1.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newVal = loggedHospital.beds.icuFree + 1;
                        updateHospitalBeds(loggedHospital.id, { icuFree: newVal });
                        showFeedback(`ICU free beds updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-400">Total ICU Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={loggedHospital.beds.icuTotal}
                    onChange={(e) => updateHospitalBeds(loggedHospital.id, { icuTotal: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 text-slate-700 text-xs py-1.5 px-3 rounded-xl border border-slate-200 mt-1"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] text-slate-500 flex justify-between">
                  <span>Occupancy:</span>
                  <span className="text-white font-bold">
                    {Math.round(((loggedHospital.beds.icuTotal - loggedHospital.beds.icuFree) / loggedHospital.beds.icuTotal) * 100)}% Occupied
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Emergency Trauma Bays Controller */}
            <div className="bg-black border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs uppercase text-blue-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Trauma Bays
                </span>
                <span className="text-[10px] text-slate-400 font-bold">RESUSCITATION</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Free Emergency Bays</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = Math.max(0, loggedHospital.beds.emergencyFree - 1);
                        updateHospitalBeds(loggedHospital.id, { emergencyFree: newVal });
                        showFeedback(`Emergency bays updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max={loggedHospital.beds.emergencyTotal}
                      value={loggedHospital.beds.emergencyFree}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        updateHospitalBeds(loggedHospital.id, { emergencyFree: val });
                      }}
                      className="flex-1 bg-neutral-950 text-white font-bold text-2xl text-center py-1.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newVal = loggedHospital.beds.emergencyFree + 1;
                        updateHospitalBeds(loggedHospital.id, { emergencyFree: newVal });
                        showFeedback(`Emergency bays updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-400">Total Emergency Bays</label>
                  <input
                    type="number"
                    min="1"
                    value={loggedHospital.beds.emergencyTotal}
                    onChange={(e) => updateHospitalBeds(loggedHospital.id, { emergencyTotal: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 text-slate-700 text-xs py-1.5 px-3 rounded-xl border border-slate-200 mt-1"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] text-slate-500 flex justify-between">
                  <span>Occupancy:</span>
                  <span className="text-white font-bold">
                    {Math.round(((loggedHospital.beds.emergencyTotal - loggedHospital.beds.emergencyFree) / loggedHospital.beds.emergencyTotal) * 100)}% Occupied
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Ventilators Controller */}
            <div className="bg-black border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Ventilators
                </span>
                <span className="text-[10px] text-slate-400 font-bold">LIFE SUPPORT</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Free Ventilators</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = Math.max(0, loggedHospital.beds.ventilatorFree - 1);
                        updateHospitalBeds(loggedHospital.id, { ventilatorFree: newVal });
                        showFeedback(`Ventilators updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max={loggedHospital.beds.ventilatorTotal}
                      value={loggedHospital.beds.ventilatorFree}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        updateHospitalBeds(loggedHospital.id, { ventilatorFree: val });
                      }}
                      className="flex-1 bg-neutral-950 text-white font-bold text-2xl text-center py-1.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newVal = loggedHospital.beds.ventilatorFree + 1;
                        updateHospitalBeds(loggedHospital.id, { ventilatorFree: newVal });
                        showFeedback(`Ventilators updated to ${newVal}`);
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center border border-slate-200 text-lg font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-slate-400">Total Ventilator Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={loggedHospital.beds.ventilatorTotal}
                    onChange={(e) => updateHospitalBeds(loggedHospital.id, { ventilatorTotal: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 text-slate-700 text-xs py-1.5 px-3 rounded-xl border border-slate-200 mt-1"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] text-slate-500 flex justify-between">
                  <span>Occupancy:</span>
                  <span className="text-white font-bold">
                    {Math.round(((loggedHospital.beds.ventilatorTotal - loggedHospital.beds.ventilatorFree) / loggedHospital.beds.ventilatorTotal) * 100)}% Occupied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: FULLY EDITABLE DOCTORS & SPECIALISTS ROSTER
      ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950 border border-slate-200 p-5 rounded-3xl">
            <div>
              <h3 className="text-base font-bold text-white">Emergency Specialists & Doctors Shift Roster</h3>
              <p className="text-xs text-slate-500 font-mono">
                Toggle duty status between Available & Free, In Surgery, and Off Duty. You can also add or remove specialists.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDoctor(!showAddDoctor)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddDoctor ? 'Close Form' : 'Add On-Duty Specialist'}</span>
            </button>
          </div>

          {/* Future Hardware Track: Biometric & BLE Turnstile Doctor Availability System */}
          <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-transparent border border-rose-500/25 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-center justify-center font-bold">
                <Fingerprint className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    Future Hardware Track
                  </span>
                  <strong className="text-slate-900">Biometric & BLE Turnstile Doctor Availability System</strong>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Optical biometric fingerprint & BLE proximity turnstiles at OT scrub rooms automatically verify physical on-duty presence, auto-marking doctors 'In Surgery' or 'Available & Free' in real time.
                </p>
              </div>
            </div>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-pulse"></span>
              <span>Turnstiles Online</span>
            </span>
          </div>

          {/* Add Doctor Form */}
          {showAddDoctor && (
            <form onSubmit={handleAddDoctorSubmit} className="bg-black border border-slate-200 p-5 rounded-3xl space-y-3 animate-fadeIn text-xs font-mono">
              <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Register New On-Duty Doctor / Specialist</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Doctor Full Name</label>
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Rao, MD"
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Specialization</label>
                  <select
                    value={newDocSpec}
                    onChange={(e) => setNewDocSpec(e.target.value)}
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                  >
                    <option value="Interventional Cardiology & Electrophysiology">Interventional Cardiology</option>
                    <option value="Emergency Medicine & Trauma Specialist">Emergency Medicine / Trauma</option>
                    <option value="Neurosurgeon & Neuro-Critical Care">Neurosurgeon / Neuro ICU</option>
                    <option value="Cardiothoracic Vascular Surgeon (CTVS)">CTVS Surgeon</option>
                    <option value="Critical Care Intensivist">Critical Care Intensivist</option>
                    <option value="Pediatric Emergency Specialist">Pediatric Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Assigned Room / Bay</label>
                  <input
                    type="text"
                    value={newDocBay}
                    onChange={(e) => setNewDocBay(e.target.value)}
                    placeholder="e.g. Cath Lab 1, ER Bay 2"
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Duty Status</label>
                  <select
                    value={newDocStatus}
                    onChange={(e) => setNewDocStatus(e.target.value as Doctor['status'])}
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                  >
                    <option value="AVAILABLE_AND_FREE">AVAILABLE_AND_FREE (On Duty Free)</option>
                    <option value="IN_SURGERY">IN_SURGERY (Operating)</option>
                    <option value="OFF_DUTY">OFF_DUTY (Off Shift)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  Add Doctor to Shift Roster
                </button>
              </div>
            </form>
          )}

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {loggedHospital.doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-black p-4 rounded-2xl border border-slate-200 hover:border-slate-200 transition flex items-center justify-between gap-3 font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-sans">{doc.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      doc.status === 'AVAILABLE_AND_FREE'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : doc.status === 'IN_SURGERY'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-neutral-800 text-slate-500'
                    }`}>
                      {doc.status === 'AVAILABLE_AND_FREE' ? 'FREE & ON DUTY' : doc.status === 'IN_SURGERY' ? 'IN SURGERY' : 'OFF DUTY'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700">
                    {doc.specialization}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>Bay: {doc.currentBay}</span>
                    <span>•</span>
                    <span>{doc.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[10px] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateDoctorStatus(loggedHospital.id, doc.id, 'AVAILABLE_AND_FREE');
                      showFeedback(`${doc.name} marked as FREE & AVAILABLE`);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      doc.status === 'AVAILABLE_AND_FREE'
                        ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                        : 'bg-neutral-950 text-slate-500 border-slate-200 hover:text-white'
                    }`}
                  >
                    Set Free
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDoctorStatus(loggedHospital.id, doc.id, 'IN_SURGERY');
                      showFeedback(`${doc.name} marked as IN SURGERY`);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      doc.status === 'IN_SURGERY'
                        ? 'bg-amber-500 text-black border-amber-500 font-bold'
                        : 'bg-neutral-950 text-slate-500 border-slate-200 hover:text-white'
                    }`}
                  >
                    Set In Surgery
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      removeDoctor(loggedHospital.id, doc.id);
                      showFeedback(`${doc.name} removed from roster`);
                    }}
                    className="p-1 rounded text-neutral-600 hover:text-rose-400 text-center transition cursor-pointer"
                    title="Remove from roster"
                  >
                    <Trash2 className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: FULLY EDITABLE MACHINERY & EQUIPMENT INVENTORY
      ======================================================== */}
      {activeTab === 'equipment' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950 border border-slate-200 p-5 rounded-3xl">
            <div>
              <h3 className="text-base font-bold text-white">Emergency Machinery & Surgical Suites</h3>
              <p className="text-xs text-slate-500 font-mono">
                Update sterilization status, available units, or register new critical machines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddEq(!showAddEq)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddEq ? 'Close Form' : 'Register New Machine'}</span>
            </button>
          </div>

          {/* Add Equipment Form */}
          {showAddEq && (
            <form onSubmit={handleAddEquipmentSubmit} className="bg-black border border-slate-200 p-5 rounded-3xl space-y-3 animate-fadeIn text-xs font-mono">
              <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Add Emergency Machinery / Operating Suite</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Machine Name</label>
                  <input
                    type="text"
                    value={newEqName}
                    onChange={(e) => setNewEqName(e.target.value)}
                    placeholder="e.g. Philips Azurion Cath Lab"
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Category</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value as Equipment['category'])}
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                  >
                    <option value="SURGICAL">SURGICAL (Cath Lab / Operating Suite)</option>
                    <option value="IMAGING">IMAGING (CT / MRI / Ultrasound)</option>
                    <option value="LIFE_SUPPORT">LIFE_SUPPORT (Ventilator / Defibrillator)</option>
                    <option value="DIAGNOSTIC">DIAGNOSTIC (Blood Bank / Rapid Lab)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Location</label>
                  <input
                    type="text"
                    value={newEqLoc}
                    onChange={(e) => setNewEqLoc(e.target.value)}
                    placeholder="e.g. Ground Floor Trauma Wing"
                    className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-[10px] text-slate-500 uppercase">Available</label>
                    <input
                      type="number"
                      min="0"
                      value={newEqQty}
                      onChange={(e) => setNewEqQty(Number(e.target.value))}
                      className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] text-slate-500 uppercase">Total</label>
                    <input
                      type="number"
                      min="1"
                      value={newEqTotal}
                      onChange={(e) => setNewEqTotal(Number(e.target.value))}
                      className="w-full bg-neutral-950 text-white p-2 rounded-xl border border-slate-200 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEq(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  Register Machine
                </button>
              </div>
            </form>
          )}

          {/* Machinery Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {loggedHospital.equipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-black p-4 rounded-2xl border border-slate-200 hover:border-slate-200 transition flex items-center justify-between gap-3 font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-sans">{eq.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      eq.status === 'READY_AND_STERILIZED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : eq.status === 'IN_USE'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {eq.status === 'READY_AND_STERILIZED' ? 'READY & STERILIZED' : eq.status === 'IN_USE' ? 'IN USE' : 'MAINTENANCE'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Location: {eq.location} • Category: {eq.category}
                  </div>

                  <div className="text-[10px] text-emerald-400 flex items-center gap-2">
                    <span>Available: <strong>{eq.quantityAvailable}</strong> of {eq.totalQuantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = Math.max(0, eq.quantityAvailable - 1);
                        updateEquipmentStatus(loggedHospital.id, eq.id, eq.status, newQty);
                      }}
                      className="px-1.5 py-0.2 rounded bg-neutral-900 hover:bg-neutral-800 text-white"
                      title="Decrement"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = Math.min(eq.totalQuantity, eq.quantityAvailable + 1);
                        updateEquipmentStatus(loggedHospital.id, eq.id, eq.status, newQty);
                      }}
                      className="px-1.5 py-0.2 rounded bg-neutral-900 hover:bg-neutral-800 text-white"
                      title="Increment"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[10px] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateEquipmentStatus(loggedHospital.id, eq.id, 'READY_AND_STERILIZED');
                      showFeedback(`${eq.name} marked as READY & STERILIZED`);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      eq.status === 'READY_AND_STERILIZED'
                        ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                        : 'bg-neutral-950 text-slate-500 border-slate-200 hover:text-white'
                    }`}
                  >
                    Ready
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateEquipmentStatus(loggedHospital.id, eq.id, 'IN_USE');
                      showFeedback(`${eq.name} marked as IN USE`);
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      eq.status === 'IN_USE'
                        ? 'bg-rose-500 text-white border-rose-500 font-bold'
                        : 'bg-neutral-950 text-slate-500 border-slate-200 hover:text-white'
                    }`}
                  >
                    In Use
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      removeEquipment(loggedHospital.id, eq.id);
                      showFeedback(`${eq.name} removed from equipment inventory`);
                    }}
                    className="p-1 rounded text-neutral-600 hover:text-rose-400 text-center transition cursor-pointer"
                    title="Remove equipment"
                  >
                    <Trash2 className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: PAST ADMISSIONS ARCHIVE
      ======================================================== */}
      {activeTab === 'history' && (
        <div className="bg-neutral-950 border border-slate-200 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Emergency Patient Admissions & Discharges Archive</h3>
              <p className="text-xs text-slate-500 font-mono">
                Log of successfully received trauma cases and Golden Hour interventions.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              AUDITED RECORDS
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-black p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white">Priya Mehra (29F) • Acute Bronchospasm</div>
                <div className="text-slate-400 text-[11px]">ID: PAT-2026-4412 • Resuscitation Bay #01 • SpO2 98% Restored</div>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                DISCHARGED STABILIZED
              </span>
            </div>

            <div className="bg-black p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white">Harpreet Singh (62M) • Traumatic Subdural Hematoma</div>
                <div className="text-slate-400 text-[11px]">ID: PAT-2026-3190 • ICU Bed #04 • Craniotomy Successful</div>
              </div>
              <span className="text-blue-400 text-[10px] font-bold bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/20">
                IN RECOVERY ICU
              </span>
            </div>

            <div className="bg-black p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white">Sunita Verma (48F) • Multiple Rib Fractures & Flail Chest</div>
                <div className="text-slate-400 text-[11px]">ID: PAT-2026-1048 • Bay #02 • Chest Tube Placed</div>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                TRANSFERRED TO SURGICAL WARD
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
