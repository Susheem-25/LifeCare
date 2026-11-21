import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  Ambulance, 
  Search, 
  Navigation, 
  ExternalLink, 
  Lock, 
  LogOut, 
  ArrowRight
} from 'lucide-react';
import { SAMPLE_DRIVERS } from '../../data/mockData';
import { LiveRouteMap } from '../common/LiveRouteMap';
import { getGoogleMapsNavigationUrl } from '../../services/sarvamAiService';

export const DriverPortal: React.FC = () => {
  const {
    loggedDriver,
    loginDriver,
    logoutDriver,
    activeBooking,
    allBookings,
    linkAmbulanceToBooking,
    updateAmbulanceStatus
  } = useEmergency();

  // Login credentials state
  const [driverIdInput, setDriverIdInput] = useState<string>('DRV-101');
  const [driverPinInput, setDriverPinInput] = useState<string>('1234');
  const [loginError, setLoginError] = useState<string>('');

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

  // Handle Driver Authentication
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginDriver(driverIdInput, driverPinInput);
    if (!success) {
      setLoginError('Invalid Driver ID or PIN. Try DRV-101 with PIN 1234.');
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

  // 1. IF NOT LOGGED IN: Driver Login Screen
  if (!loggedDriver) {
    return (
      <div className="max-w-md mx-auto my-8 space-y-6 animate-fadeIn px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Ambulance className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              108 Paramedic Driver Login
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              National 108 Emergency Network. Authenticate with your Driver Badge ID to receive emergency patient dispatches.
            </p>
          </div>

          <form onSubmit={handleDriverLogin} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase text-slate-600 font-bold mb-1 text-[11px]">
                Driver Unique ID
              </label>
              <div className="relative">
                <Ambulance className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={driverIdInput}
                  onChange={(e) => setDriverIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DRV-101"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none font-mono font-bold uppercase"
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
                  placeholder="••••"
                  className="w-full bg-white text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none font-mono"
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
              className="bg-amber-600 hover:bg-amber-700 w-full py-3 rounded-xl text-white font-bold text-xs tracking-tight transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-amber-600/25"
            >
              <span>Login as Driver</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase text-center block">
              1-Click Demo Driver Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {SAMPLE_DRIVERS.map((d) => (
                <button
                  key={d.driverId}
                  type="button"
                  onClick={() => {
                    setDriverIdInput(d.driverId);
                    setDriverPinInput(d.pin);
                    loginDriver(d.driverId, d.pin);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 text-left transition cursor-pointer"
                >
                  <div className="font-mono font-bold text-amber-700 text-[11px]">{d.driverId}</div>
                  <div className="text-[10px] text-slate-500 truncate">{d.driverName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. IF LOGGED IN: Driver Cockpit with Patient ID prompt & Live Map Navigation
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12 px-4">
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

        <button
          type="button"
          onClick={logoutDriver}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
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
              onChange={(e) => setPatientIdInput(e.target.value.toUpperCase())}
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
          {(allBookings.length > 0 ? allBookings : [{ patientUniqueId: 'PAT-2026-8941' }]).map((b) => (
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
          ))}
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
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${
                  transitStatus === 'AMBULANCE_EN_ROUTE_PICKUP'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1. En Route Pickup
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('PATIENT_PICKED_UP')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${
                  transitStatus === 'PATIENT_PICKED_UP'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                2. Patient Picked Up
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('IN_TRANSIT_TO_HOSPITAL')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${
                  transitStatus === 'IN_TRANSIT_TO_HOSPITAL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                3. En Route to ER Bay
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate('ARRIVED_ER')}
                className={`p-2.5 rounded-xl font-bold transition border cursor-pointer ${
                  transitStatus === 'ARRIVED_ER'
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
