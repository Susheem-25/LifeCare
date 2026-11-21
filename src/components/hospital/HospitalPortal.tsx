import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { INITIAL_HOSPITALS } from '../../data/mockData';
import { sanitizeIdentifier } from '../../utils/security';
import type { Doctor, Equipment, EmergencyBooking } from '../../types';
import { 
  Building2, 
  Bed, 
  Stethoscope, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Minus, 
  Trash2, 
  Lock, 
  LogOut, 
  UserCheck, 
  AlertTriangle, 
  UserPlus, 
  Cpu, 
  Zap, 
  X,
  ShieldCheck 
} from 'lucide-react';

export const HospitalPortal: React.FC = () => {
  const { 
    loggedHospital, 
    loginHospital, 
    logoutHospital, 
    allBookings, 
    updateHospitalBeds, 
    updateDoctorStatus,
    addDoctor,
    removeDoctor,
    updateEquipmentStatus,
    addEquipment,
    removeEquipment,
    admitPatient,
    dischargePatient
  } = useEmergency();

  // Authentication State
  const [hospCodeInput, setHospCodeInput] = useState<string>('AIIMS-DELHI');
  const [passwordInput, setPasswordInput] = useState<string>('aiims123');
  const [loginError, setLoginError] = useState<string>('');

  // Main Tabs: 'patients' | 'beds' | 'doctors' | 'facilities'
  const [hospitalTab, setHospitalTab] = useState<'patients' | 'beds' | 'doctors' | 'facilities'>('patients');

  // Patient Sub-Tabs: 'incoming' | 'admitted' | 'discharged'
  const [patientSubTab, setPatientSubTab] = useState<'incoming' | 'admitted' | 'discharged'>('incoming');

  // Selected Patient for ABHA Medical Details Modal
  const [selectedPatient, setSelectedPatient] = useState<EmergencyBooking | null>(null);

  // Add Doctor Modal State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>('');
  const [docSpec, setDocSpec] = useState<string>('Interventional Cardiology & Electrophysiology');
  const [docQual, setDocQual] = useState<string>('MD, DM (Cardiology)');
  const [docExp, setDocExp] = useState<number>(10);
  const [docPhone, setDocPhone] = useState<string>('+91-98110-12345');
  const [docInitialStatus, setDocInitialStatus] = useState<Doctor['status']>('AVAILABLE_AND_FREE');

  // Add Machine Modal State
  const [showAddMachineModal, setShowAddMachineModal] = useState<boolean>(false);
  const [machName, setMachName] = useState<string>('');
  const [machCategory, setMachCategory] = useState<Equipment['category']>('LIFE_SUPPORT');
  const [machLocation, setMachLocation] = useState<string>('Trauma Resuscitation');
  const [machQtyAvail, setMachQtyAvail] = useState<number>(2);
  const [machQtyTotal, setMachQtyTotal] = useState<number>(3);

  // Toast Feedback Notice
  const [toastNotice, setToastNotice] = useState<string>('');
  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(''), 3500);
  };

  // Hospital Bookings
  const hospitalBookings = loggedHospital
    ? allBookings.filter((b) => b.hospitalId === loggedHospital.id)
    : [];

  // Segregated Patients
  const incomingPatients = hospitalBookings.filter(
    (b) => b.status === 'PENDING_AMBULANCE' || b.status === 'AMBULANCE_EN_ROUTE_PICKUP' || b.status === 'PATIENT_PICKED_UP' || b.status === 'IN_TRANSIT_TO_HOSPITAL'
  );
  const admittedPatients = hospitalBookings.filter(
    (b) => b.status === 'ARRIVED_ER' || b.status === 'ADMITTED'
  );
  const dischargedPatients = hospitalBookings.filter(
    (b) => b.status === 'DISCHARGED'
  );

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginHospital(hospCodeInput, passwordInput);
    if (!success) {
      setLoginError('Invalid Hospital ID or Password. Try AIIMS-DELHI with aiims123.');
    }
  };

  // Handle Add Doctor Submit
  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedHospital || !docName.trim()) return;

    addDoctor(loggedHospital.id, {
      name: docName.trim(),
      specialization: docSpec,
      qualifications: docQual,
      experienceYears: Number(docExp),
      phone: docPhone,
      status: docInitialStatus,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    });

    setDocName('');
    setShowAddDoctorModal(false);
    showToast(`Added ${docName} to doctor roster!`);
  };

  // Handle Add Machine Submit
  const handleAddMachineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedHospital || !machName.trim()) return;

    addEquipment(loggedHospital.id, {
      name: machName.trim(),
      category: machCategory,
      location: machLocation,
      quantityAvailable: Number(machQtyAvail),
      totalQuantity: Number(machQtyTotal),
      status: 'READY_AND_STERILIZED',
    });

    setMachName('');
    setShowAddMachineModal(false);
    showToast(`Added ${machName} to medical facilities!`);
  };

  // Helper for doctor status badge
  const getDoctorStatusLabel = (status: Doctor['status']): { label: string; color: string; normalized: 'Free' | 'Busy' | 'Absent' } => {
    if (status === 'AVAILABLE_AND_FREE' || status === 'FREE') {
      return { label: 'Free on Duty', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', normalized: 'Free' };
    }
    if (status === 'IN_SURGERY' || status === 'BUSY') {
      return { label: 'Busy (In Surgery)', color: 'bg-amber-50 text-amber-700 border-amber-200', normalized: 'Busy' };
    }
    return { label: 'Absent / Off Duty', color: 'bg-slate-100 text-slate-500 border-slate-200', normalized: 'Absent' };
  };

  // 1. IF NOT LOGGED IN: Hospital Staff Login Screen
  if (!loggedHospital) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-6 animate-fadeIn px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/25">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Staff Portal Login
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Secure authentication for ER doctors and hospital administrators to manage live bed inventory, doctor rosters, and patient admissions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Unique Hospital ID
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={hospCodeInput}
                  onChange={(e) => setHospCodeInput(sanitizeIdentifier(e.target.value))}
                  placeholder="e.g. AIIMS-DELHI"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none font-mono font-bold uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 w-full py-3 rounded-xl text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/25"
            >
              <span>Login as Hospital Staff</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase text-center block">
              1-Click Demo Hospital Accounts:
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {INITIAL_HOSPITALS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setHospCodeInput(h.hospitalCode);
                    setPasswordInput(h.password);
                    loginHospital(h.hospitalCode, h.password);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl border border-slate-200 text-left transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-emerald-700 text-[11px]">{h.hospitalCode}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{h.name}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{h.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. IF LOGGED IN: Hospital Command Center Dashboard
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16 px-4">
      {/* Toast Feedback */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Hospital Command Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px]">
                {loggedHospital.hospitalCode}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Level {loggedHospital.traumaLevel} Trauma Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {loggedHospital.name}
            </h1>
            <p className="text-xs text-slate-500">
              {loggedHospital.address} • Hotline: {loggedHospital.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={logoutHospital}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Staff Logout</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setHospitalTab('patients')}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-2 ${
            hospitalTab === 'patients'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Patient Page ({hospitalBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setHospitalTab('beds')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-2 ${
            hospitalTab === 'beds'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Editable Beds</span>
        </button>

        <button
          type="button"
          onClick={() => setHospitalTab('doctors')}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-2 ${
            hospitalTab === 'doctors'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors List ({loggedHospital.doctors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setHospitalTab('facilities')}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center space-x-2 ${
            hospitalTab === 'facilities'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Facilities & Machines</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: PATIENTS PAGE (Segregated: Incoming, Admitted, Discharged)
          ======================================================== */}
      {hospitalTab === 'patients' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-Tabs: Incoming | Admitted | Discharged */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Patient Management Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Segregated by transit & admission lifecycle. Click any patient to view comprehensive ABHA DigiLocker health records.
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPatientSubTab('incoming')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    patientSubTab === 'incoming'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Incoming ({incomingPatients.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientSubTab('admitted')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    patientSubTab === 'admitted'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Admitted ({admittedPatients.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatientSubTab('discharged')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    patientSubTab === 'discharged'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Discharged ({dischargedPatients.length})</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: INCOMING PATIENTS */}
            {patientSubTab === 'incoming' && (
              <div className="space-y-3">
                {incomingPatients.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No incoming emergency ambulances currently en route.
                  </div>
                ) : (
                  incomingPatients.map((patient) => (
                    <div
                      key={patient.bookingCode}
                      onClick={() => setSelectedPatient(patient)}
                      className="p-4 rounded-2xl border-2 border-red-200 hover:border-red-500 bg-red-50/30 hover:bg-red-50/60 transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-red-700 text-xs bg-red-100 px-2 py-0.5 rounded-md">
                            {patient.patientUniqueId}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Ref: {patient.bookingCode}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ETA: {patient.ambulanceDetails.currentEtaMins} mins
                          </span>
                        </div>

                        <div className="text-sm font-extrabold text-slate-900">
                          {patient.emergencyBrief}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Bay: <strong className="text-slate-800">{patient.reservedBay}</strong></span>
                          <span>•</span>
                          <span>Doctor: <strong className="text-slate-800">{patient.assignedDoctor.name}</strong></span>
                          <span>•</span>
                          <span>Ambulance: <strong className="text-slate-800 font-mono">{patient.ambulanceDetails.vehicleNumber}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            admitPatient(patient.bookingCode);
                            showToast(`Patient ${patient.patientUniqueId} admitted to ${patient.reservedBay}!`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Admit to ER Bay
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPatient(patient)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          View ABHA
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-Tab 2: ADMITTED PATIENTS */}
            {patientSubTab === 'admitted' && (
              <div className="space-y-3">
                {admittedPatients.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No patients currently admitted in ER bays.
                  </div>
                ) : (
                  admittedPatients.map((patient) => (
                    <div
                      key={patient.bookingCode}
                      onClick={() => setSelectedPatient(patient)}
                      className="p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50 transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-2 py-0.5 rounded-md">
                            {patient.patientUniqueId}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Active in {patient.reservedBay}
                          </span>
                        </div>

                        <div className="text-sm font-extrabold text-slate-900">
                          {patient.emergencyBrief}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Attending: <strong className="text-slate-800">{patient.assignedDoctor.name}</strong></span>
                          <span>•</span>
                          <span>ABHA Verified: <strong className="text-emerald-700 font-mono">{patient.inTransitPaperwork?.abhaDetails?.abhaId || '91-4820-9182-3921'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dischargePatient(patient.bookingCode);
                            showToast(`Patient ${patient.patientUniqueId} successfully discharged.`);
                          }}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Discharge Patient
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPatient(patient)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          View ABHA
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-Tab 3: DISCHARGED PATIENTS */}
            {patientSubTab === 'discharged' && (
              <div className="space-y-3">
                {dischargedPatients.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No discharged patient history yet.
                  </div>
                ) : (
                  dischargedPatients.map((patient) => (
                    <div
                      key={patient.bookingCode}
                      onClick={() => setSelectedPatient(patient)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 text-xs bg-slate-200 px-2 py-0.5 rounded-md">
                            {patient.patientUniqueId}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            Discharged & Stabilized
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-800">
                          {patient.emergencyBrief}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        View ABHA Record
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: EDITABLE BEDS
          ======================================================== */}
      {hospitalTab === 'beds' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-black text-slate-900">
              Live Bed Inventory Command (All Editable)
            </h2>
            <p className="text-xs text-slate-500">
              Adjust total, ICU, and available bed inventory in real time. All changes persist instantly to the emergency grid.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Emergency Beds */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
                <Bed className="w-4 h-4 text-emerald-600" />
                <span>Emergency Trauma Beds</span>
              </div>

              {/* Free Beds */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-semibold">Available / Free:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        emergencyFree: Math.max(0, loggedHospital.beds.emergencyFree - 1),
                      });
                      showToast('Emergency free beds updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-mono font-black text-emerald-700">
                    {loggedHospital.beds.emergencyFree}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        emergencyFree: loggedHospital.beds.emergencyFree + 1,
                      });
                      showToast('Emergency free beds updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Beds */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total Capacity:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        emergencyTotal: Math.max(0, loggedHospital.beds.emergencyTotal - 1),
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-mono font-bold text-slate-800">
                    {loggedHospital.beds.emergencyTotal}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        emergencyTotal: loggedHospital.beds.emergencyTotal + 1,
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
                <Activity className="w-4 h-4 text-red-600" />
                <span>ICU Critical Beds</span>
              </div>

              {/* Free ICU */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-semibold">Available / Free ICU:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        icuFree: Math.max(0, loggedHospital.beds.icuFree - 1),
                      });
                      showToast('ICU free beds updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-mono font-black text-red-700">
                    {loggedHospital.beds.icuFree}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        icuFree: loggedHospital.beds.icuFree + 1,
                      });
                      showToast('ICU free beds updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total ICU */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total ICU Capacity:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        icuTotal: Math.max(0, loggedHospital.beds.icuTotal - 1),
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-mono font-bold text-slate-800">
                    {loggedHospital.beds.icuTotal}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        icuTotal: loggedHospital.beds.icuTotal + 1,
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ventilators */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>ICU Ventilators</span>
              </div>

              {/* Free Ventilators */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-semibold">Available / Free:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        ventilatorFree: Math.max(0, loggedHospital.beds.ventilatorFree - 1),
                      });
                      showToast('Ventilators updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-mono font-black text-blue-700">
                    {loggedHospital.beds.ventilatorFree}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        ventilatorFree: loggedHospital.beds.ventilatorFree + 1,
                      });
                      showToast('Ventilators updated.');
                    }}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Ventilators */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total Ventilators:</div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        ventilatorTotal: Math.max(0, loggedHospital.beds.ventilatorTotal - 1),
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-mono font-bold text-slate-800">
                    {loggedHospital.beds.ventilatorTotal}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalBeds(loggedHospital.id, {
                        ventilatorTotal: loggedHospital.beds.ventilatorTotal + 1,
                      });
                    }}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: EDITABLE DOCTORS (Status as Free, Busy, Absent + Add Doctor)
          ======================================================== */}
      {hospitalTab === 'doctors' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Doctor Roster (Editable Status: Free, Busy, Absent)
              </h2>
              <p className="text-xs text-slate-500">
                Manage on-duty medical staff. Toggle doctor availability and add new doctors to the hospital roster.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loggedHospital.doctors.map((doctor) => {
              const statusInfo = getDoctorStatusLabel(doctor.status);

              return (
                <div
                  key={doctor.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{doctor.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{doctor.specialization}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{doctor.qualifications} • {doctor.experienceYears}y exp</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        removeDoctor(loggedHospital.id, doctor.id);
                        showToast(`Removed ${doctor.name}`);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Toggle Buttons: Free | Busy | Absent */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Status:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateDoctorStatus(loggedHospital.id, doctor.id, 'AVAILABLE_AND_FREE');
                          showToast(`${doctor.name} set to Free.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                          statusInfo.normalized === 'Free'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Free
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateDoctorStatus(loggedHospital.id, doctor.id, 'IN_SURGERY');
                          showToast(`${doctor.name} set to Busy.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                          statusInfo.normalized === 'Busy'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Busy
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateDoctorStatus(loggedHospital.id, doctor.id, 'OFF_DUTY');
                          showToast(`${doctor.name} set to Absent.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                          statusInfo.normalized === 'Absent'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: FACILITIES & MACHINES (Add Machines, Remove Machines, Editable)
          ======================================================== */}
      {hospitalTab === 'facilities' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Medical Facilities & Emergency Machinery
              </h2>
              <p className="text-xs text-slate-500">
                List of facilities for different emergency treatments (Cath Lab, 256-Slice CT, MRI, Ventilator, Blood Bank). Add, edit, or remove machines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMachineModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Machine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loggedHospital.equipments.map((mach) => (
              <div
                key={mach.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {mach.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{mach.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">Location: {mach.location}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeEquipment(loggedHospital.id, mach.id);
                      showToast(`Removed ${mach.name}`);
                    }}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                    title="Remove Machine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-600">
                    Qty: <strong className="text-slate-900">{mach.quantityAvailable}</strong> / {mach.totalQuantity} Ready
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateEquipmentStatus(loggedHospital.id, mach.id, 'READY_AND_STERILIZED');
                        showToast(`${mach.name} set to Ready.`);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        mach.status === 'READY_AND_STERILIZED'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateEquipmentStatus(loggedHospital.id, mach.id, 'IN_USE');
                        showToast(`${mach.name} set to In Use.`);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        mach.status === 'IN_USE'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      In Use
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateEquipmentStatus(loggedHospital.id, mach.id, 'MAINTENANCE');
                        showToast(`${mach.name} set to Maintenance.`);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        mach.status === 'MAINTENANCE'
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Maint.
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW DOCTOR
          ======================================================== */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Add Doctor to Hospital Roster</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Dr. Raghav Anand"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Specialization</label>
                <select
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  <option value="Interventional Cardiology & Electrophysiology">Interventional Cardiology</option>
                  <option value="Senior Trauma & Critical Care Surgeon">Trauma & Critical Care Surgeon</option>
                  <option value="Neurologist & Acute Stroke Specialist">Neurologist / Stroke Specialist</option>
                  <option value="Senior Pulmonologist & Critical Care Specialist">Senior Pulmonologist</option>
                  <option value="Emergency Medicine Specialist">Emergency Medicine Specialist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={docQual}
                    onChange={(e) => setDocQual(e.target.value)}
                    placeholder="e.g. MD, DM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={docExp}
                    onChange={(e) => setDocExp(Number(e.target.value))}
                    min={1}
                    max={40}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                  placeholder="+91-98110-12345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Initial Status</label>
                <select
                  value={docInitialStatus}
                  onChange={(e) => setDocInitialStatus(e.target.value as Doctor['status'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  <option value="AVAILABLE_AND_FREE">Free on Duty</option>
                  <option value="IN_SURGERY">Busy (In Surgery)</option>
                  <option value="OFF_DUTY">Absent / Off Duty</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD MACHINE
          ======================================================== */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>Add Medical Facility / Machine</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMachineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMachineSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Machine Name</label>
                <input
                  type="text"
                  value={machName}
                  onChange={(e) => setMachName(e.target.value)}
                  placeholder="e.g. Philips Azurion 7 Biplane Cath Lab"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Category</label>
                <select
                  value={machCategory}
                  onChange={(e) => setMachCategory(e.target.value as Equipment['category'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  <option value="SURGICAL">Surgical / Cath Lab</option>
                  <option value="LIFE_SUPPORT">Life Support / Ventilator / ECMO</option>
                  <option value="IMAGING">Imaging (CT / MRI)</option>
                  <option value="DIAGNOSTIC">Diagnostic / Blood Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Location / ER Bay</label>
                <input
                  type="text"
                  value={machLocation}
                  onChange={(e) => setMachLocation(e.target.value)}
                  placeholder="e.g. Wing B, Level 1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Quantity Ready</label>
                  <input
                    type="number"
                    value={machQtyAvail}
                    onChange={(e) => setMachQtyAvail(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Total Quantity</label>
                  <input
                    type="number"
                    value={machQtyTotal}
                    onChange={(e) => setMachQtyTotal(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PATIENT ABHA MEDICAL DETAILS (FETCHED VIA ABHA ID)
          ======================================================== */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ABDM DigiLocker Verified
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Medical Record: {selectedPatient.patientUniqueId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ABHA Dossier Profile Header */}
            {selectedPatient.inTransitPaperwork?.abhaDetails ? (
              <div className="space-y-4">
                {/* Zero-Knowledge Breach Immunity Banner */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero-Knowledge Shield: Identity-Decoupled Clinical Record</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-white border border-emerald-300 px-2 py-0.5 rounded font-bold shrink-0">
                    100% Breach Immune
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-base font-extrabold text-slate-900 font-mono">
                      Record ID: {selectedPatient.inTransitPaperwork.abhaDetails.uniqueRecordId || 'UID-MED-3921'}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Patient Ref: <strong className="text-slate-700">{selectedPatient.patientUniqueId}</strong> • ABHA ID: <strong className="text-slate-700">{selectedPatient.inTransitPaperwork.abhaDetails.abhaId}</strong>
                    </div>
                    <div className="text-emerald-700 font-medium text-[10px] mt-0.5">
                      ✓ Personal identifiers (Name, DOB, Phone) excluded from ingestion for breach security
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                      Blood: {selectedPatient.inTransitPaperwork.abhaDetails.bloodGroup}
                    </span>
                    <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold">
                      {selectedPatient.inTransitPaperwork.abhaDetails.pmjayEligible ? 'PM-JAY Cleared' : 'Insured'}
                    </span>
                  </div>
                </div>

                {/* Critical Medical History Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Allergies */}
                  <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-800 font-extrabold text-[11px] uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Known Allergies:</span>
                    </div>
                    <div className="text-rose-950 font-bold">
                      {selectedPatient.inTransitPaperwork.abhaDetails.knownAllergies.join(', ') || 'No known drug allergies'}
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 uppercase">
                      Chronic Conditions:
                    </div>
                    <div className="text-slate-800">
                      {selectedPatient.inTransitPaperwork.abhaDetails.chronicConditions.join(', ')}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                    <div className="text-[11px] font-extrabold text-slate-700 uppercase">
                      Current Medications:
                    </div>
                    <div className="text-slate-800 font-mono text-[11px]">
                      {selectedPatient.inTransitPaperwork.abhaDetails.currentMedications.join(' • ')}
                    </div>
                  </div>

                  {/* PM-JAY & Insurance */}
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1">
                    <div className="text-[11px] font-extrabold text-emerald-800 uppercase">
                      Insurance & PM-JAY Cashless:
                    </div>
                    <div className="text-emerald-950 font-bold">
                      {selectedPatient.inTransitPaperwork.abhaDetails.pmjayEligible
                        ? 'Ayushman Bharat Eligible (₹5 Lakh Cashless Pre-Authorized)'
                        : selectedPatient.inTransitPaperwork.abhaDetails.insuranceProvider}
                    </div>
                  </div>
                </div>

                {/* Live In-Transit Vitals */}
                {selectedPatient.inTransitPaperwork.initialVitals && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">
                      In-Ambulance Telemetry Vitals:
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-800 p-2 rounded-xl">
                        <div className="text-slate-400 text-[9px]">PULSE</div>
                        <div className="text-emerald-400 font-bold text-sm">{selectedPatient.inTransitPaperwork.initialVitals.heartRate} bpm</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded-xl">
                        <div className="text-slate-400 text-[9px]">SPO2</div>
                        <div className="text-cyan-400 font-bold text-sm">{selectedPatient.inTransitPaperwork.initialVitals.spO2}%</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded-xl">
                        <div className="text-slate-400 text-[9px]">BP</div>
                        <div className="text-amber-400 font-bold text-sm">{selectedPatient.inTransitPaperwork.initialVitals.bloodPressureSys}/{selectedPatient.inTransitPaperwork.initialVitals.bloodPressureDia}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded-xl">
                        <div className="text-slate-400 text-[9px]">GCS</div>
                        <div className="text-purple-400 font-bold text-sm">{selectedPatient.inTransitPaperwork.initialVitals.gcsScore}/15</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Patient registered under Emergency Fast-Track token ({selectedPatient.patientUniqueId}).
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
