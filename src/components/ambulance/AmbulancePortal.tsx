import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { SAMPLE_ABHA_PROFILES } from '../../data/mockData';
import {
  Ambulance,
  Navigation,
  ExternalLink,
  Clock,
  User,
  CheckCircle2,
  Radio,
  ArrowRight,
  Search,
  ShieldCheck,
  AlertTriangle,
  Droplet,
  CreditCard,
  Lock,
  LogOut
} from 'lucide-react';

export const AmbulancePortal: React.FC = () => {
  const {
    activeBooking,
    allBookings,
    loggedDriver,
    loginDriver,
    logoutDriver,
    linkAmbulanceToBooking,
    updateAmbulanceStatus,
    submitInTransitPaperwork,
    fetchPatientByAbha
  } = useEmergency();

  // Driver Login credentials state
  const [driverIdInput, setDriverIdInput] = useState<string>('DRV-101');
  const [driverPinInput, setDriverPinInput] = useState<string>('1234');
  const [driverLoginError, setDriverLoginError] = useState<string>('');

  // Lookup state
  const [codeInput, setCodeInput] = useState<string>(activeBooking?.bookingCode || '');
  const [selectedBooking, setSelectedBooking] = useState(activeBooking);
  const [tripStatus, setTripStatus] = useState<string>(activeBooking?.status || 'IN_TRANSIT_TO_HOSPITAL');

  // In-Ambulance ABHA Paperwork State (Step 4 of LifeCare)
  const currentAbha = selectedBooking?.inTransitPaperwork?.abhaDetails || SAMPLE_ABHA_PROFILES[0];
  const [ambAbhaInput, setAmbAbhaInput] = useState<string>(currentAbha?.abhaId || '91-4820-9182-3921');
  const [ambAbhaProfile, setAmbAbhaProfile] = useState(currentAbha);
  const [digitalConsent, setDigitalConsent] = useState<boolean>(true);
  const [paperworkSaved, setPaperworkSaved] = useState<boolean>(selectedBooking?.inTransitPaperwork?.isSubmitted ?? true);
  const [paperworkSuccessMsg, setPaperworkSuccessMsg] = useState<string>('');
  const [statusFeedbackMsg, setStatusFeedbackMsg] = useState<string>('');

  // Keep Ambulance Portal in sync whenever a new emergency booking is made
  useEffect(() => {
    if (activeBooking && activeBooking.bookingCode) {
      // oxlint-disable-next-line react/set-state-in-effect
      setSelectedBooking(activeBooking);
      setCodeInput(activeBooking.bookingCode);
      setTripStatus(activeBooking.status);
      const ab = activeBooking.inTransitPaperwork?.abhaDetails;
      if (ab) {
        setAmbAbhaProfile(ab);
        setAmbAbhaInput(ab.abhaId);
      }
    } else if (allBookings.length > 0) {
      const first = allBookings[0];
      setSelectedBooking(first);
      setCodeInput(first.bookingCode);
      setTripStatus(first.status);
    } else {
      setSelectedBooking(null);
      setCodeInput('');
    }
  }, [activeBooking, allBookings]);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = codeInput.trim().toUpperCase();
    if (!clean) return;

    const linked = linkAmbulanceToBooking(clean, loggedDriver || undefined);
    if (linked) {
      setSelectedBooking(linked);
      setTripStatus(linked.status);
      if (linked.inTransitPaperwork?.abhaDetails) {
        setAmbAbhaProfile(linked.inTransitPaperwork.abhaDetails);
        setAmbAbhaInput(linked.inTransitPaperwork.abhaDetails.abhaId);
      }
      setStatusFeedbackMsg(`Linked mission ${clean} with Patient ID ${linked.patientUniqueId}!`);
      setTimeout(() => setStatusFeedbackMsg(''), 3500);
    } else {
      setStatusFeedbackMsg(`Mission "${clean}" not found.`);
      setTimeout(() => setStatusFeedbackMsg(''), 3500);
    }
  };

  const handleStatusChange = (status: 'AMBULANCE_EN_ROUTE_PICKUP' | 'PATIENT_PICKED_UP' | 'IN_TRANSIT_TO_HOSPITAL' | 'ARRIVED_ER') => {
    if (!selectedBooking) return;
    setTripStatus(status);
    updateAmbulanceStatus(selectedBooking.bookingCode, status);

    const labels: Record<string, string> = {
      AMBULANCE_EN_ROUTE_PICKUP: 'En Route to Pickup',
      PATIENT_PICKED_UP: 'Patient Picked Up & Onboard',
      IN_TRANSIT_TO_HOSPITAL: 'En Route to ER Bay',
      ARRIVED_ER: 'Arrived at Hospital ER Bay'
    };
    setStatusFeedbackMsg(`Status: ${labels[status]} • Hospital ER notified!`);
    setTimeout(() => setStatusFeedbackMsg(''), 3500);
  };

  const handleAmbAbhaLookup = () => {
    const found = fetchPatientByAbha(ambAbhaInput.trim());
    if (found) {
      setAmbAbhaProfile(found);
      setPaperworkSaved(false);
    }
  };

  const handleSavePaperwork = () => {
    if (!ambAbhaProfile || !selectedBooking) return;
    submitInTransitPaperwork(
      selectedBooking.bookingCode,
      ambAbhaProfile,
      {
        heartRate: 112,
        spO2: 92,
        bloodPressureSys: 154,
        bloodPressureDia: 94,
        respiratoryRate: 22,
        temperatureF: 98.6,
        gcsScore: 15,
        recordedAt: new Date().toISOString(),
      },
      digitalConsent
    );
    setPaperworkSaved(true);
    setPaperworkSuccessMsg('ABHA Records & PM-JAY Cashless verified in transit! Hospital ER bay notified for 0-second reception bypass.');
    setTimeout(() => setPaperworkSuccessMsg(''), 4500);
  };

  // Build exact Google Maps navigation URL
  const originLat = selectedBooking?.patientPickupCoords?.lat || 28.5500;
  const originLng = selectedBooking?.patientPickupCoords?.lng || 77.2200;
  const destLat = selectedBooking?.hospitalCoords?.lat || 28.5672;
  const destLng = selectedBooking?.hospitalCoords?.lng || 77.2100;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

  // If driver is not authenticated, show Driver Login screen
  if (!loggedDriver) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-2xs">
              <Ambulance className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Paramedic Cockpit Login
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              108 Emergency Network interface for paramedics. Access locked hospital bays and in-transit patient pre-admission.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDriverLoginError('');
              const success = loginDriver(driverIdInput, driverPinInput);
              if (!success) {
                setDriverLoginError('Invalid Driver ID or PIN. Try DRV-101 with PIN 1234.');
              }
            }}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Driver Badge ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={driverIdInput}
                  onChange={(e) => setDriverIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DRV-101"
                  className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none uppercase font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={driverPinInput}
                  onChange={(e) => setDriverPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {driverLoginError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {driverLoginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-tight transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Login to Paramedic Cockpit</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Demo Paramedic Credentials:</span>
            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
              Badge: <span className="text-red-700">DRV-101</span> • PIN: <span className="text-red-700">1234</span> (Ambulance Unit DL-01-AMB-402)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 shadow-2xs">
            <Ambulance className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-red-700 font-bold">
                Paramedic Cockpit • 108 Emergency Network
              </span>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                Unit #{loggedDriver.vehicleNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Paramedic: {loggedDriver.driverName}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Badge: <strong className="font-mono text-slate-800">{loggedDriver.driverId}</strong></span>
              <span>•</span>
              <span>Vehicle: {loggedDriver.vehicleType}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Connected to 108 Grid</span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>108 Network Active</span>
          </span>

          <button
            onClick={logoutDriver}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 transition cursor-pointer font-bold text-xs"
            title="Logout of Paramedic Cockpit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusFeedbackMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusFeedbackMsg}</span>
        </div>
      )}

      {/* Lookup Code Bar if not selected */}
      {!selectedBooking && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
          <label className="block text-xs uppercase tracking-wider text-slate-600 font-bold">
            Enter Driver Dispatch Code
          </label>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. AMB-7492"
                className="w-full bg-white text-slate-900 font-mono text-sm tracking-wider pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none uppercase font-bold"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Load Mission</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Active Mission Cockpit */}
      {selectedBooking && (
        <div className="space-y-4 animate-fadeIn">
          {/* Mission Header Banner */}
          <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <div>
                <div className="font-bold text-sm tracking-tight">
                  Mission Active: Destination ER Bay Locked (&lt;9ms)
                </div>
                <div className="text-emerald-100 text-[11px] font-mono mt-0.5">
                  Patient Unique ID: <strong className="text-white underline">{selectedBooking.patientUniqueId}</strong> • Driver Code: <strong className="text-white">{selectedBooking.bookingCode}</strong>
                </div>
              </div>
            </div>

            <span className="bg-white/20 text-white font-mono px-3 py-1 rounded-full text-xs font-bold">
              0% Gate Rejection Guaranteed
            </span>
          </div>

          {/* Mission Routing & Destination */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs uppercase text-emerald-700 font-bold tracking-wider">
                  Target Destination ER Bay
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {selectedBooking.hospitalName}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>Bay: <strong className="text-emerald-700 font-bold">{selectedBooking.reservedBay}</strong></span>
                  <span>•</span>
                  <span>On-Duty Specialist: <strong className="text-slate-800">{selectedBooking.assignedDoctor.name}</strong></span>
                  <span>•</span>
                  <span>Address: {selectedBooking.hospitalAddress}</span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-2xl text-center shrink-0">
                <div className="text-[10px] uppercase text-slate-500 font-bold font-mono">Estimated ETA</div>
                <div className="text-xl font-mono font-extrabold text-red-600">{selectedBooking.ambulanceDetails.currentEtaMins} Mins</div>
              </div>
            </div>

            {/* Launch Turn-by-Turn Google Maps Navigation */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-white fill-white" />
              <span>Launch Turn-by-Turn GPS Navigation in Google Maps</span>
              <ExternalLink className="w-4 h-4 ml-1 text-white/80" />
            </a>
          </div>

          {/* 4 Mission Milestones Status Switcher */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="text-xs uppercase text-slate-600 font-extrabold font-mono">
              Update Emergency Mission Milestone:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleStatusChange('AMBULANCE_EN_ROUTE_PICKUP')}
                className={`p-3 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                  tripStatus === 'AMBULANCE_EN_ROUTE_PICKUP'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>1. En Route Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('PATIENT_PICKED_UP')}
                className={`p-3 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                  tripStatus === 'PATIENT_PICKED_UP'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>2. Patient Onboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('IN_TRANSIT_TO_HOSPITAL')}
                className={`p-3 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                  tripStatus === 'IN_TRANSIT_TO_HOSPITAL'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>3. In Transit to ER</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('ARRIVED_ER')}
                className={`p-3 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                  tripStatus === 'ARRIVED_ER'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4. Arrived at ER Bay</span>
              </button>
            </div>
          </div>

          {/* Step 4: In-Transit ABDM Pre-Admission & PM-JAY Clearance */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
                      Step 4: In-Transit ABDM Pre-Admission
                    </span>
                    <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold">
                      ABDM v3 Sandbox
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                    ABHA Health Records & PM-JAY ₹5L Cashless Clearance
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {paperworkSaved ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    ✓ ER Pre-Admission Transmitted
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    Pending ER Transmission
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  Intake: 30m &rarr; 0s
                </span>
              </div>
            </div>

            {/* Quick ABHA ID Lookup */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                value={ambAbhaInput}
                onChange={(e) => setAmbAbhaInput(e.target.value)}
                placeholder="Enter ABHA ID (e.g. 91-4820-9182-3921)"
                className="flex-1 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAmbAbhaLookup}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer transition"
              >
                Fetch ABHA Records
              </button>
            </div>

            {paperworkSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{paperworkSuccessMsg}</span>
              </div>
            )}

            {/* ABHA Profile Display */}
            {ambAbhaProfile && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                      UID
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm font-mono">
                        Record ID: {ambAbhaProfile.uniqueRecordId || 'UID-MED-3921'}
                      </div>
                      <div className="text-slate-500 font-mono text-xs">
                        ABHA: <strong>{ambAbhaProfile.abhaId}</strong> • <span className="text-emerald-700 font-semibold">Zero PII (Breach Protected)</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                    ✓ ABDM Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Blood Group</span>
                    <strong className="text-red-600 font-bold text-sm flex items-center gap-1 mt-0.5">
                      <Droplet className="w-3.5 h-3.5 text-red-500" />
                      {ambAbhaProfile.bloodGroup}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Contraindicated Allergies</span>
                    <strong className="text-amber-700 font-bold text-xs flex items-center gap-1 mt-0.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {ambAbhaProfile.knownAllergies[0] || 'No known allergies'}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Cashless Cover</span>
                    <strong className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-0.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      PM-JAY ₹5,00,000 (Eligible)
                    </strong>
                  </div>
                </div>

                {/* Digital Consent & Confirm Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={digitalConsent}
                      onChange={(e) => setDigitalConsent(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Digital Patient Consent Signed for 0-Second Reception Admission</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSavePaperwork}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 self-end sm:self-auto"
                  >
                    <span>Transmit Pre-Admission to ER</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
