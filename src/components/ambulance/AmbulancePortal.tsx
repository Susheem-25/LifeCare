import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { SAMPLE_ABHA_PROFILES } from '../../data/mockData';
import type { PatientVitals } from '../../types';
import { ArduinoUnoQMonitor } from './ArduinoUnoQMonitor';
import {
  Ambulance,
  MapPin,
  Navigation,
  ExternalLink,
  Building2,
  Clock,
  PhoneCall,
  User,
  CheckCircle2,
  Radio,
  ArrowRight,
  Search,
  Activity,
  Heart,
  Send,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Droplet,
  FileText,
  CreditCard,
  Lock,
  LogOut
} from 'lucide-react';
import { LiveGpsTracker } from '../common/LiveGpsTracker';

export const AmbulancePortal: React.FC = () => {
  const {
    activeBooking,
    allBookings,
    loggedDriver,
    loginDriver,
    logoutDriver,
    linkAmbulanceToBooking,
    updateAmbulanceStatus,
    updatePatientVitals,
    submitInTransitPaperwork,
    fetchPatientByAbha,
    bookHospitalBed,
    setCurrentView
  } = useEmergency();

  // Driver Login credentials state
  const [driverIdInput, setDriverIdInput] = useState<string>('DRV-101');
  const [driverPinInput, setDriverPinInput] = useState<string>('1234');
  const [driverLoginError, setDriverLoginError] = useState<string>('');

  // Lookup state
  const [codeInput, setCodeInput] = useState<string>(activeBooking?.bookingCode || '');
  const [selectedBooking, setSelectedBooking] = useState(activeBooking);
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(activeBooking));
  const [tripStatus, setTripStatus] = useState<string>(activeBooking?.status || 'IN_TRANSIT_TO_HOSPITAL');

  // In-Ambulance Live Vitals State
  const initialV = selectedBooking?.inTransitPaperwork?.initialVitals;
  const [heartRate, setHeartRate] = useState<number>(initialV?.heartRate || 112);
  const [spO2, setSpO2] = useState<number>(initialV?.spO2 || 92);
  const [bpSys, setBpSys] = useState<number>(initialV?.bloodPressureSys || 154);
  const [bpDia, setBpDia] = useState<number>(initialV?.bloodPressureDia || 94);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(initialV?.respiratoryRate || 24);
  const [gcsScore, setGcsScore] = useState<number>(initialV?.gcsScore || 15);
  const [oxygenSupport, setOxygenSupport] = useState<string>('6L Mask (High Flow)');
  const [lastVitalsSentAt, setLastVitalsSentAt] = useState<string>('Just now');
  const [vitalsSentSuccess, setVitalsSentSuccess] = useState<boolean>(false);

  // In-Ambulance ABHA Paperwork State
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
      const v = activeBooking.inTransitPaperwork?.initialVitals;
      if (v) {
        setHeartRate(v.heartRate);
        setSpO2(v.spO2);
        setBpSys(v.bloodPressureSys);
        setBpDia(v.bloodPressureDia);
        setRespiratoryRate(v.respiratoryRate);
        setGcsScore(v.gcsScore);
      }
      const ab = activeBooking.inTransitPaperwork?.abhaDetails;
      if (ab) {
        setAmbAbhaProfile(ab);
        setAmbAbhaInput(ab.abhaId);
      }
      setHasSearched(true);
    } else if (allBookings.length > 0) {
      const first = allBookings[0];
      setSelectedBooking(first);
      setCodeInput(first.bookingCode);
      setTripStatus(first.status);
      setHasSearched(true);
    } else {
      setSelectedBooking(null);
      setCodeInput('');
      setHasSearched(false);
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
      if (linked.inTransitPaperwork?.initialVitals) {
        setHeartRate(linked.inTransitPaperwork.initialVitals.heartRate);
        setSpO2(linked.inTransitPaperwork.initialVitals.spO2);
        setBpSys(linked.inTransitPaperwork.initialVitals.bloodPressureSys);
        setBpDia(linked.inTransitPaperwork.initialVitals.bloodPressureDia);
        setRespiratoryRate(linked.inTransitPaperwork.initialVitals.respiratoryRate);
        setGcsScore(linked.inTransitPaperwork.initialVitals.gcsScore);
      }
      if (linked.inTransitPaperwork?.abhaDetails) {
        setAmbAbhaProfile(linked.inTransitPaperwork.abhaDetails);
        setAmbAbhaInput(linked.inTransitPaperwork.abhaDetails.abhaId);
      }
      setHasSearched(true);
      setStatusFeedbackMsg(`Linked ticket ${clean} with Patient ID ${linked.patientUniqueId}! All consoles interlinked.`);
      setTimeout(() => setStatusFeedbackMsg(''), 3500);
    } else {
      setStatusFeedbackMsg(`Ticket "${clean}" not found.`);
      setTimeout(() => setStatusFeedbackMsg(''), 3500);
    }
  };

  const handleStatusChange = (status: 'AMBULANCE_EN_ROUTE_PICKUP' | 'PATIENT_PICKED_UP' | 'IN_TRANSIT_TO_HOSPITAL' | 'ARRIVED_ER') => {
    if (!selectedBooking) return;
    setTripStatus(status);
    updateAmbulanceStatus(selectedBooking.bookingCode, status);

    const labels: Record<string, string> = {
      AMBULANCE_EN_ROUTE_PICKUP: 'En Route Pickup',
      PATIENT_PICKED_UP: 'Patient Picked Up & Onboard',
      IN_TRANSIT_TO_HOSPITAL: 'En Route to ER Bay',
      ARRIVED_ER: 'Arrived at Hospital Bay'
    };
    setStatusFeedbackMsg(`Mission status: ${labels[status]} • Hospital ER notified!`);
    setTimeout(() => setStatusFeedbackMsg(''), 3500);
  };

  // Real-time live vital auto-sync to Hospital ER
  const handleLiveVitalUpdate = (update: Partial<PatientVitals>) => {
    if (update.heartRate !== undefined) setHeartRate(update.heartRate);
    if (update.spO2 !== undefined) setSpO2(update.spO2);
    if (update.bloodPressureSys !== undefined) setBpSys(update.bloodPressureSys);
    if (update.bloodPressureDia !== undefined) setBpDia(update.bloodPressureDia);
    if (update.respiratoryRate !== undefined) setRespiratoryRate(update.respiratoryRate);

    if (selectedBooking) {
      updatePatientVitals(selectedBooking.bookingCode, update);
    }
  };

  const handleTransmitVitals = () => {
    if (!selectedBooking) return;
    updatePatientVitals(selectedBooking.bookingCode, {
      heartRate,
      spO2,
      bloodPressureSys: bpSys,
      bloodPressureDia: bpDia,
      respiratoryRate,
      gcsScore,
      recordedAt: new Date().toISOString(),
    });

    const now = new Date();
    setLastVitalsSentAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    setVitalsSentSuccess(true);
    setTimeout(() => setVitalsSentSuccess(false), 3500);
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
        heartRate,
        spO2,
        bloodPressureSys: bpSys,
        bloodPressureDia: bpDia,
        respiratoryRate,
        temperatureF: 98.6,
        gcsScore,
        recordedAt: new Date().toISOString(),
      },
      digitalConsent
    );
    setPaperworkSaved(true);
    setPaperworkSuccessMsg('ABHA Records & Digital Consent verified! Hospital ER bay notified for zero-wait entry.');
    setTimeout(() => setPaperworkSuccessMsg(''), 4000);
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <Ambulance className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ambulance Driver Login
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Authorized login for ambulance drivers & paramedics. Enter Driver ID and PIN to access navigation and telemetry.
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
                  className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:outline-none uppercase font-mono"
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
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {driverLoginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-tight transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Authenticate & Access Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block text-center">
              Quick Test Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDriverIdInput('DRV-101');
                  setDriverPinInput('1234');
                  loginDriver('DRV-101', '1234');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">Rajesh Yadav</div>
                <div className="text-[10px] text-slate-500 font-mono">DRV-101 • Unit 402</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDriverIdInput('DRV-102');
                  setDriverPinInput('1234');
                  loginDriver('DRV-102', '1234');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">Amit Saxena</div>
                <div className="text-[10px] text-slate-500 font-mono">DRV-102 • Unit 508</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 shadow-xs">
            <Ambulance className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-red-700 font-bold">
                Ambulance Dispatch & Cockpit
              </span>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-semibold">
                Unit #{loggedDriver.vehicleNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Driver: {loggedDriver.driverName}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5">
              Badge: <strong className="font-mono text-slate-800">{loggedDriver.driverId}</strong> • Type: {loggedDriver.vehicleType}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Driver Online</span>
          </span>

          <button
            onClick={logoutDriver}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 transition cursor-pointer font-semibold text-xs ml-1"
            title="Logout of Driver Console"
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

      {/* Ambulance Booking Code Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="block text-xs uppercase tracking-wider text-slate-600 font-bold">
          Enter Ambulance Driver Booking Code
        </label>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. AMB-7492"
              className="w-full bg-white text-slate-900 font-mono text-sm tracking-wider pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-red-500 focus:outline-none uppercase"
            />
          </div>

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg text-white font-semibold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Get Directions to Hospital</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>

        {allBookings.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-500 font-medium mr-1">Quick Load:</span>
            {allBookings.map((b) => (
              <button
                key={b.bookingCode}
                type="button"
                onClick={() => {
                  linkAmbulanceToBooking(b.bookingCode, loggedDriver || undefined);
                  setCodeInput(b.bookingCode);
                  setSelectedBooking({ ...b, driverLoggedIn: true });
                  setTripStatus(b.status);
                  setHasSearched(true);
                  setStatusFeedbackMsg(`Driver logged in for ${b.bookingCode} • Live GPS active!`);
                  setTimeout(() => setStatusFeedbackMsg(''), 3000);
                }}
                className={`text-xs border px-2.5 py-1 rounded-lg cursor-pointer transition font-medium ${
                  selectedBooking?.bookingCode === b.bookingCode
                    ? 'bg-red-50 border-red-300 text-red-700 font-semibold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-slate-500">Ticket:</span> <strong className="text-red-600 font-mono">{b.bookingCode}</strong> ({b.hospitalName.split(' ')[0]})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* If No Active Booking is Selected (Zero Bookings State) */}
      {!selectedBooking ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <Ambulance className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              No Active Ambulance Mission Assigned
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unit DL-01-AMB-402 is currently on standby with zero active dispatches. You can initiate a new emergency reservation from the Emergency SOS page, or dispatch a test simulated mission below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentView('patient')}
              className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg text-white font-semibold text-xs tracking-tight transition cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-white" />
              <span>Go to Emergency SOS & Reserve Bed</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const demo = bookHospitalBed('hosp-aiims-delhi', 'Rahul Sharma', '+91-98104-55678');
                setSelectedBooking(demo);
                setCodeInput(demo.bookingCode);
                setTripStatus(demo.status);
                setHasSearched(true);
              }}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 transition cursor-pointer shadow-xs flex items-center gap-2"
            >
              <span>⚡ Simulate Emergency Dispatch (AMB Demo)</span>
            </button>
          </div>
        </div>
      ) : hasSearched && (
        <div className="space-y-5 animate-fadeIn">
          {/* Interlinked Status Banner */}
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <div>
                <div className="font-bold text-sm tracking-tight">
                  Consoles Interlinked: Live Telemetry Streaming
                </div>
                <div className="text-emerald-100 text-[11px] font-mono mt-0.5">
                  Patient Unique ID: <strong className="text-white underline">{selectedBooking.patientUniqueId}</strong> • Driver Code: <strong className="text-white">{selectedBooking.bookingCode}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="bg-emerald-700/80 border border-emerald-400/40 px-2 py-0.5 rounded text-[11px]">
                Hospital ER Bay Notified
              </span>
            </div>
          </div>

          {/* Live Animated GPS Tracker */}
          <LiveGpsTracker booking={selectedBooking} role="ambulance" />

          {/* THE BIG GOOGLE MAPS NAVIGATION LAUNCH BUTTON */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs uppercase text-emerald-700 font-bold tracking-wider">
                  Direct GPS Navigation
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Route to {selectedBooking.hospitalName}
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Patient ID: <strong className="text-slate-800 font-mono">{selectedBooking.patientUniqueId}</strong></span>
                  <span>•</span>
                  <span>Bay: <strong className="text-emerald-700 font-bold">{selectedBooking.reservedBay}</strong></span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center shrink-0">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Traffic ETA</div>
                <div className="text-xl font-mono font-bold text-red-600">{selectedBooking.ambulanceDetails.currentEtaMins} Mins</div>
              </div>
            </div>

            {/* Launch Google Maps Navigation Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 w-full py-3 px-5 rounded-xl text-white font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-white fill-white" />
              <span>Open in Google Maps for Live Turn-by-Turn Navigation</span>
              <ExternalLink className="w-4 h-4 ml-1 text-white/80" />
            </a>
          </div>

          {/* Pickup and Destination Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Patient Pickup Location */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 font-bold border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 text-red-600">
                  <MapPin className="w-3.5 h-3.5" />
                  1. Patient Pickup Origin
                </span>
                <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-semibold text-[10px]">PICKUP</span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {selectedBooking.patientPickupCoords.address}
                </div>
                <div className="text-slate-600 text-xs">
                  Patient Name: <strong className="text-slate-800">{selectedBooking.patientName}</strong>
                </div>
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-slate-400" />
                  <span>Contact: {selectedBooking.patientPhone}</span>
                </div>
              </div>

              <div className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-xs text-red-800">
                Condition: {selectedBooking.aiAnalysis.detectedCondition}
              </div>
            </div>

            {/* 2. Destination Hospital ER Bay */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 font-bold border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Building2 className="w-3.5 h-3.5" />
                  2. Destination Hospital ER
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold text-[10px]">LOCKED BAY</span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {selectedBooking.hospitalName}
                </div>
                <div className="text-slate-600 text-xs">
                  {selectedBooking.hospitalAddress}
                </div>
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-slate-400" />
                  <span>ER Hotline: {selectedBooking.hospitalPhone}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-medium">
                <span>Reserved Bay: <strong>{selectedBooking.reservedBay}</strong></span>
                <span>Dr. {selectedBooking.assignedDoctor.name.split(' ')[1]}</span>
              </div>
            </div>
          </div>

          {/* Mission Trip Progress Updates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="text-xs uppercase text-slate-600 font-bold">
              Update Ambulance Mission Status:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleStatusChange('AMBULANCE_EN_ROUTE_PICKUP')}
                className={`p-2.5 rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer font-medium ${tripStatus === 'AMBULANCE_EN_ROUTE_PICKUP'
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>En Route Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('PATIENT_PICKED_UP')}
                className={`p-2.5 rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer font-medium ${tripStatus === 'PATIENT_PICKED_UP'
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Onboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('IN_TRANSIT_TO_HOSPITAL')}
                className={`p-2.5 rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer font-medium ${tripStatus === 'IN_TRANSIT_TO_HOSPITAL'
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>En Route ER Bay</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('ARRIVED_ER')}
                className={`p-2.5 rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer font-medium ${tripStatus === 'ARRIVED_ER'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Arrived at Hospital</span>
              </button>
            </div>
          </div>

          {/* ARDUINO TRACK: UNOQ IOT HARDWARE TELEMETRY PANEL */}
          <ArduinoUnoQMonitor
            currentSpO2={spO2}
            currentHeartRate={heartRate}
            onSyncVitalsFromArduino={(newSpO2, newHr) => {
              handleLiveVitalUpdate({ spO2: newSpO2, heartRate: newHr });
            }}
          />

          {/* IN-CABIN LIVE TELEMETRY & VITALS TRANSMISSION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-red-700 font-bold">
                      Paramedic Vitals Entry & ER Sync
                    </span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>2-Way ER Sync Active</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                    Transmit Patient Vitals to Hospital ER
                  </h3>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="text-slate-400 text-[11px]">Last Transmitted:</div>
                <div className="text-slate-800 font-mono font-bold">{lastVitalsSentAt}</div>
              </div>
            </div>

            {/* Prototype Phase Clarification for Evaluators */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs flex items-start gap-2.5 text-amber-950">
              <span className="text-sm shrink-0 mt-0.5">💡</span>
              <div className="space-y-0.5">
                <div className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                  Prototype Telemetry Workflow Note (HackFront India):
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  In the current working prototype, in-transit paramedics manually update and adjust patient vitals using the steppers and sliders below, with instant 2-way real-time synchronization to the ER Cath Lab. Fully automated biomedical sensor streaming via Arduino UnoQ & hardware sensors is scheduled for <strong>Future Tracks</strong> (previewed in the hardware panel above).
                </p>
              </div>
            </div>

            {/* Interactive Vitals Sliders and Steppers (Live Auto-Sync) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Heart Rate */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase text-[10px] font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    Heart Rate
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ heartRate: Math.max(40, heartRate - 2) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >-</button>
                    <input
                      type="number"
                      min="40"
                      max="220"
                      value={heartRate}
                      onChange={(e) => handleLiveVitalUpdate({ heartRate: Number(e.target.value) })}
                      className="w-12 text-center text-lg font-extrabold text-rose-600 bg-transparent border-b border-rose-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ heartRate: Math.min(220, heartRate + 2) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >+</button>
                    <span className="text-xs text-slate-400">BPM</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={heartRate}
                  onChange={(e) => handleLiveVitalUpdate({ heartRate: Number(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50</span>
                  <span className="text-emerald-600 font-bold">100 (Normal)</span>
                  <span>180</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase text-[10px] font-bold flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    SpO2 Saturation
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ spO2: Math.max(60, spO2 - 1) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >-</button>
                    <input
                      type="number"
                      min="60"
                      max="100"
                      value={spO2}
                      onChange={(e) => handleLiveVitalUpdate({ spO2: Number(e.target.value) })}
                      className="w-10 text-center text-lg font-extrabold text-blue-600 bg-transparent border-b border-blue-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ spO2: Math.min(100, spO2 + 1) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >+</button>
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={spO2}
                  onChange={(e) => handleLiveVitalUpdate({ spO2: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px]">
                  <span className="text-rose-600 font-semibold">&lt;90 Hypoxic</span>
                  <span className="text-emerald-600 font-bold">95-100%</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Blood Pressure</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                    <input
                      type="number"
                      min="70"
                      max="240"
                      value={bpSys}
                      onChange={(e) => handleLiveVitalUpdate({ bloodPressureSys: Number(e.target.value) })}
                      className="w-10 text-center text-sm font-extrabold text-slate-900 bg-transparent border-b border-slate-300 focus:outline-none"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      min="40"
                      max="140"
                      value={bpDia}
                      onChange={(e) => handleLiveVitalUpdate({ bloodPressureDia: Number(e.target.value) })}
                      className="w-10 text-center text-sm font-extrabold text-slate-900 bg-transparent border-b border-slate-300 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="80"
                    max="220"
                    value={bpSys}
                    onChange={(e) => handleLiveVitalUpdate({ bloodPressureSys: Number(e.target.value) })}
                    className="w-1/2 accent-slate-700 cursor-pointer"
                    title="Systolic"
                  />
                  <input
                    type="range"
                    min="50"
                    max="130"
                    value={bpDia}
                    onChange={(e) => handleLiveVitalUpdate({ bloodPressureDia: Number(e.target.value) })}
                    className="w-1/2 accent-slate-500 cursor-pointer"
                    title="Diastolic"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Sys: {bpSys}</span>
                  <span>Dia: {bpDia}</span>
                </div>
              </div>

              {/* Respiratory Rate & GCS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Resp / GCS</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ respiratoryRate: Math.max(8, respiratoryRate - 1) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >-</button>
                    <span className="text-xs font-bold text-slate-900">{respiratoryRate}</span>
                    <button
                      type="button"
                      onClick={() => handleLiveVitalUpdate({ respiratoryRate: Math.min(45, respiratoryRate + 1) })}
                      className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 cursor-pointer font-bold"
                    >+</button>
                    <span className="text-[10px] text-slate-400">bpm</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={oxygenSupport}
                    onChange={(e) => setOxygenSupport(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-[11px] p-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Room Air">Room Air</option>
                    <option value="2L Nasal Cannula">2L Nasal Cannula</option>
                    <option value="6L Mask (High Flow)">6L Mask (High Flow)</option>
                    <option value="15L Non-Rebreather">15L Non-Rebreather</option>
                    <option value="BiPAP / Ventilator">BiPAP / Ventilator</option>
                  </select>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Support: {oxygenSupport}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">GCS:</span>
                    <select
                      value={gcsScore}
                      onChange={(e) => setGcsScore(Number(e.target.value))}
                      className="bg-white/90 border border-slate-300 rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      {[15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3].map((val) => (
                        <option key={val} value={val}>{val}/15</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Transmit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                Adjust sliders as patient condition changes. Changes update directly on the hospital ER screen.
              </div>

              <button
                type="button"
                onClick={handleTransmitVitals}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-semibold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Transmit Live Vitals to Hospital ER Bay</span>
              </button>
            </div>

            {vitalsSentSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 animate-fadeIn font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live vitals successfully transmitted to {selectedBooking.hospitalName} ({selectedBooking.reservedBay})!</span>
              </div>
            )}
          </div>

          {/* IN-CABIN ABHA PAPERWORK & PRE-REGISTRATION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
                      In-Cabin Family Paperwork Pre-Completion
                    </span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                      Zero-Wait Admission
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                    Verify ABHA & Submit Digital Admission Consent
                  </h3>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Bypasses reception desk queues upon hospital arrival
              </div>
            </div>

            {/* ABHA Input & Lookup for Ambulance Attendant */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={ambAbhaInput}
                    onChange={(e) => setAmbAbhaInput(e.target.value)}
                    placeholder="Enter Patient ABHA ID (e.g. 91-4820-9182-3921)"
                    className="w-full bg-white text-slate-900 font-mono text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAmbAbhaLookup}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify ABHA Record</span>
                </button>
              </div>

              {/* Verified ABHA Patient Card */}
              {ambAbhaProfile && (
                <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200 space-y-3 shadow-2xs animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-sm">
                        {ambAbhaProfile.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{ambAbhaProfile.fullName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>ABDM VERIFIED</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>ABHA: <strong className="text-slate-800">{ambAbhaProfile.abhaId}</strong></span>
                          <span>•</span>
                          <span>{ambAbhaProfile.age} Yrs, {ambAbhaProfile.gender}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-bold flex items-center gap-1 w-fit">
                      <Droplet className="w-3 h-3 text-rose-600" />
                      <span>Blood Group: {ambAbhaProfile.bloodGroup}</span>
                    </span>
                  </div>

                  {/* Medical Alerts & PM-JAY Cover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Critical Drug Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ambAbhaProfile.knownAllergies.map((allg, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                            ⚠️ {allg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Ayushman PM-JAY Cashless Cover</span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        ₹{(ambAbhaProfile.coverageAmountINR).toLocaleString('en-IN')} Cashless (100% Pre-Authorized)
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono truncate">
                        {ambAbhaProfile.insuranceProvider}
                      </div>
                    </div>
                  </div>

                  {/* Digital Informed Consent Checkbox */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={digitalConsent}
                        onChange={(e) => setDigitalConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Informed Emergency Digital Consent:</strong> Patient / Family consents to emergency resuscitation, imaging, and direct transfer into {selectedBooking.hospitalName}'s locked trauma bay upon arrival.
                      </div>
                    </label>
                  </div>

                  {/* Submit Pre-Admission Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-500 font-mono">
                      {paperworkSaved ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paperwork Verified & Pre-Admitted</span>
                        </span>
                      ) : (
                        <span>Click to attach this record directly to the hospital bay</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePaperwork}
                      disabled={!digitalConsent}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{paperworkSaved ? 'Re-Submit Updated Paperwork' : 'Submit In-Transit Admission Paperwork'}</span>
                    </button>
                  </div>

                  {paperworkSuccessMsg && (
                    <div className="text-xs text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2 animate-fadeIn font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{paperworkSuccessMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
