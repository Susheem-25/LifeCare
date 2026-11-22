/**
 * LifeCare Firebase Cloud Layer
 * Unified Authentication (Google Sign-In), Role-Based Unique ID Mapping (GRD/DRV/HSP),
 * and Cloud Firestore Telemetry & Mission Persistence.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  type Firestore
} from 'firebase/firestore';
import type { UserProfile, AppRole, EmergencyBooking, PatientVitals, DriverAccount, Hospital } from '../types';

// Production Firebase Configuration for LifeCare (lifecare7)
export const firebaseConfig = {
  apiKey: "AIzaSyDgT625zTXyvoTi4VBrKUFXV_MrkGVVIDI",
  authDomain: "lifecare7.firebaseapp.com",
  projectId: "lifecare7",
  storageBucket: "lifecare7.firebasestorage.app",
  messagingSenderId: "531388968618",
  appId: "1:531388968618:web:13288d037e94778af12ad3",
  measurementId: "G-BW4PMH49B8"
};

export const isRealFirebaseConfigured = (): boolean => true;

// Singleton App, Auth, Firestore and Analytics instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let _analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// Initialize Firebase Analytics safely in browser environments
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      _analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('[Firebase Analytics] Init notice:', err);
  });
}

export const getLifeCareAnalytics = (): Analytics | null => _analytics;

const LOCAL_USER_KEY = 'lifecare_current_user_profile';

/**
 * Generate Role-Specific Unique ID
 * E.g. GRD-4821 for Citizen/Guardian, DRV-8941 for 108 Paramedic, HSP-1092 for ER Command
 */
export function generateUniqueRoleId(role: AppRole): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  switch (role) {
    case 'guardian':
      return `GRD-${num}`;
    case 'driver':
      return `DRV-${num}`;
    case 'hospital':
      return `HSP-${num}`;
    default:
      return `USR-${num}`;
  }
}

/**
 * Retrieve saved user session from local storage or memory
 */
export function getSavedUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistUserProfile(profile: UserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch {
    // Ignore storage quota
  }
}

/**
 * Google Sign-In with automatic role-specific unique ID generation.
 * Real Firebase Google Authentication only - strictly zero mocked/fake fallback credentials.
 */
export async function signInWithGoogle(role: AppRole): Promise<UserProfile> {
  const existingProfile = getSavedUserProfile();
  const assignedUniqueId = existingProfile?.uniqueRoleId || generateUniqueRoleId(role);

  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.');
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  // Execute real Google OAuth popup flow
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;

  if (!fbUser || !fbUser.uid) {
    throw new Error('Google Sign-In did not return a valid user credential.');
  }

  const profile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || 'user@emergency.gov.in',
    displayName: fbUser.displayName || `Emergency Responder (${assignedUniqueId})`,
    photoURL: fbUser.photoURL || undefined,
    role,
    uniqueRoleId: assignedUniqueId,
    authProvider: 'google.com',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  if (db) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (dbErr) {
      console.warn('[Firestore] Profile write deferred or offline:', dbErr);
    }
  }

  persistUserProfile(profile);
  return profile;
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (auth && isRealFirebaseConfigured()) {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('[Firebase SignOut]', err);
    }
  }
  persistUserProfile(null);
}

/**
 * Auth state listener
 */
export function onAuthStateSubscription(callback: (user: UserProfile | null) => void): () => void {
  let unsubscribeFb: (() => void) | undefined;

  if (auth && isRealFirebaseConfigured()) {
    unsubscribeFb = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const saved = getSavedUserProfile();
        const role = saved?.role || 'guardian';
        const assignedId = saved?.uniqueRoleId || generateUniqueRoleId(role);
        const restored: UserProfile = {
          uid: user.uid,
          email: user.email || 'user@emergency.gov.in',
          displayName: user.displayName || `Emergency User (${assignedId})`,
          photoURL: user.photoURL || undefined,
          role,
          uniqueRoleId: assignedId,
          authProvider: 'google.com',
          createdAt: saved?.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        persistUserProfile(restored);
        callback(restored);
      } else {
        persistUserProfile(null);
        callback(null);
      }
    });
  } else {
    callback(null);
  }

  return () => {
    if (unsubscribeFb) unsubscribeFb();
  };
}

/**
 * Synchronize emergency booking to Cloud Firestore
 */
export async function syncBookingToFirestore(booking: EmergencyBooking): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'bookings', booking.bookingCode), booking, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Booking write fallback:', err);
    }
  }
}

/**
 * Real-time listener for emergency bookings from Cloud Firestore
 */
export function subscribeToFirestoreBookings(
  callback: (bookings: EmergencyBooking[]) => void
): () => void {
  if (db && isRealFirebaseConfigured()) {
    try {
      const q = collection(db, 'bookings');
      return onSnapshot(
        q,
        (snapshot) => {
          const list: EmergencyBooking[] = [];
          snapshot.forEach((d) => list.push(d.data() as EmergencyBooking));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        },
        (error) => {
          console.warn('[Firestore] Bookings snapshot listener fallback:', error);
        }
      );
    } catch {
      // Fallback
    }
  }
  return () => {};
}

/**
 * Real-time listener for registered hospitals from Cloud Firestore
 */
export function subscribeToFirestoreHospitals(
  callback: (hospitals: Hospital[]) => void
): () => void {
  if (db && isRealFirebaseConfigured()) {
    try {
      const q = collection(db, 'hospitals');
      return onSnapshot(
        q,
        (snapshot) => {
          const list: Hospital[] = [];
          snapshot.forEach((d) => list.push(d.data() as Hospital));
          callback(list);
        },
        (error) => {
          console.warn('[Firestore] Hospitals snapshot error:', error);
        }
      );
    } catch {
      // Fallback
    }
  }
  return () => {};
}

