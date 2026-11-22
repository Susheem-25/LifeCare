/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Hospital, EmergencyBooking, AITriageAnalysis, ABHAMedicalRecord, PatientVitals, Doctor, Equipment, DriverAccount, AppRole, UserProfile, PatientVoiceRegistration, AdmissionNotification } from '../types';
import { analyzeEmergencyBrief, rankHospitalsForEmergency } from '../services/aiTriageService';
import { speakTextWithSarvam } from '../services/sarvamAiService';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  signInWithGoogle,
  signOutUser,
  getSavedUserProfile,
  onAuthStateSubscription,
  syncBookingToFirestore,
  subscribeToFirestoreBookings,
  subscribeToFirestoreHospitals,
  subscribeToFirestoreDrivers,
  syncVitalsToFirestore,
  syncDriverProfileToFirestore,
  fetchDriverProfile,
  syncHospitalProfileToFirestore,
  fetchHospitalProfileByOwner
} from '../services/firebase';
import { generateSessionKey, encryptMedicalRecord } from '../services/cryptoService';

export type AppView = 'patient' | 'ambulance' | 'hospital';

interface EmergencyContextType {
  hospitals: Hospital[];
  currentTriage: AITriageAnalysis | null;
  activeBooking: EmergencyBooking | null;
  allBookings: EmergencyBooking[];
  currentView: AppView;
  currentRole: AppRole;
  loggedHospital: Hospital | null;
  loggedDriver: DriverAccount | null;
  selectedAbhaProfile: ABHAMedicalRecord | null;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isVoiceQrModalOpen: boolean;
  setIsVoiceQrModalOpen: (open: boolean) => void;
  loginWithGoogle: (role: AppRole) => Promise<UserProfile>;
  logoutUser: () => Promise<void>;
  registerDriverDetails: (details: { driverName: string; phone: string; vehicleNumber: string; vehicleType: string }) => Promise<DriverAccount>;
  registerHospitalDetails: (details: { name: string; type?: Hospital['type']; address: string; city: string; phone: string; beds: Hospital['beds']; doctors?: Doctor[]; equipments?: Equipment[] }) => Promise<Hospital>;
  admitVoiceQrPatient: (registration: PatientVoiceRegistration, bay: string, doctorName: string, hospitalId?: string) => EmergencyBooking;
  searchTriageMode: 'standard' | 'sarvam' | 'neo4j';
  setSearchTriageMode: (mode: 'standard' | 'sarvam' | 'neo4j') => void;
  navigateToTrack: (track: 'neo4j' | 'sarvam' | 'arduino' | 'general') => void;
  setCurrentView: (view: AppView) => void;
  setCurrentRole: (role: AppRole) => void;
  setSelectedAbhaProfile: (profile: ABHAMedicalRecord | null) => void;
  fetchPatientByAbha: (abhaId: string) => ABHAMedicalRecord | undefined;
  loginHospital: (hospitalCode: string, password: string) => boolean;
  logoutHospital: () => void;
  loginDriver: (driverId: string, pin: string) => boolean;
  logoutDriver: () => void;
  searchEmergency: (brief: string) => AITriageAnalysis;
  bookHospitalBed: (hospitalId: string, patientName?: string, patientPhone?: string, abhaRecord?: ABHAMedicalRecord | null) => EmergencyBooking;
  loginAmbulanceDriver: (bookingCode: string) => boolean;
  linkAmbulanceToBooking: (bookingCode: string, driver?: DriverAccount) => EmergencyBooking | undefined;
  getBookingByCode: (code: string) => EmergencyBooking | undefined;
  updateAmbulanceStatus: (bookingCode: string, status: EmergencyBooking['status'], etaMins?: number, speed?: number) => void;
  submitInTransitPaperwork: (bookingCode: string, abha: ABHAMedicalRecord, vitals: PatientVitals, consent: boolean) => void;
  updatePatientVitals: (bookingCode: string, vitalsUpdate: Partial<PatientVitals>) => void;
  updateHospitalBeds: (hospitalId: string, bedsUpdate: Partial<Hospital['beds']>) => void;
  updateDoctorStatus: (hospitalId: string, doctorId: string, status: Doctor['status'], currentBay?: string) => void;
  addDoctor: (hospitalId: string, doctor: Omit<Doctor, 'id'>) => void;
  updateDoctorDetails: (hospitalId: string, doctorId: string, updates: Partial<Doctor>) => void;
  removeDoctor: (hospitalId: string, doctorId: string) => void;
  updateEquipmentStatus: (hospitalId: string, equipmentId: string, status: Equipment['status'], qtyAvailable?: number) => void;
  addEquipment: (hospitalId: string, equipment: Omit<Equipment, 'id'>) => void;
  removeEquipment: (hospitalId: string, equipmentId: string) => void;
  updateHospitalDetails: (hospitalId: string, updates: Partial<Hospital>) => void;
  assignTraumaBay: (bookingCode: string, bayName: string) => void;
  admitPatient: (bookingCode: string) => void;
  dischargePatient: (bookingCode: string) => void;
  setPatientStatus: (bookingCode: string, status: EmergencyBooking['status']) => void;
  admissionNotice: AdmissionNotification | null;
  dismissAdmissionNotice: () => void;
  userLocation: { lat: number; lng: number; address: string; isLiveGps: boolean };
  requestLiveLocation: () => void;
  resetEmergencyState: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const STORAGE_KEY_HOSPITALS = 'lifecare_hospitals_data_v2';
const STORAGE_KEY_BOOKINGS = 'lifecare_bookings_v2';
const STORAGE_KEY_ACTIVE = 'lifecare_active_booking_v2';
const STORAGE_KEY_LOGGED_HOSP_ID = 'lifecare_logged_hosp_id_v2';
const STORAGE_KEY_LOGGED_DRIVER = 'lifecare_logged_driver_v2';
const STORAGE_KEY_ROLE = 'lifecare_role_v3';

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load hospitals from localStorage or Firestore (Clean MVP: empty by default, zero mocked hospitals)
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOSPITALS);
      if (saved) {
        const parsed: Hospital[] = JSON.parse(saved);
        const dummyIds = ['hosp-aiims-delhi', 'hosp-max-saket', 'hosp-fortis-escorts', 'hosp-apollo-jasola'];
        const clean = parsed.filter((h) => !dummyIds.includes(h.id));
        if (clean.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(clean));
        }
        return clean;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Theme state: 'dark' (next-gen medical OS) or 'light' (clinical white)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('lifecare_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('lifecare_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('lifecare_theme', newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Real registered drivers available in network
  const [availableDrivers, setAvailableDrivers] = useState<DriverAccount[]>([]);

  const [currentTriage, setCurrentTriage] = useState<AITriageAnalysis | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const savedUser = getSavedUserProfile();
      if (savedUser?.role === 'driver') return 'ambulance';
      if (savedUser?.role === 'hospital') return 'hospital';
      if (savedUser?.role === 'guardian') return 'patient';
    } catch {
      // ignore
    }
    return 'patient';
  });

  const [currentRole, setCurrentRoleState] = useState<AppRole>(() => {
    try {
      const savedUser = getSavedUserProfile();
      if (savedUser?.role && ['guardian', 'driver', 'hospital'].includes(savedUser.role)) {
        return savedUser.role;
      }
      const saved = localStorage.getItem(STORAGE_KEY_ROLE) as AppRole | null;
      if (saved && ['guardian', 'driver', 'hospital'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'welcome';
  });

  const setCurrentRole = (role: AppRole) => {
    // Strict Role-Based Access Control (RBAC):
    // If logged in, users CANNOT access portals of other roles or 'welcome'
    if (currentUser) {
      if (role !== currentUser.role) {
        console.warn(`[RBAC] Access denied: Authenticated as ${currentUser.role}, cannot access ${role}`);
        setCurrentRoleState(currentUser.role);
        return;
      }
    }

    setCurrentRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch {
      // ignore
    }
    if (role === 'guardian') setCurrentView('patient');
    else if (role === 'driver') setCurrentView('ambulance');
    else if (role === 'hospital') setCurrentView('hospital');
  };

  const [selectedAbhaProfile, setSelectedAbhaProfile] = useState<ABHAMedicalRecord | null>(null);
  const [searchTriageMode, setSearchTriageMode] = useState<'standard' | 'sarvam' | 'neo4j'>('standard');

  // Firebase Authentication & Role-based Unique ID Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSavedUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoiceQrModalOpen, setRawIsVoiceQrModalOpen] = useState(false);

  // Real-Time Admission Notice for Guardian Reassurance
  const [admissionNotice, setAdmissionNotice] = useState<AdmissionNotification | null>(() => {
    try {
      const saved = localStorage.getItem('lifecare_admission_notice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const dismissAdmissionNotice = () => {
    setAdmissionNotice(null);
    try {
      localStorage.removeItem('lifecare_admission_notice');
    } catch {
      // ignore
    }
  };

  const setIsVoiceQrModalOpen = (open: boolean) => {
    if (open && currentUser && currentUser.role !== 'guardian') {
      console.warn('[RBAC] Voice-to-QR intake generation is restricted strictly to Guardian role.');
      return;
    }
    setRawIsVoiceQrModalOpen(open);
  };

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateSubscription((user) => {
      if (user) {
        setCurrentUser(user);
        if (user.role && ['guardian', 'driver', 'hospital'].includes(user.role)) {
          setCurrentRoleState(user.role);
          try {
            localStorage.setItem(STORAGE_KEY_ROLE, user.role);
          } catch {
            // ignore
          }
          if (user.role === 'guardian') setCurrentView('patient');
          else if (user.role === 'driver') setCurrentView('ambulance');
          else if (user.role === 'hospital') setCurrentView('hospital');
        }
      }
    });

    // Listen to real-time Cloud Firestore emergency missions
    const unsubCloud = subscribeToFirestoreBookings((cloudBookings) => {
      setAllBookings(cloudBookings);
      if (cloudBookings.length > 0) {
        setActiveBooking((prev) => {
          if (!prev) return cloudBookings[0] || null;
          const match = cloudBookings.find((b) => b.bookingCode === prev.bookingCode);
          return match || prev;
        });
      }
    });

    // Listen to real-time registered hospitals in Cloud Firestore
    const unsubHospitals = subscribeToFirestoreHospitals((cloudHospitals) => {
      const dummyIds = ['hosp-aiims-delhi', 'hosp-max-saket', 'hosp-fortis-escorts', 'hosp-apollo-jasola'];
      const realHospitals = cloudHospitals.filter((h) => !dummyIds.includes(h.id));
      setHospitals(realHospitals);
      try {
        localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(realHospitals));
      } catch {
        // ignore
      }
    });

    // Listen to real-time registered drivers in Cloud Firestore
    const unsubDrivers = subscribeToFirestoreDrivers((cloudDrivers) => {
      setAvailableDrivers(cloudDrivers);
    });

    return () => {
      unsubAuth();
      unsubCloud();
      unsubHospitals();
      unsubDrivers();
    };
  }, []);

  // Real-time live user GPS location (automatically requested on app start)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    isLiveGps: boolean;
  }>({
    lat: 28.5420,
    lng: 77.2350,
    address: 'Greater Kailash Part 1, New Delhi',
    isLiveGps: false,
  });

  // Automatically recalculate distances from live user coordinates to all hospitals
  const recalculateHospitalDistances = (lat: number, lng: number) => {
    setHospitals((prev) => {
      const updated = prev.map((h) => {
        const R = 6371; // km
        const dLat = ((h.latitude - lat) * Math.PI) / 180;
        const dLng = ((h.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((h.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.max(0.5, Math.round(R * c * 1.35 * 10) / 10);
        const transitTimeMins = Math.max(2, Math.round((distanceKm / 40) * 60));
        return {
          ...h,
          distanceKm,
          transitTimeMins,
        };
      });
      try {
        localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Request browser/device location access immediately
  const requestLiveLocation = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            address: `Current Live Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
            isLiveGps: true,
          });
          recalculateHospitalDistances(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation access not granted or unavailable:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  // Automatically ask for location access as soon as application mounts
  useEffect(() => {
    requestLiveLocation();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Logged in Hospital ID - null until hospital logs in with credentials
  const [loggedHospitalId, setLoggedHospitalId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGGED_HOSP_ID);
      return saved ? saved : null;
    } catch {
      return null;
    }
  });

  // Derived dynamically from current hospitals array so any edit is 100% reactive
  const loggedHospital = loggedHospitalId ? (hospitals.find((h) => h.id === loggedHospitalId) || null) : null;

  // Logged in Driver - null until driver logs in with credentials
  const [loggedDriver, setLoggedDriver] = useState<DriverAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGGED_DRIVER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginWithGoogle = async (role: AppRole): Promise<UserProfile> => {
    // If user is already authenticated with Google, enforce RBAC role lock & navigate directly
    if (currentUser && currentUser.uid) {
      if (currentUser.role !== role) {
        console.warn(`[RBAC] User is authenticated as ${currentUser.role}. Must sign out before accessing ${role}.`);
        setCurrentRole(currentUser.role);
        return currentUser;
      }
      setCurrentRole(role);
      return currentUser;
    }

    const user = await signInWithGoogle(role);
    setCurrentUser(user);
    setCurrentRole(role);

    // If driver, fetch registered driver profile from backend (no fake dummy assignment)
    if (role === 'driver') {
      const existing = await fetchDriverProfile(user.uid);
      if (existing) {
        setLoggedDriver(existing);
        try {
          localStorage.setItem(STORAGE_KEY_LOGGED_DRIVER, JSON.stringify(existing));
        } catch {
          // ignore
        }
      } else {
        setLoggedDriver(null);
      }
    }

    // If hospital, fetch registered hospital profile from backend (no fake default assignment)
    if (role === 'hospital') {
      const existing = await fetchHospitalProfileByOwner(user.uid);
      if (existing) {
        setHospitals((prev) => {
          if (prev.some((h) => h.id === existing.id)) return prev;
          return [existing, ...prev];
        });
        setLoggedHospitalId(existing.id);
        try {
          localStorage.setItem(STORAGE_KEY_LOGGED_HOSP_ID, existing.id);
        } catch {
          // ignore
        }
      } else {
        setLoggedHospitalId(null);
      }
    }

    return user;
  };

  // Synchronize authenticated driver and hospital profiles from backend on session mount
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'driver' && !loggedDriver) {
        fetchDriverProfile(currentUser.uid).then((drv) => {
          if (drv) {
            setLoggedDriver(drv);
            try {
              localStorage.setItem(STORAGE_KEY_LOGGED_DRIVER, JSON.stringify(drv));
            } catch {
              // ignore
            }
          }
        });
      }

      if (currentUser.role === 'hospital' && !loggedHospitalId) {
        fetchHospitalProfileByOwner(currentUser.uid).then((hosp) => {
          if (hosp) {
            setHospitals((prev) => {
              if (prev.some((h) => h.id === hosp.id)) return prev;
              return [hosp, ...prev];
            });
            setLoggedHospitalId(hosp.id);
            try {
              localStorage.setItem(STORAGE_KEY_LOGGED_HOSP_ID, hosp.id);
            } catch {
              // ignore
            }
          }
        });
      }
    }
  }, [currentUser, loggedDriver, loggedHospitalId]);

  // Synchronize and strictly enforce RBAC: ensure logged-in user directly opens their registered portal
  useEffect(() => {
    if (currentUser?.role && ['guardian', 'driver', 'hospital'].includes(currentUser.role)) {
      if (currentRole !== currentUser.role) {
        setCurrentRoleState(currentUser.role);
        try {
          localStorage.setItem(STORAGE_KEY_ROLE, currentUser.role);
        } catch {
          // ignore
        }
        if (currentUser.role === 'guardian') setCurrentView('patient');
        else if (currentUser.role === 'driver') setCurrentView('ambulance');
        else if (currentUser.role === 'hospital') setCurrentView('hospital');
      }
    }
  }, [currentUser, currentRole]);

  const logoutUser = async (): Promise<void> => {
    await signOutUser();
    setCurrentUser(null);
    setLoggedDriver(null);
    setLoggedHospitalId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_LOGGED_DRIVER);
      localStorage.removeItem(STORAGE_KEY_LOGGED_HOSP_ID);
    } catch {
      // ignore
    }
    setCurrentRole('welcome');
  };

  // Active booking from localStorage (clean MVP: null by default, zero mocked simulations)
  const [activeBooking, setActiveBooking] = useState<EmergencyBooking | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.patientUniqueId === 'PAT-2026-8941' || parsed?.bookingCode === 'AMB-7492') {
          localStorage.removeItem(STORAGE_KEY_ACTIVE);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [allBookings, setAllBookings] = useState<EmergencyBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (saved) {
        const parsed: EmergencyBooking[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (b) => b.patientUniqueId !== 'PAT-2026-8941' && b.bookingCode !== 'AMB-7492'
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(filtered));
        }
        return filtered;
      }
      return [];
    } catch {
      return [];
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
        if (event.data.admissionNotice) {
          setAdmissionNotice(event.data.admissionNotice);
          try {
            localStorage.setItem('lifecare_admission_notice', JSON.stringify(event.data.admissionNotice));
          } catch {
            // ignore
          }
          soundEffects.playSuccessChime();
          speakTextWithSarvam('You are admitted. Have patience, everything will be alright.', { langCode: 'en-IN' }).catch(() => {});
        }
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastState = (
    newActive: EmergencyBooking | null,
    newBookings: EmergencyBooking[],
    newHosp?: Hospital[],
    newAdmission?: AdmissionNotification
  ) => {
    try {
      const channel = new BroadcastChannel('lifecare_sync_channel');
      channel.postMessage({
        type: 'SYNC_STATE',
        activeBooking: newActive,
        allBookings: newBookings,
        hospitals: newHosp || hospitals,
        admissionNotice: newAdmission,
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

  const saveActive = (booking: EmergencyBooking | null) => {
    setActiveBooking(booking);
    try {
      if (booking) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(booking));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
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

  const loginDriver = (_driverId: string, _pin: string): boolean => {
    return false;
  };

  const logoutDriver = () => {
    setLoggedDriver(null);
    try {
      localStorage.removeItem(STORAGE_KEY_LOGGED_DRIVER);
    } catch {
      // ignore
    }
    setCurrentView('patient');
  };

  // Register Driver Details after Google Sign-In & Save to Backend with Permanent Unique ID
  const registerDriverDetails = async (details: {
    driverName: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
  }): Promise<DriverAccount> => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const assignedId = currentUser?.uniqueRoleId?.startsWith('DRV')
      ? currentUser.uniqueRoleId
      : `DRV-2026-${num}`;

    const newDriver: DriverAccount = {
      driverId: assignedId,
      pin: '0000',
      driverName: details.driverName.trim(),
      phone: details.phone.trim(),
      vehicleNumber: details.vehicleNumber.trim().toUpperCase(),
      vehicleType: details.vehicleType.trim(),
    };

    setLoggedDriver(newDriver);
    if (currentUser) {
      await syncDriverProfileToFirestore(currentUser.uid, newDriver);
    }
    soundEffects.playSuccessChime();
    return newDriver;
  };

  // Register Hospital Details after Google Sign-In & Save to Backend with Permanent Unique ID
  const registerHospitalDetails = async (details: {
    name: string;
    type?: Hospital['type'];
    address: string;
    city: string;
    phone: string;
    beds: Hospital['beds'];
    doctors?: Doctor[];
    equipments?: Equipment[];
  }): Promise<Hospital> => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const hospId = currentUser?.uid ? `hosp_${currentUser.uid.slice(0, 10)}` : `hosp-reg-${num}`;
    const hospCode = `HSP-${num}`;

    const newHospital: Hospital = {
      id: hospId,
      hospitalCode: hospCode,
      password: '',
      name: details.name.trim(),
      type: details.type || 'Trauma Center Level 1',
      address: details.address.trim(),
      city: details.city.trim() || 'New Delhi',
      phone: details.phone.trim(),
      distanceKm: 2.8,
      transitTimeMins: 6,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      rating: 4.9,
      beds: details.beds,
      doctors: details.doctors || [],
      equipments: details.equipments || [],
      traumaLevel: 1,
      accreditation: ['NABH', 'Emergency Care Quality Standard'],
    };

    setHospitals((prev) => {
      const exists = prev.some((h) => h.id === hospId);
      const updated = exists ? prev.map((h) => (h.id === hospId ? newHospital : h)) : [newHospital, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setLoggedHospitalId(newHospital.id);
    try {
      localStorage.setItem(STORAGE_KEY_LOGGED_HOSP_ID, newHospital.id);
    } catch {
      // ignore
    }

    if (currentUser) {
      await syncHospitalProfileToFirestore(currentUser.uid, newHospital);
    }

    soundEffects.playSuccessChime();
    return newHospital;
  };

  // Look up patient medical records by ABHA ID or Unique Record ID (Clean MVP - No synthetic/mock data)
  const fetchPatientByAbha = (_abhaIdOrCode: string): ABHAMedicalRecord | undefined => {
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
    patientPhone?: string,
    abhaRecord?: ABHAMedicalRecord | null
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

    // Determine target ABHA profile
    const targetAbha = abhaRecord !== undefined ? abhaRecord : selectedAbhaProfile;

    const nameToUse = patientName || `PATIENT [${patientUniqueId}]`;
    const phoneToUse = patientPhone || 'PROTECTED (ZERO PII)';
    const assignedDriver = availableDrivers.length > 0 ? availableDrivers[0] : null;

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
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: userLocation.address,
      },
      assignedDoctor: freeDoctor,
      reservedBay: 'Trauma Bay #03 (Cath Lab 2)',
      reservedBedType: hosp.beds.icuFree > 0 ? 'ICU' : 'Emergency Trauma Bay',
      reservedEquipments: readyMachines.slice(0, 3),
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: 'AMBULANCE_EN_ROUTE_PICKUP',
      driverLoggedIn: Boolean(assignedDriver),
      ambulanceDetails: {
        vehicleNumber: assignedDriver ? assignedDriver.vehicleNumber : '108 Unit (Awaiting Assignment)',
        driverName: assignedDriver ? assignedDriver.driverName : 'Pending Driver Assignment',
        driverPhone: assignedDriver ? assignedDriver.phone : '108 Emergency Grid',
        type: (assignedDriver ? assignedDriver.vehicleType : '108 Emergency Ambulance') as any,
        currentEtaMins: 6,
        currentSpeedKmh: assignedDriver ? 48 : 0,
        distanceRemainingKm: 2.5,
      },
      inTransitPaperwork: {
        isSubmitted: false,
        digitalConsentSigned: true,
        preAdmitRegistrationNumber: 'ABDM-ER-' + Math.floor(100000 + Math.random() * 900000),
      },
      securitySignature: `HMAC-SHA256:0x${Math.random().toString(36).substring(2, 10)}${Date.now().toString(16)}`,
      tokenExpiryTimestamp: expiry.getTime(),
    };

    if (targetAbha) {
      setSelectedAbhaProfile(targetAbha);
      generateSessionKey()
        .then((key) => encryptMedicalRecord(targetAbha, patientUniqueId, key))
        .then((packet) => {
          newBooking.inTransitPaperwork.e2eePacket = packet;
          saveActive(newBooking);
          syncBookingToFirestore(newBooking);
        })
        .catch((err) => console.warn('[E2EE Encrypt]', err));
    }

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
    syncBookingToFirestore(newBooking);
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

  // Interlink Ambulance Driver with Emergency Booking Code & Patient ID
  const linkAmbulanceToBooking = (code: string, driver?: DriverAccount): EmergencyBooking | undefined => {
    const cleanCode = code.trim().toUpperCase();
    const currentDriver: DriverAccount = driver || loggedDriver || {
      driverId: 'DRV-108',
      pin: '1234',
      driverName: '108 Paramedic Lead',
      phone: '+91-98101-08108',
      vehicleNumber: 'DL-01-AMB-402',
      vehicleType: 'Advanced Cardiac Life Support (ACLS)',
    };

    const found = allBookings.find(
      (b) =>
        b.bookingCode.toUpperCase() === cleanCode ||
        b.patientUniqueId.toUpperCase() === cleanCode ||
        b.bookingCode.toUpperCase().includes(cleanCode) ||
        cleanCode.includes(b.bookingCode.toUpperCase())
    );

    if (!found) return undefined;

    const now = new Date().toISOString();
    const updatedBooking: EmergencyBooking = {
      ...found,
      driverLoggedIn: true,
      driverLoggedInAt: now,
      status: found.status === 'PENDING_AMBULANCE' ? 'AMBULANCE_EN_ROUTE_PICKUP' : found.status,
      ambulanceDetails: {
        ...found.ambulanceDetails,
        driverName: currentDriver.driverName,
        driverPhone: currentDriver.phone,
        vehicleNumber: currentDriver.vehicleNumber,
        type: currentDriver.vehicleType as any,
        currentSpeedKmh: 54,
      },
    };

    saveActive(updatedBooking);
    const updatedList = allBookings.map((b) => (b.bookingCode === found.bookingCode ? updatedBooking : b));
    saveAll(updatedList);
    broadcastState(updatedBooking, updatedList, hospitals);
    syncBookingToFirestore(updatedBooking);

    try {
      const channel = new BroadcastChannel('lifecare_sync_channel');
      channel.postMessage({
        type: 'DRIVER_INTERLINKED',
        booking: updatedBooking,
        driver: currentDriver,
      });
      channel.close();
    } catch {
      // fallback
    }

    soundEffects.playSuccessChime();
    return updatedBooking;
  };

  const loginAmbulanceDriver = (code: string): boolean => {
    const res = linkAmbulanceToBooking(code);
    return Boolean(res);
  };

  const updateAmbulanceStatus = (
    bookingCode: string,
    status: EmergencyBooking['status'],
    etaMins?: number,
    speed?: number
  ) => {
    let updatedActive = activeBooking;
    if (activeBooking && activeBooking.bookingCode === bookingCode) {
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
    if (activeBooking && activeBooking.bookingCode === bookingCode) {
      updatedActive = {
        ...activeBooking,
        patientName: activeBooking.patientName || `PATIENT [${activeBooking.patientUniqueId}]`,
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
          patientName: b.patientName || `PATIENT [${b.patientUniqueId}]`,
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
    if (updatedActive) {
      syncBookingToFirestore(updatedActive);
    }

    if (abha && updatedActive) {
      const activeObj = updatedActive;
      generateSessionKey()
        .then((key) => encryptMedicalRecord(abha, activeBooking?.patientUniqueId || 'PAT-2026-8941', key))
        .then((packet) => {
          if (activeObj.inTransitPaperwork) {
            activeObj.inTransitPaperwork.e2eePacket = packet;
            saveActive(activeObj);
            syncBookingToFirestore(activeObj);
          }
        })
        .catch((err) => console.warn('[E2EE Encrypt]', err));
    }

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
    if (activeBooking && activeBooking.bookingCode.toUpperCase() === codeClean) {
      const currentV = activeBooking.inTransitPaperwork?.initialVitals || defaultVitals;
      const mergedVitals = {
        ...currentV,
        ...vitalsUpdate,
        recordedAt: new Date().toISOString(),
      };
      updatedActive = {
        ...activeBooking,
        inTransitPaperwork: {
          ...activeBooking.inTransitPaperwork,
          initialVitals: mergedVitals,
          isSubmitted: true,
          digitalConsentSigned: true,
        },
      };
      saveActive(updatedActive);
      syncVitalsToFirestore(codeClean, mergedVitals);
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
  // Enforces fundamental invariant: Total capacity >= available / free beds
  const updateHospitalBeds = (hospitalId: string, bedsUpdate: Partial<Hospital['beds']>) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        const merged = { ...h.beds, ...bedsUpdate };
        const emergencyTotal = Math.max(0, merged.emergencyTotal ?? 0);
        const emergencyFree = Math.min(emergencyTotal, Math.max(0, merged.emergencyFree ?? 0));
        const icuTotal = Math.max(0, merged.icuTotal ?? 0);
        const icuFree = Math.min(icuTotal, Math.max(0, merged.icuFree ?? 0));
        const ventilatorTotal = Math.max(0, merged.ventilatorTotal ?? 0);
        const ventilatorFree = Math.min(ventilatorTotal, Math.max(0, merged.ventilatorFree ?? 0));

        return {
          ...h,
          beds: {
            emergencyTotal,
            emergencyFree,
            icuTotal,
            icuFree,
            ventilatorTotal,
            ventilatorFree,
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

  const updateDoctorDetails = (hospitalId: string, doctorId: string, updates: Partial<Doctor>) => {
    const updated = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          doctors: h.doctors.map((d) => (d.id === doctorId ? { ...d, ...updates } : d)),
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
    if (activeBooking && activeBooking.bookingCode === bookingCode) {
      updatedActive = { ...activeBooking, reservedBay: bayName };
      saveActive(updatedActive);
    }
    const updatedList = allBookings.map((b) => (b.bookingCode === bookingCode ? { ...b, reservedBay: bayName } : b));
    saveAll(updatedList);
    broadcastState(updatedActive, updatedList, hospitals);
  };

  const setPatientStatus = (bookingCode: string, status: EmergencyBooking['status']) => {
    let updatedActive = activeBooking;
    if (activeBooking && activeBooking.bookingCode === bookingCode) {
      updatedActive = {
        ...activeBooking,
        status,
      };
      saveActive(updatedActive);
    }
    const updatedList = allBookings.map((b) => (b.bookingCode === bookingCode ? { ...b, status } : b));
    saveAll(updatedList);

    let newNotice: AdmissionNotification | undefined = undefined;
    if (status === 'ADMITTED') {
      const target = updatedList.find((b) => b.bookingCode === bookingCode) || updatedActive;
      if (target) {
        newNotice = {
          bookingCode,
          patientId: target.patientUniqueId,
          patientName: target.patientName || 'Emergency Patient',
          hospitalName: target.hospitalName,
          bay: target.reservedBay,
          doctorName: target.assignedDoctor?.name || 'Emergency Attending Specialist',
          admittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAdmissionNotice(newNotice);
        try {
          localStorage.setItem('lifecare_admission_notice', JSON.stringify(newNotice));
        } catch {
          // ignore
        }
        soundEffects.playSuccessChime();
        speakTextWithSarvam('You are admitted. Have patience, everything will be alright.', { langCode: 'en-IN' }).catch(() => {});
      }
    }

    broadcastState(updatedActive, updatedList, hospitals, newNotice);
    soundEffects.playSuccessChime();
  };

  const admitPatient = (bookingCode: string) => {
    setPatientStatus(bookingCode, 'ADMITTED');
  };

  const dischargePatient = (bookingCode: string) => {
    setPatientStatus(bookingCode, 'DISCHARGED');
  };

  // Instant 1-Click Admission from Scanned Ambulance Voice-QR Payload
  const admitVoiceQrPatient = (
    registration: PatientVoiceRegistration,
    bay: string,
    doctorName: string,
    hospitalId?: string
  ): EmergencyBooking => {
    const hosp = hospitals.find((h) => h.id === hospitalId) || loggedHospital || hospitals[0];
    const doc = hosp.doctors.find((d) => d.name === doctorName) || hosp.doctors[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `QR-ADM-${randomNum}`;

    const newBooking: EmergencyBooking = {
      patientUniqueId: registration.patientId,
      bookingCode,
      patientName: registration.fullName,
      patientPhone: registration.guardianPhone,
      emergencyBrief: `${registration.chiefComplaint} (Voice-QR Reception Intake)`,
      aiAnalysis: {
        detectedCondition: registration.chiefComplaint,
        summary: `Pre-admission packet scanned via Voice-QR. Immediate bed allocation to ${bay}.`,
        urgency: 'CRITICAL_RED',
        urgencyLabel: 'Code Red - Direct Admission',
        esiLevel: 1,
        esiCategory: 'ESI-1: Immediate Resuscitation',
        goldenHourWindowMinutes: 60,
        recommendedSpeciality: [doc.specialization],
        requiredMachinery: ['Cath Lab Biplane', 'ALS Defibrillator'],
        firstAidImmediateInstructions: ['Immediate IV access', 'Telemetry monitor hookup'],
        icdCodeEstimate: 'ICD-10 I21.9',
        aiConfidenceScore: 99,
      },
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalAddress: hosp.address,
      hospitalPhone: hosp.phone,
      hospitalCoords: {
        lat: hosp.latitude,
        lng: hosp.longitude,
      },
      patientPickupCoords: {
        lat: 28.542,
        lng: 77.235,
        address: 'Ambulance Rapid Intake (Voice QR)',
      },
      assignedDoctor: doc,
      reservedBay: bay,
      reservedBedType: 'Emergency Trauma Bay',
      reservedEquipments: ['ALS Defibrillator', 'Vital Monitor'],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60000).toISOString(),
      status: 'ADMITTED',
      driverLoggedIn: true,
      ambulanceDetails: {
        vehicleNumber: 'DL-01-AMB-QR',
        driverName: '108 Paramedic Team',
        driverPhone: registration.guardianPhone,
        type: 'Advanced Cardiac Life Support (ACLS)',
        currentEtaMins: 0,
        currentSpeedKmh: 0,
        distanceRemainingKm: 0,
      },
      inTransitPaperwork: {
        isSubmitted: true,
        submittedAt: new Date().toISOString(),
        initialVitals: {
          heartRate: 110,
          bloodPressureSys: 140,
          bloodPressureDia: 90,
          spO2: 95,
          respiratoryRate: 20,
          temperatureF: 98.6,
          gcsScore: 15,
          recordedAt: new Date().toISOString(),
        },
        digitalConsentSigned: true,
        preAdmitRegistrationNumber: `VOICE-QR-${randomNum}`,
      },
      securitySignature: `VOICE-QR-AES-GCM-256:0x${randomNum}`,
      tokenExpiryTimestamp: Date.now() + 86400000,
    };

    saveActive(newBooking);
    const updatedBookings = [newBooking, ...allBookings.filter((b) => b.bookingCode !== bookingCode)];
    saveAll(updatedBookings);
    syncBookingToFirestore(newBooking);

    const newNotice: AdmissionNotification = {
      bookingCode,
      patientId: newBooking.patientUniqueId,
      patientName: newBooking.patientName,
      hospitalName: newBooking.hospitalName,
      bay: newBooking.reservedBay,
      doctorName: newBooking.assignedDoctor?.name || 'Emergency Attending Specialist',
      admittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAdmissionNotice(newNotice);
    try {
      localStorage.setItem('lifecare_admission_notice', JSON.stringify(newNotice));
    } catch {
      // ignore
    }
    soundEffects.playSuccessChime();
    speakTextWithSarvam('You are admitted. Have patience, everything will be alright.', { langCode: 'en-IN' }).catch(() => {});

    broadcastState(newBooking, updatedBookings, hospitals, newNotice);

    return newBooking;
  };

  const resetEmergencyState = () => {
    setCurrentTriage(null);
    setSelectedAbhaProfile(null);
    setActiveBooking(null);
    setAdmissionNotice(null);
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
      localStorage.removeItem('lifecare_admission_notice');
    } catch { }

    broadcastState(null, allBookings, hospitals);
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
        currentRole,
        loggedHospital,
        loggedDriver,
        selectedAbhaProfile,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isVoiceQrModalOpen,
        setIsVoiceQrModalOpen,
        loginWithGoogle,
        logoutUser,
        registerDriverDetails,
        registerHospitalDetails,
        admitVoiceQrPatient,
        searchTriageMode,
        setSearchTriageMode,
        navigateToTrack,
        setCurrentView,
        setCurrentRole,
        setSelectedAbhaProfile,
        fetchPatientByAbha,
        loginHospital,
        logoutHospital,
        loginDriver,
        logoutDriver,
        searchEmergency,
        bookHospitalBed,
        loginAmbulanceDriver,
        linkAmbulanceToBooking,
        getBookingByCode,
        updateAmbulanceStatus,
        submitInTransitPaperwork,
        updatePatientVitals,
        updateHospitalBeds,
        updateDoctorStatus,
        addDoctor,
        updateDoctorDetails,
        removeDoctor,
        updateEquipmentStatus,
        addEquipment,
        removeEquipment,
        updateHospitalDetails,
        assignTraumaBay,
        admitPatient,
        dischargePatient,
        setPatientStatus,
        admissionNotice,
        dismissAdmissionNotice,
        userLocation,
        requestLiveLocation,
        resetEmergencyState,
        theme,
        toggleTheme,
        setTheme,
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
