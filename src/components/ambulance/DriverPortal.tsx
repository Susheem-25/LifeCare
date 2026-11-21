import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Ambulance,
  Search,
  Navigation,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Phone,
  Sparkles,
  Loader2
} from 'lucide-react';
import { sanitizeIdentifier, sanitizeText } from '../../utils/security';
import { LiveRouteMap } from '../common/LiveRouteMap';
import { getGoogleMapsNavigationUrl } from '../../services/sarvamAiService';

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

export const DriverPortal: React.FC = () => {
  const {
    loggedDriver,
    logoutDriver,
    activeBooking,
    allBookings,
    linkAmbulanceToBooking,
    updateAmbulanceStatus,
    loginWithGoogle,
    currentUser,
    registerDriverDetails
  } = useEmergency();

  // Driver Onboarding Form State (after Google Sign-In)
  const [onboardingName, setOnboardingName] = useState(currentUser?.displayName || '');
  const [onboardingPhone, setOnboardingPhone] = useState('+91-98101-08108');
  const [onboardingVehicle, setOnboardingVehicle] = useState('DL-01-AMB-402');
  const [onboardingType, setOnboardingType] = useState('Advanced Cardiac Life Support (ACLS)');
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');

  // Patient ID Prompt State
  const [patientIdInput, setPatientIdInput] = useState<string>(activeBooking?.patientUniqueId || '');
  const [selectedMission, setSelectedMission] = useState(activeBooking);
  const [lookupNotice, setLookupNotice] = useState<string>('');
  const [transitStatus, setTransitStatus] = useState<string>(activeBooking?.status || 'IN_TRANSIT_TO_HOSPITAL');

  // Keep in sync with activeBooking
  useEffect(() => {
    if (activeBooking) {
      // oxlint-disable-next-line react/set-state-in-effect
      setSelectedMission(activeBooking);
      setPatientIdInput(activeBooking.patientUniqueId);
      setTransitStatus(activeBooking.status);
    }
  }, [activeBooking]);

  // Keep onboarding name prefilled if user profile loads
  useEffect(() => {
    if (currentUser?.displayName && !onboardingName) {
      // oxlint-disable-next-line react/set-state-in-effect
      setOnboardingName(currentUser.displayName);
    }
  }, [currentUser, onboardingName]);

  // Handle Driver Onboarding Submission
  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingName.trim() || !onboardingPhone.trim() || !onboardingVehicle.trim()) {
      setOnboardingError('Please enter driver name, phone number, and vehicle registration number.');
      return;
    }
    setIsOnboardingSubmitting(true);
    setOnboardingError('');
    try {
      await registerDriverDetails({
        driverName: sanitizeText(onboardingName),
        phone: sanitizeText(onboardingPhone),
        vehicleNumber: sanitizeText(onboardingVehicle),
        vehicleType: sanitizeText(onboardingType),
      });
    } catch (err: unknown) {
      setOnboardingError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  // Handle Patient ID Submission
  const handlePatientIdSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = patientIdInput.trim().toUpperCase();
    if (!clean) return;

    const linked = linkAmbulanceToBooking(clean, loggedDriver || undefined);
    if (linked) {
      setSelectedMission(linked);
      setTransitStatus(linked.status);
      setLookupNotice(`Mission linked! Head straight to ${linked.hospitalName}`);
      setTimeout(() => setLookupNotice(''), 4000);
    } else {
      setLookupNotice(`Patient ID "${clean}" not found in active dispatch queue.`);
      setTimeout(() => setLookupNotice(''), 4000);
    }
  };

  // Handle Transit Status Updates
  const handleStatusUpdate = (status: 'AMBULANCE_EN_ROUTE_PICKUP' | 'PATIENT_PICKED_UP' | 'IN_TRANSIT_TO_HOSPITAL' | 'ARRIVED_ER') => {
    if (!selectedMission) return;
    setTransitStatus(status);
    updateAmbulanceStatus(selectedMission.bookingCode, status);
  };

  // Google Maps navigation link
  const googleMapsUrl = selectedMission
    ? getGoogleMapsNavigationUrl(
      { lat: selectedMission.patientPickupCoords.lat, lng: selectedMission.patientPickupCoords.lng },
      { lat: selectedMission.hospitalCoords.lat, lng: selectedMission.hospitalCoords.lng }
    )
    : '#';

  // 1. IF NOT SIGNED IN WITH GOOGLE: Clean Google Auth screen (Zero Gimmick ID/PIN)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-10 space-y-6 animate-fadeIn px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Ambulance className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              108 Emergency Driver Portal
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Sign in with your Google account to connect your ambulance unit to the National 108 Emergency Network and navigate to allocated ER bays.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle('driver')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 transition shadow-md shadow-slate-900/20 cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Sign in with Google (108 Driver Portal)</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. IF SIGNED IN VIA GOOGLE BUT DRIVER DETAILS NOT YET COMPLETED: Driver Onboarding
  if (!loggedDriver) {
    return (
      <div className="max-w-lg mx-auto my-6 space-y-6 animate-fadeIn px-4">
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                  108 Unit Onboarding
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Google Verified</span>
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Register 108 Ambulance Unit
              </h2>
              <p className="text-xs text-slate-500">
                Enter your driver details. A unique Driver ID will be attached and saved to the backend.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterDriver} className="space-y-4 text-xs">
            {/* Driver Name */}
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Driver Full Name
              </label>
              <input
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                placeholder="e.g. Rajesh Kumar Yadav"
                className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none font-medium"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Driver Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={onboardingPhone}
                  onChange={(e) => setOnboardingPhone(e.target.value)}
                  placeholder="e.g. +91-98188-72619"
                  className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Ambulance Vehicle Registration Number
              </label>
              <div className="relative">
                <Ambulance className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={onboardingVehicle}
                  onChange={(e) => setOnboardingVehicle(e.target.value)}
                  placeholder="e.g. DL-01-AMB-402"
                  className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none font-mono font-bold uppercase"
                  required
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1.5 text-[11px]">
                Ambulance Equipment Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Advanced Cardiac Life Support (ACLS)',
                  'Basic Life Support (BLS)',
                  'Trauma Mobile ICU',
                  'Patient Transport Ambulance (PTA)'
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOnboardingType(type)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition cursor-pointer text-[11px] ${
                      onboardingType === type
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {onboardingError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
                {onboardingError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isOnboardingSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 py-3 rounded-xl text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-amber-600/25"
              >
                {isOnboardingSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
                <span>{isOnboardingSubmitting ? 'Saving Driver Profile to Backend...' : 'Save Driver Details & Enter Cockpit'}</span>
              </button>
            </div>

            <div className="text-center text-[10px] font-mono text-slate-400">
              Authenticated as {currentUser.email} • Unique Driver ID will be attached automatically
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. IF LOGGED IN: Driver Cockpit with Patient ID prompt & Live Map Navigation
  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12 px-1 sm:px-2">
      {/* Driver Header Profile */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
            <Ambulance className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                {loggedDriver.driverId}
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {loggedDriver.driverName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Vehicle: {loggedDriver.vehicleNumber} • {loggedDriver.vehicleType}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={logoutDriver}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Patient ID Prompt Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Emergency Dispatch Prompt
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            Enter Patient ID to Head Straight to Hospital
          </h3>
          <p className="text-xs text-slate-500">
            Input the encrypted Patient ID assigned to this emergency mission. Opens turn-by-turn map directly to destination ER bay.
          </p>
        </div>

        <form onSubmit={handlePatientIdSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(sanitizeIdentifier(e.target.value))}
              placeholder="e.g. PAT-2026-4821 or AMB-7492"
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none font-mono text-sm uppercase font-bold"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-white" />
            <span>Open Route Map</span>
          </button>
        </form>

        {lookupNotice && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
            {lookupNotice}
          </div>
        )}

        {/* Available Dispatch Queue Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Dispatches:</span>
          {allBookings.length > 0 ? (
            allBookings.map((b) => (
              <button
                key={b.patientUniqueId}
                type="button"
                onClick={() => {
                  setPatientIdInput(b.patientUniqueId);
                  const linked = linkAmbulanceToBooking(b.patientUniqueId, loggedDriver);
                  if (linked) setSelectedMission(linked);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono px-3 py-1 rounded-xl text-xs border border-slate-200 transition cursor-pointer"
              >
                {b.patientUniqueId}
              </button>
            ))
          ) : (
            <span className="text-slate-400 italic text-[11px]">
              No pending emergency dispatches. New dispatches from citizen triage will appear here in real time.
            </span>
          )}
        </div>
      </div>

      {/* Direct Navigation Map & Transit Controls */}
      {selectedMission ? (
        <div className="space-y-6">
          {/* Destination ER Bay Header Pill */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-3xl p-6 shadow-xl shadow-red-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Destination Trauma Bay
              </span>
              <h3 className="text-2xl font-black">
                {selectedMission.hospitalName}
              </h3>
              <p className="text-xs text-white/80">
                {selectedMission.hospitalAddress} • Locked Bay: <strong className="text-amber-200">{selectedMission.reservedBay}</strong>
              </p>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-white text-red-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-slate-50 transition cursor-pointer shrink-0"
            >
              <Navigation className="w-4 h-4 text-red-600" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Paramedic Transit Status Control Buttons */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Update Ambulance Mission Status:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleStatusUpdate('AMBULANCE_EN_ROUTE_PICKUP')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${transitStatus === 'AMBULANCE_EN_ROUTE_PICKUP'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                1. En Route Pickup
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('PATIENT_PICKED_UP')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${transitStatus === 'PATIENT_PICKED_UP'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                2. Patient Picked Up
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('IN_TRANSIT_TO_HOSPITAL')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${transitStatus === 'IN_TRANSIT_TO_HOSPITAL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                3. En Route to ER Bay
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('ARRIVED_ER')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${transitStatus === 'ARRIVED_ER'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                4. Arrived at Hospital ER
              </button>
            </div>
          </div>

          {/* Direct Navigation Action Card */}
          <LiveRouteMap
            isDriverView={true}
            patientId={selectedMission.patientUniqueId}
            origin={{
              lat: selectedMission.patientPickupCoords.lat,
              lng: selectedMission.patientPickupCoords.lng,
              address: selectedMission.patientPickupCoords.address,
            }}
            destination={{
              lat: selectedMission.hospitalCoords.lat,
              lng: selectedMission.hospitalCoords.lng,
              name: selectedMission.hospitalName,
              address: selectedMission.hospitalAddress,
              bay: selectedMission.reservedBay,
            }}
            initialEtaMins={selectedMission.ambulanceDetails.currentEtaMins}
            initialDistanceKm={selectedMission.ambulanceDetails.distanceRemainingKm}
            speedKmh={selectedMission.ambulanceDetails.currentSpeedKmh}
            vehicleNumber={loggedDriver.vehicleNumber}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <Navigation className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-slate-700 font-bold text-sm">No Active Mission Selected</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter a Patient ID above or select one of the active dispatches to view turn-by-turn routing straight to the destination hospital.
          </p>
        </div>
      )}
    </div>
  );
};