/**
 * Real-time listener for registered drivers from Cloud Firestore
 */
export function subscribeToFirestoreDrivers(
  callback: (drivers: DriverAccount[]) => void
): () => void {
  if (db && isRealFirebaseConfigured()) {
    try {
      const q = collection(db, 'drivers');
      return onSnapshot(
        q,
        (snapshot) => {
          const list: DriverAccount[] = [];
          snapshot.forEach((d) => list.push(d.data() as DriverAccount));
          callback(list);
        },
        (error) => {
          console.warn('[Firestore] Drivers snapshot error:', error);
        }
      );
    } catch {
      // Fallback
    }
  }
  return () => {};
}

/**
 * Synchronize in-transit vitals to Cloud Firestore
 */
export async function syncVitalsToFirestore(
  bookingCode: string,
  vitals: PatientVitals
): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'bookings', bookingCode), {
        'inTransitPaperwork.initialVitals': vitals,
      });
    } catch (err) {
      console.warn('[Firestore] Vitals update fallback:', err);
    }
  }
}

/**
 * Synchronize driver profile to Cloud Firestore and local persistence
 */
export async function syncDriverProfileToFirestore(
  uid: string,
  driver: DriverAccount
): Promise<void> {
  try {
    localStorage.setItem(`lifecare_driver_profile_${uid}`, JSON.stringify(driver));
    localStorage.setItem('lifecare_logged_driver_v2', JSON.stringify(driver));
  } catch {
    // ignore
  }

  if (db && isRealFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'drivers', uid), {
        ...driver,
        uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Driver write fallback:', err);
    }
  }
}

/**
 * Fetch driver profile from Firestore or local storage
 */
export async function fetchDriverProfile(uid: string): Promise<DriverAccount | null> {
  try {
    const local = localStorage.getItem(`lifecare_driver_profile_${uid}`);
    if (local) return JSON.parse(local);
  } catch {
    // ignore
  }

  if (db && isRealFirebaseConfigured()) {
    try {
      const snap = await getDoc(doc(db, 'drivers', uid));
      if (snap.exists()) {
        const data = snap.data() as DriverAccount;
        try {
          localStorage.setItem(`lifecare_driver_profile_${uid}`, JSON.stringify(data));
        } catch {
          // ignore
        }
        return data;
      }
    } catch (err) {
      console.warn('[Firestore] Fetch driver profile fallback:', err);
    }
  }
  return null;
}

/**
 * Super Admin Management Operations
 */

export async function deleteHospitalFromFirestore(hospitalId: string): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'hospitals', hospitalId));
    } catch (err) {
      console.warn('[Admin] Failed to delete hospital from Firestore:', err);
      throw err;
    }
  }
}

export async function toggleHospitalSuspendInFirestore(hospitalId: string, isSuspended: boolean): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'hospitals', hospitalId), {
        isSuspended,
        suspendedAt: isSuspended ? new Date().toISOString() : null,
      });
    } catch (err) {
      console.warn('[Admin] Failed to toggle hospital suspension:', err);
      throw err;
    }
  }
}

export async function deleteDriverFromFirestore(driverDocId: string): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'drivers', driverDocId));
    } catch (err) {
      console.warn('[Admin] Failed to delete driver from Firestore:', err);
      throw err;
    }
  }
}

export async function toggleDriverSuspendInFirestore(driverDocId: string, isSuspended: boolean): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'drivers', driverDocId), {
        isSuspended,
        suspendedAt: isSuspended ? new Date().toISOString() : null,
      });
    } catch (err) {
      console.warn('[Admin] Failed to toggle driver suspension:', err);
      throw err;
    }
  }
}

export async function deleteBookingFromFirestore(bookingCode: string): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'bookings', bookingCode));
    } catch (err) {
      console.warn('[Admin] Failed to delete booking from Firestore:', err);
      throw err;
    }
  }
}

export async function toggleBookingSuspendInFirestore(bookingCode: string, isSuspended: boolean): Promise<void> {
  if (db && isRealFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'bookings', bookingCode), {
        isSuspended,
        suspendedAt: isSuspended ? new Date().toISOString() : null,
      });
    } catch (err) {
      console.warn('[Admin] Failed to toggle booking suspension:', err);
      throw err;
    }
  }
}


/**
 * Synchronize hospital profile to Cloud Firestore and local persistence
 */
export async function syncHospitalProfileToFirestore(
  uid: string,
  hospital: Hospital
): Promise<void> {
  try {
    localStorage.setItem(`lifecare_hospital_profile_${uid}`, JSON.stringify(hospital));
    localStorage.setItem('lifecare_logged_hosp_id_v2', hospital.id);
  } catch {
    // ignore
  }

  if (db && isRealFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'hospitals', hospital.id), {
        ...hospital,
        ownerUid: uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Hospital write fallback:', err);
    }
  }
}

/**
 * Fetch hospital profile for owner UID
 */
export async function fetchHospitalProfileByOwner(uid: string): Promise<Hospital | null> {
  try {
    const local = localStorage.getItem(`lifecare_hospital_profile_${uid}`);
    if (local) return JSON.parse(local);
  } catch {
    // ignore
  }

  if (db && isRealFirebaseConfigured()) {
    try {
      const hospDocId = `hosp_${uid.slice(0, 10)}`;
      const snap = await getDoc(doc(db, 'hospitals', hospDocId));
      if (snap.exists()) {
        const data = snap.data() as Hospital;
        try {
          localStorage.setItem(`lifecare_hospital_profile_${uid}`, JSON.stringify(data));
        } catch {
          // ignore
        }
        return data;
      }
    } catch (err) {
      console.warn('[Firestore] Fetch hospital profile fallback:', err);
    }
  }
  return null;
}


