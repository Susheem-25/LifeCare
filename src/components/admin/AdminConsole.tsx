import React, { useState, useMemo } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { isAuthorizedAdminEmail } from '../../config/adminConfig';
import {
  deleteHospitalFromFirestore,
  toggleHospitalSuspendInFirestore,
  deleteDriverFromFirestore,
  toggleDriverSuspendInFirestore,
  deleteBookingFromFirestore,
  toggleBookingSuspendInFirestore,
  checkIsAdminInFirestore,
  signInWithGoogle,
  signOutUser,
} from '../../services/firebase';
import {
  ShieldAlert,
  Building2,
  Ambulance,
  Users,
  Activity,
  Search,
  Trash2,
  Ban,
  CheckCircle2,
  Calendar,
  Clock,
  LogOut,
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import type { Hospital, DriverAccount, EmergencyBooking } from '../../types';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AdminConsole: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logoutUser,
    hospitals,
    allBookings,
    theme,
    toggleTheme
  } = useEmergency();

  const [activeTab, setActiveTab] = useState<'audit' | 'patients' | 'hospitals' | 'drivers'>('audit');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  // Search & Filter State
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [patientStatusFilter, setPatientStatusFilter] = useState<string>('ALL');
  const [patientStartDate, setPatientStartDate] = useState<string>('');
  const [patientEndDate, setPatientEndDate] = useState<string>('');
  const [patientSort, setPatientSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const [hospitalSearch, setHospitalSearch] = useState<string>('');
  const [hospitalCityFilter, setHospitalCityFilter] = useState<string>('ALL');
  const [hospitalSort, setHospitalSort] = useState<'NAME' | 'BEDS' | 'DATE'>('NAME');

  const [driverSearch, setDriverSearch] = useState<string>('');
  const [driverTypeFilter, setDriverTypeFilter] = useState<string>('ALL');
  const [driverSort, setDriverSort] = useState<'NAME' | 'VEHICLE'>('NAME');

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Derive all unique drivers from bookings and local state
  const registeredDrivers = useMemo(() => {
    const map = new Map<string, DriverAccount>();
    allBookings.forEach((b) => {
      if (b.ambulanceDetails && b.ambulanceDetails.vehicleNumber) {
        map.set(b.ambulanceDetails.vehicleNumber, {
          driverId: `DRV-${b.ambulanceDetails.vehicleNumber.replace(/\D/g, '').slice(-4) || '108'}`,
          pin: '****',
          driverName: b.ambulanceDetails.driverName || '108 Paramedic',
          phone: b.ambulanceDetails.driverPhone || '108 National Grid',
          vehicleNumber: b.ambulanceDetails.vehicleNumber,
          vehicleType: b.ambulanceDetails.type || 'Advanced Cardiac Life Support (ACLS)',
        });
      }
    });
    return Array.from(map.values());
  }, [allBookings]);

  // Check super admin clearance: either in config whitelist or in Firestore `admins` collection
  const isStaticAdmin = Boolean(currentUser?.email && isAuthorizedAdminEmail(currentUser.email));
  const [isFirestoreAdmin, setIsFirestoreAdmin] = useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    if (currentUser?.email && !isStaticAdmin) {
      checkIsAdminInFirestore(currentUser.email).then((isDbAdmin) => {
        if (isMounted) {
          setIsFirestoreAdmin(isDbAdmin);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, isStaticAdmin]);

  const isAdmin = Boolean(currentUser && (isStaticAdmin || isFirestoreAdmin));

  const handleAdminLogout = async () => {
    setIsFirestoreAdmin(false);
    setAuthError('');
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    await logoutUser();
  };

  const handleAdminGoogleLogin = async () => {
    setAuthError('');
    setIsAuthenticating(true);
    try {
      // Clear any prior non-admin Google session so the Google account selector screen opens directly
      await signOutUser();
      const user = await signInWithGoogle('hospital');
      setCurrentUser(user);

      const isEmailAuthorized = isAuthorizedAdminEmail(user.email);
      const isDbAdmin = await checkIsAdminInFirestore(user.email);

      if (!isEmailAuthorized && !isDbAdmin) {
        setAuthError('Access Denied: The selected Google account does not have Super Admin clearance. Please sign in with an authorized administrator account.');
      } else {
        setIsFirestoreAdmin(true);
        showNotice('Super Admin Clearance Granted.');
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Google authentication cancelled or failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Admin Mutations: Hospital
  const handleDeleteHospital = async (hosp: Hospital) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${hosp.name}"? This cannot be undone.`)) return;
    try {
      await deleteHospitalFromFirestore(hosp.id);
      showNotice(`Deleted Hospital "${hosp.name}" from database.`);
    } catch (err) {
      alert(`Deletion failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleToggleSuspendHospital = async (hosp: Hospital) => {
    const newStatus = !(hosp as any).isSuspended;
    try {
      await toggleHospitalSuspendInFirestore(hosp.id, newStatus);
      showNotice(`${newStatus ? 'Suspended' : 'Activated'} Hospital "${hosp.name}".`);
    } catch (err) {
      alert(`Status update failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Admin Mutations: Driver
  const handleDeleteDriver = async (drv: DriverAccount) => {
    if (!window.confirm(`Are you sure you want to delete Driver "${drv.driverName}" (${drv.vehicleNumber})?`)) return;
    try {
      await deleteDriverFromFirestore(drv.driverId);
      showNotice(`Deleted Driver "${drv.driverName}" from database.`);
    } catch (err) {
      alert(`Deletion failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleToggleSuspendDriver = async (drv: DriverAccount) => {
    const newStatus = !(drv as any).isSuspended;
    try {
      await toggleDriverSuspendInFirestore(drv.driverId, newStatus);
      showNotice(`${newStatus ? 'Suspended' : 'Activated'} Driver "${drv.driverName}".`);
    } catch (err) {
      alert(`Status update failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Admin Mutations: Patient / Booking
  const handleDeleteBooking = async (b: EmergencyBooking) => {
    if (!window.confirm(`Are you sure you want to delete Patient Mission "${b.patientUniqueId}" (${b.bookingCode})?`)) return;
    try {
      await deleteBookingFromFirestore(b.bookingCode);
      showNotice(`Deleted Patient Mission "${b.patientUniqueId}" from database.`);
    } catch (err) {
      alert(`Deletion failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleToggleSuspendBooking = async (b: EmergencyBooking) => {
    const newStatus = !(b as any).isSuspended;
    try {
      await toggleBookingSuspendInFirestore(b.bookingCode, newStatus);
      showNotice(`${newStatus ? 'Suspended' : 'Reinstated'} Patient Mission "${b.patientUniqueId}".`);
    } catch (err) {
      alert(`Status update failed: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  // Filtered & Sorted Patients
  const filteredPatients = useMemo(() => {
    return allBookings
      .filter((b) => {
        const q = patientSearch.toLowerCase();
        const matchesQuery =
          !q ||
          b.patientUniqueId.toLowerCase().includes(q) ||
          b.bookingCode.toLowerCase().includes(q) ||
          b.patientName.toLowerCase().includes(q) ||
          b.patientPhone.toLowerCase().includes(q) ||
          b.hospitalName.toLowerCase().includes(q);

        const matchesStatus =
          patientStatusFilter === 'ALL' ||
          (patientStatusFilter === 'ACTIVE' && b.status !== 'ADMITTED' && b.status !== 'DISCHARGED') ||
          (patientStatusFilter === 'ADMITTED' && b.status === 'ADMITTED') ||
          (patientStatusFilter === 'DISCHARGED' && b.status === 'DISCHARGED');

        let matchesDate = true;
        if (patientStartDate) {
          matchesDate = matchesDate && new Date(b.createdAt) >= new Date(patientStartDate);
        }
        if (patientEndDate) {
          matchesDate = matchesDate && new Date(b.createdAt) <= new Date(patientEndDate + 'T23:59:59');
        }

        return matchesQuery && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (patientSort === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [allBookings, patientSearch, patientStatusFilter, patientStartDate, patientEndDate, patientSort]);

  // Filtered & Sorted Hospitals
  const hospitalCities = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => h.city && set.add(h.city));
    return Array.from(set);
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((h) => {
        const q = hospitalSearch.toLowerCase();
        const matchesQuery = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || (h.hospitalCode && h.hospitalCode.toLowerCase().includes(q));
        const matchesCity = hospitalCityFilter === 'ALL' || h.city === hospitalCityFilter;
        return matchesQuery && matchesCity;
      })
      .sort((a, b) => {
        if (hospitalSort === 'NAME') return a.name.localeCompare(b.name);
        if (hospitalSort === 'BEDS') return (b.beds?.icuFree || 0) - (a.beds?.icuFree || 0);
        return 0;
      });
  }, [hospitals, hospitalSearch, hospitalCityFilter, hospitalSort]);

  // Filtered Drivers
  const filteredDrivers = useMemo(() => {
    return registeredDrivers
      .filter((d) => {
        const q = driverSearch.toLowerCase();
        const matchesQuery =
          !q ||
          d.driverName.toLowerCase().includes(q) ||
          d.vehicleNumber.toLowerCase().includes(q) ||
          d.phone.toLowerCase().includes(q) ||
          d.driverId.toLowerCase().includes(q);
        const matchesType = driverTypeFilter === 'ALL' || d.vehicleType === driverTypeFilter;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        if (driverSort === 'NAME') return a.driverName.localeCompare(b.driverName);
        return a.vehicleNumber.localeCompare(b.vehicleNumber);
      });
  }, [registeredDrivers, driverSearch, driverTypeFilter, driverSort]);

  // 1. OLED ACCESS GATEWAY: If not authenticated or not an authorized admin email
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-4 antialiased selection:bg-red-500 selection:text-white">
        <div className="w-full max-w-md bg-[#0a0a0c] border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-[11px] font-mono font-bold tracking-wider uppercase">
              <span>Restricted Command • /admin</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              LifeCare Super Admin
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Access to this console requires verified Google authentication matching authorized system administrator credentials.
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Authentication Rejected</span>
              </div>
              <p className="text-[11px] leading-relaxed">{authError}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleAdminGoogleLogin}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 transition shadow-lg shadow-white/5 cursor-pointer"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>{isAuthenticating ? 'Opening Google Sign-In...' : 'Continue with Google'}</span>
            </button>

            <a
              href="/"
              className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-medium py-2 block text-center transition"
            >
              ← Return to Citizen Public Grid
            </a>
          </div>

          <div className="pt-4 border-t border-zinc-900 text-center">
            <p className="text-[10px] font-mono text-zinc-600">
              LifeCare Zero-Trust Architecture • All Admin Access Logs Monitored
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. OLED SUPER ADMIN CONSOLE INTERFACE
  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased font-sans selection:bg-emerald-500 selection:text-black">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold shadow-2xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* OLED Admin Top Bar */}
      <header className="border-b border-zinc-800/80 bg-black/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/30">
            LC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white tracking-tight">LifeCare OLED Command</span>
              <span className="bg-red-950/80 text-red-400 border border-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Zero-Wait Emergency Operating System • Live National Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white">{currentUser?.displayName}</span>
            <span className="text-[10px] font-mono text-emerald-400">{currentUser?.email}</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Console Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-1.5 flex flex-wrap gap-1.5">
          {[
            { id: 'audit', label: 'Emergency Audit & Timeline', icon: Activity, count: allBookings.length },
            { id: 'patients', label: 'Patients & Linked Guardians', icon: Users, count: allBookings.length },
            { id: 'hospitals', label: 'Registered Hospitals', icon: Building2, count: hospitals.length },
            { id: 'drivers', label: '108 Ambulance Drivers', icon: Ambulance, count: registeredDrivers.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[160px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-900 text-emerald-400 border border-zinc-700' : 'bg-zinc-900 text-zinc-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: LIVE EMERGENCY AUDIT & TIMELINE TRACKER
            ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Total Emergency Dispatches</span>
                <div className="text-2xl font-black text-white">{allBookings.length}</div>
              </div>
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase">In-Transit Ambulances</span>
                <div className="text-2xl font-black text-amber-400">
                  {allBookings.filter((b) => b.status === 'AMBULANCE_EN_ROUTE_PICKUP' || b.status === 'PATIENT_PICKED_UP' || b.status === 'IN_TRANSIT_TO_HOSPITAL').length}
                </div>
              </div>
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase">ER Bay Admissions</span>
                <div className="text-2xl font-black text-emerald-400">
                  {allBookings.filter((b) => b.status === 'ADMITTED').length}
                </div>
              </div>
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Active Network Hospitals</span>
                <div className="text-2xl font-black text-cyan-400">{hospitals.length}</div>
              </div>
            </div>

            {/* Event Audit Stream */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Live Emergency Mission Audit Trail</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Chronological lifecycle of locked beds, ambulance linkage, telemetry updates, and hospital intake.
                  </p>
                </div>
              </div>

              {allBookings.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs">
                  No emergency missions logged in database yet. New emergencies from the Guardian Portal will appear here live.
                </div>
              ) : (
                <div className="space-y-4">
                  {allBookings.map((b) => (
                    <div
                      key={b.bookingCode}
                      className="bg-black border border-zinc-800/90 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition"
                    >
                      {/* Mission Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono font-bold text-red-400 bg-red-950/70 border border-red-800 px-2.5 py-0.5 rounded-md text-xs">
                            {b.patientUniqueId}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">
                            Ref: {b.bookingCode}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            b.status === 'ADMITTED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : b.status === 'DISCHARGED'
                              ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Audit Milestones Progress Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                        {/* Step 1: Bed Locked */}
                        <div className="bg-[#09090b] border border-zinc-800/70 p-3.5 rounded-xl space-y-1">
                          <div className="text-[10px] text-zinc-500 uppercase flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>1. Hospital Bed Locked</span>
                          </div>
                          <div className="text-white font-bold">{b.hospitalName}</div>
                          <div className="text-emerald-400 text-[11px]">Locked: {b.reservedBay}</div>
                          <div className="text-zinc-500 text-[10px]">Guardian: {b.patientName}</div>
                        </div>

                        {/* Step 2: Ambulance Link */}
                        <div className="bg-[#09090b] border border-zinc-800/70 p-3.5 rounded-xl space-y-1">
                          <div className="text-[10px] text-zinc-500 uppercase flex items-center space-x-1">
                            <Ambulance className="w-3 h-3 text-amber-400" />
                            <span>2. 108 Fleet Dispatch</span>
                          </div>
                          <div className="text-white font-bold">{b.ambulanceDetails?.vehicleNumber || 'Pending Driver'}</div>
                          <div className="text-amber-400 text-[11px]">Driver: {b.ambulanceDetails?.driverName}</div>
                          <div className="text-zinc-500 text-[10px]">Speed: {b.ambulanceDetails?.currentSpeedKmh} km/h • ETA: {b.ambulanceDetails?.currentEtaMins}m</div>
                        </div>

                        {/* Step 3: ER Bay Intake */}
                        <div className="bg-[#09090b] border border-zinc-800/70 p-3.5 rounded-xl space-y-1">
                          <div className="text-[10px] text-zinc-500 uppercase flex items-center space-x-1">
                            <Stethoscope className="w-3 h-3 text-cyan-400" />
                            <span>3. Hospital Admission</span>
                          </div>
                          <div className="text-white font-bold">
                            {b.status === 'ADMITTED' ? 'Patient Admitted' : 'En Route to Bay'}
                          </div>
                          <div className="text-cyan-400 text-[11px]">Doctor: {b.assignedDoctor?.name || 'ER Trauma Chief'}</div>
                          <div className="text-zinc-500 text-[10px]">Triage Acuity: {b.aiAnalysis?.esiCategory || 'ESI Level 1'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PATIENTS & LINKED GUARDIANS DIRECTORY
            ======================================================== */}
        {activeTab === 'patients' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filters Header */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Search */}
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search Patient ID, Guardian, Phone, or Booking Code..."
                    className="w-full bg-black text-white pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={patientStatusFilter}
                    onChange={(e) => setPatientStatusFilter(e.target.value)}
                    className="w-full bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ALL">All Mission Statuses</option>
                    <option value="ACTIVE">Active / En Route</option>
                    <option value="ADMITTED">Admitted to ER</option>
                    <option value="DISCHARGED">Discharged</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <select
                    value={patientSort}
                    onChange={(e) => setPatientSort(e.target.value as any)}
                    className="w-full bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none font-mono"
                  >
                    <option value="NEWEST">Sort: Newest First</option>
                    <option value="OLDEST">Sort: Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Date Range Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-zinc-900">
                <span className="text-zinc-500 font-mono text-[11px] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Filter Date Range:</span>
                </span>
                <input
                  type="date"
                  value={patientStartDate}
                  onChange={(e) => setPatientStartDate(e.target.value)}
                  className="bg-black text-white px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono"
                />
                <span className="text-zinc-600">to</span>
                <input
                  type="date"
                  value={patientEndDate}
                  onChange={(e) => setPatientEndDate(e.target.value)}
                  className="bg-black text-white px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono"
                />
                {(patientStartDate || patientEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientStartDate('');
                      setPatientEndDate('');
                    }}
                    className="text-zinc-400 hover:text-white text-[11px] underline cursor-pointer"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

            {/* Patients Table / List */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-3xl overflow-hidden">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs">
                  No matching patients found.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {filteredPatients.map((p) => {
                    const isSuspended = (p as any).isSuspended;
                    return (
                      <div
                        key={p.bookingCode}
                        className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                          isSuspended ? 'bg-red-950/20 opacity-70' : 'hover:bg-zinc-950'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-red-400 text-xs bg-red-950/80 border border-red-800 px-2 py-0.5 rounded-md">
                              {p.patientUniqueId}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              Booking: {p.bookingCode}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Created: {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSuspended && (
                              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950 border border-red-800 px-2 py-0.5 rounded-full">
                                SUSPENDED
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                            <span>Guardian: {p.patientName}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="font-mono text-zinc-400 text-xs">{p.patientPhone}</span>
                          </div>

                          <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                            <span>Hospital: <strong className="text-zinc-200">{p.hospitalName}</strong></span>
                            <span>•</span>
                            <span>Bay: <strong className="text-emerald-400">{p.reservedBay}</strong></span>
                            <span>•</span>
                            <span>Driver: <strong className="text-amber-400">{p.ambulanceDetails?.driverName || 'Unassigned'}</strong> ({p.ambulanceDetails?.vehicleNumber || 'No Fleet'})</span>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSuspendBooking(p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border cursor-pointer flex items-center space-x-1.5 ${
                              isSuspended
                                ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{isSuspended ? 'Reinstate' : 'Suspend'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(p)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border bg-red-950/80 hover:bg-red-900 border-red-800 text-red-300 cursor-pointer flex items-center space-x-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: REGISTERED HOSPITALS DIRECTORY
            ======================================================== */}
        {activeTab === 'hospitals' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Hospital Filters Header */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder="Search Hospital Name, Code, or City..."
                  className="w-full bg-black text-white pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={hospitalCityFilter}
                  onChange={(e) => setHospitalCityFilter(e.target.value)}
                  className="bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">All Cities</option>
                  {hospitalCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={hospitalSort}
                  onChange={(e) => setHospitalSort(e.target.value as any)}
                  className="bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-emerald-500 focus:outline-none font-mono"
                >
                  <option value="NAME">Sort by Name</option>
                  <option value="BEDS">Sort by Free ICU</option>
                </select>
              </div>
            </div>

            {/* Hospitals Cards Grid */}
            {filteredHospitals.length === 0 ? (
              <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-16 text-center text-zinc-500 text-xs">
                No hospitals registered in network yet. New hospitals registered via Google Sign-In will appear here live.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHospitals.map((h) => {
                  const isSuspended = (h as any).isSuspended;
                  return (
                    <div
                      key={h.id}
                      className={`bg-[#09090b] border rounded-3xl p-6 space-y-4 transition ${
                        isSuspended ? 'border-red-900 bg-red-950/10' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-cyan-400 px-2 py-0.5 rounded-md">
                              {h.hospitalCode || h.id}
                            </span>
                            {isSuspended && (
                              <span className="text-[10px] font-mono font-bold bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded-full">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black text-white">{h.name}</h4>
                          <p className="text-xs text-zinc-400">{h.address}, {h.city}</p>
                          <p className="text-xs text-zinc-500 font-mono">Phone: {h.phone}</p>
                        </div>
                      </div>

                      {/* Bed Capacities */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-black p-3 rounded-2xl border border-zinc-800/80">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">ICU BEDS</span>
                          <span className="text-emerald-400 font-bold">{h.beds?.icuFree ?? 0}</span> / {h.beds?.icuTotal ?? 0}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">EMERGENCY</span>
                          <span className="text-amber-400 font-bold">{h.beds?.emergencyFree ?? 0}</span> / {h.beds?.emergencyTotal ?? 0}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">VENTILATORS</span>
                          <span className="text-cyan-400 font-bold">{h.beds?.ventilatorFree ?? 0}</span> / {h.beds?.ventilatorTotal ?? 0}
                        </div>
                      </div>

                      {/* Doctor & Equipment Counts */}
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
                        <span>Doctors on Roster: <strong className="text-white">{h.doctors?.length || 0}</strong></span>
                        <span>Medical Equipment: <strong className="text-white">{h.equipments?.length || 0}</strong></span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => handleToggleSuspendHospital(h)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border cursor-pointer flex items-center space-x-1.5 ${
                            isSuspended
                              ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHospital(h)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border bg-red-950/80 hover:bg-red-900 border-red-800 text-red-300 cursor-pointer flex items-center space-x-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: 108 AMBULANCE DRIVERS DIRECTORY
            ======================================================== */}
        {activeTab === 'drivers' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Driver Filters Header */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search Driver Name, Vehicle Number, Phone, or ID..."
                  className="w-full bg-black text-white pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={driverTypeFilter}
                  onChange={(e) => setDriverTypeFilter(e.target.value)}
                  className="bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value="ALL">All Classifications</option>
                  <option value="Advanced Cardiac Life Support (ACLS)">ACLS</option>
                  <option value="Basic Life Support (BLS)">BLS</option>
                  <option value="Trauma Mobile ICU">Trauma Mobile ICU</option>
                  <option value="Patient Transport Ambulance (PTA)">PTA</option>
                </select>
                <select
                  value={driverSort}
                  onChange={(e) => setDriverSort(e.target.value as any)}
                  className="bg-black text-white px-3 py-2 rounded-xl border border-zinc-800 focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value="NAME">Sort by Driver Name</option>
                  <option value="VEHICLE">Sort by Vehicle Number</option>
                </select>
              </div>
            </div>

            {/* Drivers List */}
            {filteredDrivers.length === 0 ? (
              <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-16 text-center text-zinc-500 text-xs">
                No ambulance drivers registered yet. Drivers onboarding with Google in the Driver Portal will be cataloged here automatically.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrivers.map((drv) => {
                  const isSuspended = (drv as any).isSuspended;
                  return (
                    <div
                      key={drv.vehicleNumber}
                      className={`bg-[#09090b] border rounded-3xl p-6 space-y-4 transition ${
                        isSuspended ? 'border-red-900 bg-red-950/10' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center shrink-0">
                            <Ambulance className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-amber-400 px-2 py-0.5 rounded-md">
                                {drv.driverId}
                              </span>
                              {isSuspended && (
                                <span className="text-[10px] font-mono font-bold bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded-full">
                                  SUSPENDED
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-black text-white mt-0.5">{drv.driverName}</h4>
                            <p className="text-xs font-mono text-zinc-400">{drv.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black border border-zinc-800/80 p-3.5 rounded-2xl text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Vehicle Registration:</span>
                          <strong className="text-white font-black">{drv.vehicleNumber}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Classification:</span>
                          <span className="text-amber-400 font-bold">{drv.vehicleType}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => handleToggleSuspendDriver(drv)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border cursor-pointer flex items-center space-x-1.5 ${
                            isSuspended
                              ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDriver(drv)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border bg-red-950/80 hover:bg-red-900 border-red-800 text-red-300 cursor-pointer flex items-center space-x-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
