/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Hospital, EmergencyBooking, AITriageAnalysis, ABHAMedicalRecord, PatientVitals, Doctor, Equipment } from '../types';
import { INITIAL_HOSPITALS, SAMPLE_ABHA_PROFILES, DEFAULT_ACTIVE_BOOKING } from '../data/mockData';
import { analyzeEmergencyBrief, rankHospitalsForEmergency } from '../services/aiTriageService';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

export type AppView = 'patient' | 'ambulance' | 'hospital';

interface EmergencyContextType {
  hospitals: Hospital[];
  currentTriage: AITriageAnalysis | null;
  activeBooking: EmergencyBooking;
  allBookings: EmergencyBooking[];
  currentView: AppView;
  loggedHospital: Hospital | null;
  selectedAbhaProfile: ABHAMedicalRecord | null;
  searchTriageMode: 'standard' | 'sarvam' | 'neo4j';
  setSearchTriageMode: (mode: 'standard' | 'sarvam' | 'neo4j') => void;
  navigateToTrack: (track: 'neo4j' | 'sarvam' | 'arduino' | 'general') => void;
  setCurrentView: (view: AppView) => void;
  setSelectedAbhaProfile: (profile: ABHAMedicalRecord | null) => void;
  fetchPatientByAbha: (abhaId: string) => ABHAMedicalRecord | undefined;
  loginHospital: (hospitalCode: string, password: string) => boolean;
  logoutHospital: () => void;
  searchEmergency: (brief: string) => AITriageAnalysis;
  bookHospitalBed: (hospitalId: string, patientName?: string, patientPhone?: string) => EmergencyBooking;
  getBookingByCode: (code: string) => EmergencyBooking | undefined;
  updateAmbulanceStatus: (bookingCode: string, status: EmergencyBooking['status'], etaMins?: number, speed?: number) => void;
  submitInTransitPaperwork: (bookingCode: string, abha: ABHAMedicalRecord, vitals: PatientVitals, consent: boolean) => void;
  updatePatientVitals: (bookingCode: string, vitalsUpdate: Partial<PatientVitals>) => void;
  updateHospitalBeds: (hospitalId: string, bedsUpdate: Partial<Hospital['beds']>) => void;
  updateDoctorStatus: (hospitalId: string, doctorId: string, status: Doctor['status'], currentBay?: string) => void;
  addDoctor: (hospitalId: string, doctor: Omit<Doctor, 'id'>) => void;
  removeDoctor: (hospitalId: string, doctorId: string) => void;
  updateEquipmentStatus: (hospitalId: string, equipmentId: string, status: Equipment['status'], qtyAvailable?: number) => void;
  addEquipment: (hospitalId: string, equipment: Omit<Equipment, 'id'>) => void;
  removeEquipment: (hospitalId: string, equipmentId: string) => void;
  updateHospitalDetails: (hospitalId: string, updates: Partial<Hospital>) => void;
  assignTraumaBay: (bookingCode: string, bayName: string) => void;
  admitPatient: (bookingCode: string) => void;
  resetEmergencyState: () => void;
}

