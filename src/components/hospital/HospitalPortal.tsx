import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { sanitizeText } from '../../utils/security';
import type { Doctor, Equipment, Hospital } from '../../types';
import { 
  Building2, 
  Bed, 
  Stethoscope, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Trash2, 
  LogOut, 
  UserCheck, 
  UserPlus, 
  Cpu, 
  Zap, 
  X,
  QrCode,
  Radio,
  Sparkles,
  Loader2,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { ReceptionQrScannerModal } from './ReceptionQrScannerModal';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const HospitalPortal: React.FC = () => {
  const { 
    loggedHospital, 
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
    dischargePatient,
    admitVoiceQrPatient,
    loginWithGoogle,
    currentUser,
    registerHospitalDetails
  } = useEmergency();

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Hospital Onboarding State (after Google Sign-In)
  const [onboardHospName, setOnboardHospName] = useState('Apollo Trauma & Emergency Center');
  const [onboardHospType, setOnboardHospType] = useState<Hospital['type']>('Trauma Center Level 1');
  const [onboardAddress, setOnboardAddress] = useState('Sarita Vihar, Delhi Mathura Road');
  const [onboardCity, setOnboardCity] = useState('New Delhi');
  const [onboardPhone, setOnboardPhone] = useState('+91-11-2692-5858');

  // Bed inventory inputs
  const [onboardIcuTotal, setOnboardIcuTotal] = useState(30);
  const [onboardIcuFree, setOnboardIcuFree] = useState(8);
  const [onboardEmergTotal, setOnboardEmergTotal] = useState(50);
  const [onboardEmergFree, setOnboardEmergFree] = useState(14);
  const [onboardVentTotal, setOnboardVentTotal] = useState(20);
  const [onboardVentFree, setOnboardVentFree] = useState(6);

  // Onboarding Doctors List
  const [onboardDoctors, setOnboardDoctors] = useState<Doctor[]>([
    {
      id: 'doc-1',
      name: 'Dr. Vikramaditya Rathore',
      specialization: 'Interventional Cardiology & Electrophysiology',
      qualifications: 'MD, DM (Cardiology), FACC',
      experienceYears: 18,
      status: 'AVAILABLE_AND_FREE',
      currentBay: 'Cath Lab 2 / Bay 4',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      phone: '+91-98110-23451',
    },
    {
      id: 'doc-2',
      name: 'Dr. Sunita Kulkarni',
      specialization: 'Senior Trauma & Critical Care Surgeon',
      qualifications: 'MS (General Surgery), MCh (Trauma Surgery)',
      experienceYears: 14,
      status: 'AVAILABLE_AND_FREE',
      currentBay: 'Trauma Resuscitation Bay 1',
      avatar: 'https://images.unsplash.com/photo-1594824813583-8a903264421b?w=150&auto=format&fit=crop&q=80',
      phone: '+91-98110-89123',
    },
  ]);

  // Onboarding Equipments & Facilities List
  const [onboardEquipments, setOnboardEquipments] = useState<Equipment[]>([
    {
      id: 'eq-1',
      name: 'Cath Lab Biplane Philips Azurion 7',
      category: 'LIFE_SUPPORT',
      status: 'READY_AND_STERILIZED',
      location: 'Trauma Bay #03 (Cath Lab 2)',
      quantityAvailable: 1,
      totalQuantity: 1,
    },
    {
      id: 'eq-2',
      name: 'Zoll R Series ALS Defibrillator & Pacer',
      category: 'LIFE_SUPPORT',
      status: 'READY_AND_STERILIZED',
      location: 'Trauma Resuscitation Bay 1',
      quantityAvailable: 3,
      totalQuantity: 4,
    },
    {
      id: 'eq-3',
      name: 'Hamilton-G5 High Precision ICU Ventilators',
      category: 'LIFE_SUPPORT',
      status: 'READY_AND_STERILIZED',
      location: 'Trauma Resuscitation & ICU',
      quantityAvailable: 4,
      totalQuantity: 5,
    },
  ]);

  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');

  // Inline add doctor drawer state for onboarding
  const [isAddingDocInline, setIsAddingDocInline] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('Emergency Medicine Specialist');
  const [newDocExp, setNewDocExp] = useState(10);
  const [newDocBay, setNewDocBay] = useState('ER Trauma Bay 1');
  const [newDocPhone, setNewDocPhone] = useState('+91-98110-00000');

  // Inline add equipment drawer state for onboarding
  const [isAddingMachInline, setIsAddingMachInline] = useState(false);
  const [newMachName, setNewMachName] = useState('');
  const [newMachCategory, setNewMachCategory] = useState<Equipment['category']>('LIFE_SUPPORT');
  const [newMachBay, setNewMachBay] = useState('Trauma Resuscitation');
  const [newMachQty, setNewMachQty] = useState(2);

  // Handle adding doctor during onboarding
  const handleAddDoctorInline = () => {
    if (!newDocName.trim()) return;
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: sanitizeText(newDocName),
      specialization: sanitizeText(newDocSpec),
      qualifications: 'MBBS, MD',
      experienceYears: Number(newDocExp) || 5,
      status: 'AVAILABLE_AND_FREE',
      currentBay: sanitizeText(newDocBay),
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      phone: sanitizeText(newDocPhone),
    };
    setOnboardDoctors((prev) => [...prev, newDoc]);
    setNewDocName('');
    setIsAddingDocInline(false);
  };

  // Handle adding machine during onboarding
  const handleAddMachineInline = () => {
    if (!newMachName.trim()) return;
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      name: sanitizeText(newMachName),
      category: newMachCategory,
      status: 'READY_AND_STERILIZED',
      location: sanitizeText(newMachBay),
      quantityAvailable: Number(newMachQty) || 1,
      totalQuantity: Number(newMachQty) || 1,
    };
    setOnboardEquipments((prev) => [...prev, newEq]);
    setNewMachName('');
    setIsAddingMachInline(false);
  };

  // Handle Hospital Registration Form Submission
  const handleRegisterHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardHospName.trim() || !onboardAddress.trim() || !onboardPhone.trim()) {
      setOnboardingError('Please enter Hospital Name, Address, and Emergency Contact Phone.');
      return;
    }
    setIsOnboardingSubmitting(true);
    setOnboardingError('');
    try {
      await registerHospitalDetails({
        name: sanitizeText(onboardHospName),
        type: onboardHospType,
        address: sanitizeText(onboardAddress),
        city: sanitizeText(onboardCity),
        phone: sanitizeText(onboardPhone),
        beds: {
          icuTotal: Number(onboardIcuTotal) || 20,
          icuFree: Number(onboardIcuFree) || 5,
          emergencyTotal: Number(onboardEmergTotal) || 30,
          emergencyFree: Number(onboardEmergFree) || 10,
          ventilatorTotal: Number(onboardVentTotal) || 15,
          ventilatorFree: Number(onboardVentFree) || 4,
        },
        doctors: onboardDoctors,
        equipments: onboardEquipments,
      });
    } catch (err: unknown) {
      setOnboardingError(err instanceof Error ? err.message : 'Hospital registration failed.');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  // Main Tabs: 'patients' | 'beds' | 'doctors' | 'facilities'
  const [hospitalTab, setHospitalTab] = useState<'patients' | 'beds' | 'doctors' | 'facilities'>('patients');

  // Patient Sub-Tabs: 'incoming' | 'admitted' | 'discharged'
  const [patientSubTab, setPatientSubTab] = useState<'incoming' | 'admitted' | 'discharged'>('incoming');

  // Add Doctor Modal State (in Dashboard)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>('');
  const [docSpec, setDocSpec] = useState<string>('Interventional Cardiology & Electrophysiology');
  const [docQual, setDocQual] = useState<string>('MD, DM (Cardiology)');
  const [docExp, setDocExp] = useState<number>(10);
  const [docPhone, setDocPhone] = useState<string>('');
  const [docInitialStatus, setDocInitialStatus] = useState<Doctor['status']>('AVAILABLE_AND_FREE');

  // Add Machine Modal State (in Dashboard)
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
    setTimeout(() => setToastNotice(''), 3000);
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

  // 1. IF NOT SIGNED IN WITH GOOGLE: Clean Google Auth screen (Zero Gimmick ID/Password)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-10 space-y-6 animate-fadeIn px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/25">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital ER Command Center
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Sign in with your Google account to connect your trauma center to the National Emergency Network, manage live bed availability, and receive inbound 108 ambulances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle('hospital')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 transition shadow-md shadow-emerald-600/25 cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Sign in with Google (Hospital ER Command)</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. IF SIGNED IN VIA GOOGLE BUT HOSPITAL DETAILS NOT YET COMPLETED: Hospital Details Onboarding
  if (!loggedHospital) {
    return (
      <div className="max-w-3xl mx-auto my-6 space-y-6 animate-fadeIn px-4 pb-12">
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Header */}
          <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Hospital ER Onboarding
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Google Verified</span>
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Register Hospital ER Command Center
              </h2>
              <p className="text-xs text-slate-500">
                Configure your emergency department. Enter live bed inventory, specialist doctors, and life-support machinery.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterHospital} className="space-y-7 text-xs">
            {/* SECTION 1: Hospital Core Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>1. Hospital Identity & Location</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                    Hospital Full Name
                  </label>
                  <input
                    type="text"
                    value={onboardHospName}
                    onChange={(e) => setOnboardHospName(e.target.value)}
                    placeholder="e.g. Apollo Trauma & Emergency Center"
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                    Emergency Department Classification
                  </label>
                  <select
                    value={onboardHospType}
                    onChange={(e) => setOnboardHospType(e.target.value as Hospital['type'])}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-xs"
                  >
                    <option value="Trauma Center Level 1">Trauma Center Level 1</option>
                    <option value="Super Speciality">Super Speciality Hospital</option>
                    <option value="Multispeciality ER">Multispeciality Emergency Hospital</option>
                    <option value="Cardiac Center">Advanced Cardiac Center</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                    Emergency Reception Phone Hotline
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={onboardPhone}
                      onChange={(e) => setOnboardPhone(e.target.value)}
                      placeholder="+91-11-2692-5858"
                      className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                    Hospital Street Address
                  </label>
                  <input
                    type="text"
                    value={onboardAddress}
                    onChange={(e) => setOnboardAddress(e.target.value)}
                    placeholder="e.g. Sarita Vihar, Delhi Mathura Road"
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                    City
                  </label>
                  <input
                    type="text"
                    value={onboardCity}
                    onChange={(e) => setOnboardCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Bed Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2">
                <Bed className="w-4 h-4 text-emerald-600" />
                <span>2. Live Emergency Bed Capacity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ICU Beds */}
                <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-red-800 uppercase block">
                    ICU Beds
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Total</span>
                      <input
                        type="number"
                        min="1"
                        value={onboardIcuTotal}
                        onChange={(e) => setOnboardIcuTotal(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-red-300 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Free Now</span>
                      <input
                        type="number"
                        min="0"
                        value={onboardIcuFree}
                        onChange={(e) => setOnboardIcuFree(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-red-300 font-bold text-emerald-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency / Trauma Beds */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">
                    Emergency / Trauma Bays
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Total</span>
                      <input
                        type="number"
                        min="1"
                        value={onboardEmergTotal}
                        onChange={(e) => setOnboardEmergTotal(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-amber-300 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Free Now</span>
                      <input
                        type="number"
                        min="0"
                        value={onboardEmergFree}
                        onChange={(e) => setOnboardEmergFree(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-amber-300 font-bold text-emerald-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Ventilator Beds */}
                <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-teal-800 uppercase block">
                    Ventilators
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Total</span>
                      <input
                        type="number"
                        min="1"
                        value={onboardVentTotal}
                        onChange={(e) => setOnboardVentTotal(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-teal-300 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Free Now</span>
                      <input
                        type="number"
                        min="0"
                        value={onboardVentFree}
                        onChange={(e) => setOnboardVentFree(Number(e.target.value))}
                        className="w-full bg-white text-slate-900 p-2 rounded-lg border border-teal-300 font-bold text-emerald-700"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Doctors Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>3. On-Duty Specialist Doctors ({onboardDoctors.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingDocInline(!isAddingDocInline)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingDocInline ? 'Close' : 'Add Doctor'}</span>
                </button>
              </div>

              {/* Inline Add Doctor Box */}
              {isAddingDocInline && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase">
                    Add New Specialist Doctor to Roster
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Doctor Name (e.g. Dr. Rajiv Sharma)"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <input
                      type="text"
                      value={newDocSpec}
                      onChange={(e) => setNewDocSpec(e.target.value)}
                      placeholder="Specialization (e.g. Critical Care Trauma)"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <input
                      type="text"
                      value={newDocBay}
                      onChange={(e) => setNewDocBay(e.target.value)}
                      placeholder="Assigned Bay (e.g. Trauma Bay 1)"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <input
                      type="tel"
                      value={newDocPhone}
                      onChange={(e) => setNewDocPhone(e.target.value)}
                      placeholder="Doctor Phone (e.g. +91-98110-23451)"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={newDocExp}
                        onChange={(e) => setNewDocExp(Number(e.target.value))}
                        placeholder="Years Exp"
                        className="w-24 bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddDoctorInline}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-2 transition cursor-pointer"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctors Roster Preview */}
              <div className="space-y-2">
                {onboardDoctors.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{doc.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {doc.specialization} • {doc.currentBay} • {doc.experienceYears} yrs exp
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOnboardDoctors(onboardDoctors.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                      title="Remove doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: Facilities & Machines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>4. Facilities & Life-Support Machines ({onboardEquipments.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingMachInline(!isAddingMachInline)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingMachInline ? 'Close' : 'Add Machine'}</span>
                </button>
              </div>

              {/* Inline Add Machine Box */}
              {isAddingMachInline && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase">
                    Add Critical Facility / Machine
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newMachName}
                      onChange={(e) => setNewMachName(e.target.value)}
                      placeholder="Machine Name (e.g. GE Revolution CT Scanner)"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <select
                      value={newMachCategory}
                      onChange={(e) => setNewMachCategory(e.target.value as Equipment['category'])}
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    >
                      <option value="LIFE_SUPPORT">Life Support</option>
                      <option value="IMAGING">Imaging / Radiology</option>
                      <option value="SURGICAL">Surgical Facility</option>
                      <option value="DIAGNOSTIC">Diagnostic</option>
                    </select>
                    <input
                      type="text"
                      value={newMachBay}
                      onChange={(e) => setNewMachBay(e.target.value)}
                      placeholder="Bay / Room Location"
                      className="bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={newMachQty}
                        onChange={(e) => setNewMachQty(Number(e.target.value))}
                        placeholder="Quantity"
                        className="w-24 bg-white text-slate-900 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddMachineInline}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-2 transition cursor-pointer"
                      >
                        Add Machine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment Preview */}
              <div className="space-y-2">
                {onboardEquipments.map((eq, idx) => (
                  <div
                    key={eq.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{eq.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Category: <strong className="font-mono text-emerald-800">{eq.category}</strong> • Location: {eq.location} • Qty: {eq.quantityAvailable}/{eq.totalQuantity}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOnboardEquipments(onboardEquipments.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                      title="Remove machine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {onboardingError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                {onboardingError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isOnboardingSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-3.5 rounded-2xl text-white font-extrabold text-xs tracking-tight transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25"
              >
                {isOnboardingSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
                <span>{isOnboardingSubmitting ? 'Registering Hospital in Cloud Backend...' : 'Save Hospital to Backend & Enter ER Command'}</span>
              </button>
            </div>

            <div className="text-center text-[10px] font-mono text-slate-400">
              Authenticated as {currentUser.email} • Unique Hospital ID will be assigned and saved in Cloud Firestore
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. IF LOGGED IN: Hospital Command Center Dashboard
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
                  Segregated by transit & admission lifecycle. Click any patient to view comprehensive clinical health records and triage details.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs flex items-center space-x-1.5"
                  title="Scan Patient Voice-QR code from ambulance"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan Patient QR</span>
                </button>

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
          </div>

            {/* Sub-Tab 1: INCOMING PATIENTS */}
            {patientSubTab === 'incoming' && (
              <div className="space-y-4">
                {/* Inbound Ambulances Directory List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 pt-1">
                    <span className="uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      <span>Incoming Ambulances Fleet ({incomingPatients.length})</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Emergency Direct Intake Queue</span>
                  </div>

                  {incomingPatients.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      No incoming emergency ambulances currently en route.
                    </div>
                  ) : (
                    incomingPatients.map((patient) => (
                      <div
                        key={patient.bookingCode}
                        className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
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
                            <span>Allocated Bay: <strong className="text-slate-800">{patient.reservedBay}</strong></span>
                            <span>•</span>
                            <span>Specialist: <strong className="text-slate-800">{patient.assignedDoctor.name}</strong></span>
                            <span>•</span>
                            <span>Ambulance: <strong className="text-slate-800 font-mono">{patient.ambulanceDetails.vehicleNumber}</strong></span>
                            <span>•</span>
                            <span>Origin: <strong className="text-slate-700">{patient.patientPickupCoords.address}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              admitPatient(patient.bookingCode);
                              showToast(`Patient ${patient.patientUniqueId} admitted to ${patient.reservedBay}!`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            Admit to ER Bay
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                      className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                          <span>Attending Specialist: <strong className="text-slate-800">{patient.assignedDoctor.name}</strong></span>
                          <span>•</span>
                          <span>ER Bay: <strong className="text-slate-800 font-mono">{patient.reservedBay}</strong></span>
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
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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

      {/* Voice-to-QR Reception Scanner Modal */}
      {loggedHospital && (
        <ReceptionQrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          hospital={loggedHospital}
          onAdmitPatient={(reg, bay, doc) => {
            admitVoiceQrPatient(reg, bay, doc, loggedHospital.id);
            setPatientSubTab('admitted');
          }}
        />
      )}
    </div>
  );
};