const STORAGE_KEY_HOSPITALS = 'lifecare_hospitals_data_v1';
const STORAGE_KEY_BOOKINGS = 'lifecare_bookings_v1';
const STORAGE_KEY_ACTIVE = 'lifecare_active_booking_v1';
const STORAGE_KEY_LOGGED_HOSP_ID = 'lifecare_logged_hosp_id_v1';

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load hospitals from localStorage or initial mock data
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOSPITALS);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  });

  const [currentTriage, setCurrentTriage] = useState<AITriageAnalysis | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('patient');
  const [selectedAbhaProfile, setSelectedAbhaProfile] = useState<ABHAMedicalRecord | null>(SAMPLE_ABHA_PROFILES[0]);
  const [searchTriageMode, setSearchTriageMode] = useState<'standard' | 'sarvam' | 'neo4j'>('standard');

  const navigateToTrack = (track: 'neo4j' | 'sarvam' | 'arduino' | 'general') => {
    if (track === 'neo4j') {
      setCurrentView('patient');
      setSearchTriageMode('neo4j');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (track === 'sarvam') {
      setCurrentView('patient');
      setSearchTriageMode('sarvam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (track === 'arduino') {
      setCurrentView('ambulance');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (track === 'general') {
      setCurrentView('hospital');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Logged in Hospital ID - persistent and reactive
  const [loggedHospitalId, setLoggedHospitalId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGGED_HOSP_ID);
      return saved ? saved : 'hosp-aiims-delhi';
    } catch {
      return 'hosp-aiims-delhi';
    }
  });

  // Derived dynamically from current hospitals array so any edit is 100% reactive
  const loggedHospital = hospitals.find((h) => h.id === loggedHospitalId) || hospitals[0] || null;

  // Active booking from localStorage or default
  const [activeBooking, setActiveBooking] = useState<EmergencyBooking>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      return saved ? JSON.parse(saved) : DEFAULT_ACTIVE_BOOKING;
    } catch {
      return DEFAULT_ACTIVE_BOOKING;
    }
  });

  const [allBookings, setAllBookings] = useState<EmergencyBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      return saved ? JSON.parse(saved) : [DEFAULT_ACTIVE_BOOKING];
    } catch {
      return [DEFAULT_ACTIVE_BOOKING];
    }
  });

  // Cross-tab broadcast synchronization
  useEffect(() => {
    const channel = new BroadcastChannel('lifecare_sync_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE') {
        if (event.data.activeBooking !== undefined) {
          setActiveBooking(event.data.activeBooking);
        }
        if (event.data.allBookings !== undefined) {
          setAllBookings(event.data.allBookings);
        }
        if (event.data.hospitals !== undefined) {
          setHospitals(event.data.hospitals);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastState = (newActive: EmergencyBooking, newBookings: EmergencyBooking[], newHosp?: Hospital[]) => {
    try {
      const channel = new BroadcastChannel('lifecare_sync_channel');
      channel.postMessage({
        type: 'SYNC_STATE',
        activeBooking: newActive,
        allBookings: newBookings,
        hospitals: newHosp || hospitals,
      });
      channel.close();
    } catch {
      // fallback
    }
  };

  const saveHospitals = (list: Hospital[]) => {
    setHospitals(list);
    try {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const saveActive = (booking: EmergencyBooking) => {
    setActiveBooking(booking);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(booking));
    } catch {
      // ignore
    }
  };

  const saveAll = (list: EmergencyBooking[]) => {
    setAllBookings(list);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  // Hospital Authentication
  const loginHospital = (hospitalCode: string, password: string): boolean => {
    const codeClean = hospitalCode.trim().toUpperCase();
    const passClean = password.trim();

    const matched = hospitals.find(
      (h) => h.hospitalCode.toUpperCase() === codeClean && h.password === passClean
    );

    if (matched) {
      setLoggedHospitalId(matched.id);
      try {
        localStorage.setItem(STORAGE_KEY_LOGGED_HOSP_ID, matched.id);
      } catch {
        // ignore
      }
      setCurrentView('hospital');
      soundEffects.playSuccessChime();
      return true;
    }
    return false;
  };

  const logoutHospital = () => {
    setLoggedHospitalId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_LOGGED_HOSP_ID);
    } catch {
      // ignore
    }
    setCurrentView('patient');
  };

  // Look up patient records by ABHA ID or Patient Name
  const fetchPatientByAbha = (abhaIdOrName: string): ABHAMedicalRecord | undefined => {
    const raw = abhaIdOrName.trim().toLowerCase();
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    const found = SAMPLE_ABHA_PROFILES.find((p) => {
      const pDigits = p.abhaId.replace(/[^0-9]/g, '');
      const pName = p.fullName.toLowerCase();
      return (
        p.abhaId.toLowerCase().includes(raw) ||
        raw.includes(p.abhaId.toLowerCase()) ||
        (digitsOnly.length >= 4 && pDigits.includes(digitsOnly)) ||
        pName.includes(raw) ||
        raw.includes(pName)
      );
    });
    if (found) {
      setSelectedAbhaProfile(found);
      soundEffects.playHeartbeat();
      return found;
    }
    return undefined;
  };

  // Perform AI analysis and rank hospitals
  const searchEmergency = (brief: string): AITriageAnalysis => {
    const analysis = analyzeEmergencyBrief(brief);
    setCurrentTriage(analysis);

    const ranked = rankHospitalsForEmergency(hospitals, analysis);
    saveHospitals(ranked);
    return analysis;
  };

  // Look up booking by Ambulance Booking Code or Patient ID
  const getBookingByCode = (code: string): EmergencyBooking | undefined => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return undefined;

    return allBookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === cleanCode ||
        b.patientUniqueId.toUpperCase() === cleanCode ||
        b.bookingCode.toUpperCase().includes(cleanCode) ||
        cleanCode.includes(b.bookingCode.toUpperCase())
    );
  };

  // Book emergency bed & dispatch ambulance with UNIQUE IDs
  const bookHospitalBed = (
    hospitalId: string,
    patientName?: string,
    patientPhone?: string
  ): EmergencyBooking => {
    const hosp = hospitals.find((h) => h.id === hospitalId) || hospitals[0];
    const triage = currentTriage || analyzeEmergencyBrief('Acute Chest Pain Emergency');

    const freeDoctor =
      hosp.doctors.find((d) => d.status === 'AVAILABLE_AND_FREE') || hosp.doctors[0];

    const readyMachines = hosp.equipments
      .filter((e) => e.status === 'READY_AND_STERILIZED')
      .map((e) => e.name);

    // UNIQUE IDs GENERATED FOR EVERY PATIENT:
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `AMB-${randomNum}`;
    const patientUniqueId = `PAT-2026-${randomNum}`;

    const now = new Date();
    const expiry = new Date(now.getTime() + 20 * 60000);

    const nameToUse = patientName || selectedAbhaProfile?.fullName || 'Rahul Sharma';
    const phoneToUse = patientPhone || selectedAbhaProfile?.phoneNumber || '+91-98104-55678';

    const newBooking: EmergencyBooking = {
      patientUniqueId,
      bookingCode,
      patientName: nameToUse,
      patientPhone: phoneToUse,
      emergencyBrief: triage.summary,
      aiAnalysis: triage,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalAddress: hosp.address,
      hospitalPhone: hosp.phone,
      hospitalCoords: {
        lat: hosp.latitude,
        lng: hosp.longitude,
      },
      patientPickupCoords: {
        lat: 28.5500,
        lng: 77.2200,
        address: 'B-44, Greater Kailash Part 1, New Delhi',
      },
      assignedDoctor: freeDoctor,
      reservedBay: 'Trauma Bay #03 (Cath Lab 2)',
      reservedBedType: hosp.beds.icuFree > 0 ? 'ICU' : 'Emergency Trauma Bay',
      reservedEquipments: readyMachines.slice(0, 3),
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: 'AMBULANCE_EN_ROUTE_PICKUP',
      ambulanceDetails: {
        vehicleNumber: 'DL-01-AMB-' + Math.floor(100 + Math.random() * 900),
        driverName: 'Rajesh Kumar Yadav',
        driverPhone: '+91-98188-72619',
        type: 'Advanced Cardiac Life Support (ACLS)',
        currentEtaMins: 6,
        currentSpeedKmh: 52,
        distanceRemainingKm: 2.8,
      },
      inTransitPaperwork: {
        isSubmitted: Boolean(selectedAbhaProfile),
        submittedAt: selectedAbhaProfile ? now.toISOString() : undefined,
        abhaDetails: selectedAbhaProfile || undefined,
        initialVitals: {
          heartRate: 112,
          bloodPressureSys: 154,
          bloodPressureDia: 94,
          spO2: 92,
          respiratoryRate: 24,
          temperatureF: 98.6,
          gcsScore: 15,
          recordedAt: now.toISOString(),
        },
        digitalConsentSigned: true,
        preAdmitRegistrationNumber: 'ABDM-ER-' + Math.floor(100000 + Math.random() * 900000),
      },
    };

    const updatedHospitals = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          beds: {
            ...h.beds,
            emergencyFree: Math.max(0, h.beds.emergencyFree - 1),
            icuFree: Math.max(0, h.beds.icuFree - 1),
          },
        };
      }
      return h;
    });

    saveHospitals(updatedHospitals);
    saveActive(newBooking);
    const updatedBookings = [newBooking, ...allBookings.filter(b => b.bookingCode !== newBooking.bookingCode)];
    saveAll(updatedBookings);
    broadcastState(newBooking, updatedBookings, updatedHospitals);

    soundEffects.playSuccessChime();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#00e587', '#ff2d46'],
    });

    return newBooking;
  };

  const updateAmbulanceStatus = (
    bookingCode: string,
    status: EmergencyBooking['status'],
    etaMins?: number,
    speed?: number
  ) => {
    let updatedActive = activeBooking;
    if (activeBooking.bookingCode === bookingCode) {
      updatedActive = {
        ...activeBooking,
        status,
        ambulanceDetails: {
          ...activeBooking.ambulanceDetails,
          currentEtaMins: etaMins !== undefined ? etaMins : activeBooking.ambulanceDetails.currentEtaMins,
          currentSpeedKmh: speed !== undefined ? speed : activeBooking.ambulanceDetails.currentSpeedKmh,
        },
      };
      saveActive(updatedActive);
    }

    const updatedList = allBookings.map((b) => {
      if (b.bookingCode === bookingCode) {
        return {
          ...b,
          status,
          ambulanceDetails: {
            ...b.ambulanceDetails,
            currentEtaMins: etaMins !== undefined ? etaMins : b.ambulanceDetails.currentEtaMins,
            currentSpeedKmh: speed !== undefined ? speed : b.ambulanceDetails.currentSpeedKmh,
          },
        };
      }
      return b;
    });

    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
  };

  const submitInTransitPaperwork = (
    bookingCode: string,
    abha: ABHAMedicalRecord,
    vitals: PatientVitals,
    consent: boolean
  ) => {
    const regNo = 'ABDM-ER-' + Math.floor(100000 + Math.random() * 900000);

    let updatedActive = activeBooking;
    if (activeBooking.bookingCode === bookingCode) {
      updatedActive = {
        ...activeBooking,
        patientName: abha.fullName,
        inTransitPaperwork: {
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          abhaDetails: abha,
          initialVitals: vitals,
          digitalConsentSigned: consent,
          preAdmitRegistrationNumber: regNo,
        },
      };
      saveActive(updatedActive);
    }

    const updatedList = allBookings.map((b) => {
      if (b.bookingCode === bookingCode) {
        return {
          ...b,
          patientName: abha.fullName,
          inTransitPaperwork: {
            isSubmitted: true,
            submittedAt: new Date().toISOString(),
            abhaDetails: abha,
            initialVitals: vitals,
            digitalConsentSigned: consent,
            preAdmitRegistrationNumber: regNo,
          },
        };
      }
      return b;
    });

    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
    soundEffects.playSuccessChime();
  };

  // Send live vitals stream from ambulance to hospital ER (robust & bidirectional)
  const updatePatientVitals = (bookingCode: string, vitalsUpdate: Partial<PatientVitals>) => {
    const codeClean = bookingCode.trim().toUpperCase();
    const defaultVitals: PatientVitals = {
      heartRate: 112,
      bloodPressureSys: 154,
      bloodPressureDia: 94,
      spO2: 92,
      respiratoryRate: 24,
      temperatureF: 98.6,
      gcsScore: 15,
      recordedAt: new Date().toISOString(),
    };

    let updatedActive = activeBooking;
    if (activeBooking.bookingCode.toUpperCase() === codeClean) {
      const currentV = activeBooking.inTransitPaperwork?.initialVitals || defaultVitals;
      updatedActive = {
        ...activeBooking,
        inTransitPaperwork: {
          ...activeBooking.inTransitPaperwork,
          initialVitals: {
            ...currentV,
            ...vitalsUpdate,
            recordedAt: new Date().toISOString(),
          },
        },
      };
      saveActive(updatedActive);
    }

    const updatedList = allBookings.map((b) => {
      if (b.bookingCode.toUpperCase() === codeClean) {
        const currentV = b.inTransitPaperwork?.initialVitals || defaultVitals;
        return {
          ...b,
          inTransitPaperwork: {
            ...b.inTransitPaperwork,
            initialVitals: {
              ...currentV,
              ...vitalsUpdate,
              recordedAt: new Date().toISOString(),
            },
          },
        };
      }
      return b;
    });

    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
    soundEffects.playHeartbeat();
  };

  // Hospital staff resource management (100% reactive & persistent)
  const updateHospitalBeds = (hospitalId: string, bedsUpdate: Partial<Hospital['beds']>) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          beds: {
            ...h.beds,
            ...bedsUpdate,
          },
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const updateDoctorStatus = (hospitalId: string, doctorId: string, status: Doctor['status'], currentBay?: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.map((d) => (d.id === doctorId ? { ...d, status, currentBay: currentBay || d.currentBay } : d)),
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const addDoctor = (hospitalId: string, doctor: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: [newDoc, ...h.doctors],
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
    soundEffects.playSuccessChime();
  };

  const removeDoctor = (hospitalId: string, doctorId: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.filter((d) => d.id !== doctorId),
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const updateEquipmentStatus = (hospitalId: string, equipmentId: string, status: Equipment['status'], qtyAvailable?: number) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          equipments: h.equipments.map((eq) =>
            eq.id === equipmentId
              ? {
                ...eq,
                status,
                quantityAvailable: qtyAvailable !== undefined ? qtyAvailable : eq.quantityAvailable,
              }
              : eq
          ),
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const addEquipment = (hospitalId: string, equipment: Omit<Equipment, 'id'>) => {
    const newEq: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          equipments: [newEq, ...h.equipments],
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
    soundEffects.playSuccessChime();
  };

  const removeEquipment = (hospitalId: string, equipmentId: string) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          equipments: h.equipments.filter((e) => e.id !== equipmentId),
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const updateHospitalDetails = (hospitalId: string, updates: Partial<Hospital>) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          ...updates,
        };
      }
      return h;
    });
    saveHospitals(updated);
    broadcastState(activeBooking, allBookings, updated);
  };

  const assignTraumaBay = (bookingCode: string, bayName: string) => {
    let updatedActive = activeBooking;
    if (activeBooking.bookingCode === bookingCode) {
      updatedActive = { ...activeBooking, reservedBay: bayName };
      saveActive(updatedActive);
    }
    const updatedList = allBookings.map((b) => (b.bookingCode === bookingCode ? { ...b, reservedBay: bayName } : b));
    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
  };

  const admitPatient = (bookingCode: string) => {
    let updatedActive = activeBooking;
    if (activeBooking.bookingCode === bookingCode) {
      updatedActive = {
        ...activeBooking,
        status: 'ARRIVED_ER',
      };
      saveActive(updatedActive);
    }
    const updatedList = allBookings.map((b) => (b.bookingCode === bookingCode ? { ...b, status: 'ARRIVED_ER' as const } : b));
    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
    soundEffects.playSuccessChime();
  };

  const resetEmergencyState = () => {
    try {
      localStorage.clear();
    } catch { }

    const freshHospitals: Hospital[] = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    const freshActiveBooking: EmergencyBooking = JSON.parse(JSON.stringify(DEFAULT_ACTIVE_BOOKING));

    setHospitals(freshHospitals);
    setCurrentTriage(null);
    setCurrentView('patient');
    setSelectedAbhaProfile(SAMPLE_ABHA_PROFILES[0]);
    setSearchTriageMode('standard');
    setActiveBooking(freshActiveBooking);
    setAllBookings([freshActiveBooking]);
    setLoggedHospitalId('hosp-aiims-delhi');

    broadcastState(freshActiveBooking, [freshActiveBooking], freshHospitals);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soundEffects.playSuccessChime();
  };

  return (
    <EmergencyContext.Provider
      value={{
        hospitals,
        currentTriage,
        activeBooking,
        allBookings,
        currentView,
        loggedHospital,
        selectedAbhaProfile,
        searchTriageMode,
        setSearchTriageMode,
        navigateToTrack,
        setCurrentView,
        setSelectedAbhaProfile,
        fetchPatientByAbha,
        loginHospital,
        logoutHospital,
        searchEmergency,
        bookHospitalBed,
        getBookingByCode,
        updateAmbulanceStatus,
        submitInTransitPaperwork,
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
        admitPatient,
        resetEmergencyState,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
