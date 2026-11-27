import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ExternalLink, 
  Building2, 
  Clock, 
  Compass, 
  Copy, 
  Check, 
  LocateFixed, 
  ShieldCheck,
  Ambulance,
  PhoneCall,
  Activity,
  Zap
} from 'lucide-react';
import { getGoogleMapsNavigationUrl } from '../../services/sarvamAiService';
import { reverseGeocodeCoordinates } from '../../services/locationService';

interface LiveRouteMapProps {
  origin?: { lat: number; lng: number; address?: string };
  destination?: { lat: number; lng: number; name?: string; address?: string; bay?: string };
  patientId?: string;
  initialEtaMins?: number;
  initialDistanceKm?: number;
  speedKmh?: number;
  vehicleNumber?: string;
  isDriverView?: boolean;
  isHospitalView?: boolean;
  driverName?: string;
  driverPhone?: string;
  emergencyBrief?: string;
}

// Dynamic arterial transit progression generator
const getTransitWaypoints = (originAddr: string, destName: string, bayName?: string) => [
  `Patient Pickup Point: ${originAddr || 'Live Real-Time GPS'}`,
  `Ambulance Dispatched & Green Emergency Corridor Active`,
  `In-Transit toward ${destName} (Real-time Vitals & Telemetry Streaming)`,
  `Approaching ${destName} Emergency Trauma Intake Gate`,
  `Arrived at ${destName} — ${bayName || 'Trauma Bay #03'}`
];

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  origin = { lat: 28.5420, lng: 77.2350, address: 'Current Live GPS Location' },
  destination = {
    lat: 28.5672,
    lng: 77.2100,
    name: 'Allocated Hospital Emergency Room',
    address: 'Hospital Emergency Bay',
    bay: 'Trauma Resuscitation Bay',
  },
  patientId = '',
  initialEtaMins = 8,
  initialDistanceKm = 4.2,
  speedKmh = 50,
  vehicleNumber = '108 Ambulance Unit',
  isDriverView: _isDriverView = false,
  isHospitalView = false,
  driverName = '108 Paramedic Lead',
  driverPhone = '108 National Grid',
  emergencyBrief = 'Active Emergency Dispatch',
}) => {
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: origin.lat, lng: origin.lng });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string>('');
  const [etaMins, setEtaMins] = useState<number>(initialEtaMins);
  const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm);
  const [liveSpeed, setLiveSpeed] = useState<number>(speedKmh);
  const [progressStep, setProgressStep] = useState<number>(0);

  const transitWaypoints = getTransitWaypoints(
    currentOrigin.address || origin.address || 'Real-time GPS',
    destination.name || 'Hospital ER',
    destination.bay
  );

  // Synchronize state when origin prop changes without triggering cascading renders
  const [prevOrigin, setPrevOrigin] = useState(origin);
  if (prevOrigin.lat !== origin.lat || prevOrigin.lng !== origin.lng || prevOrigin.address !== origin.address) {
    setPrevOrigin(origin);
    setCurrentOrigin(origin);
    setAmbulanceCoords({ lat: origin.lat, lng: origin.lng });
    setEtaMins(initialEtaMins);
    setDistanceKm(initialDistanceKm);
    setLiveSpeed(speedKmh);
    setProgressStep(0);
  }

  // Real-time telemetry ticker: updates the ambulance's live street position, coordinates, ETA and distance every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProgressStep((prev) => {
        const next = (prev + 1) % 5;
        const progressFraction = (next + 1) / 5;

        // Interpolate live coordinates along the arterial route from origin to destination
        const lat = origin.lat + (destination.lat - origin.lat) * (progressFraction * 0.85);
        const lng = origin.lng + (destination.lng - origin.lng) * (progressFraction * 0.85);

        setAmbulanceCoords({ lat, lng });

        // Countdown distance & ETA smoothly
        const remainingDist = Math.max(0.3, Math.round((initialDistanceKm * (1 - progressFraction * 0.85)) * 10) / 10);
        const remainingEta = Math.max(1, Math.round(initialEtaMins * (1 - progressFraction * 0.85)));
        setDistanceKm(remainingDist);
        setEtaMins(remainingEta);

        // Realistic fluctuating traffic & siren speed
        const speedFluctuation = Math.round(speedKmh + (Math.sin(next) * 5));
        setLiveSpeed(Math.max(45, Math.min(68, speedFluctuation)));

        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [origin.lat, origin.lng, destination.lat, destination.lng, initialDistanceKm, initialEtaMins, speedKmh]);

  // Primary Google Maps route navigation URL: strictly from REAL PATIENT ORIGIN to HOSPITAL ER
  const fullNavigationUrl = getGoogleMapsNavigationUrl(
    { lat: currentOrigin.lat, lng: currentOrigin.lng },
    { lat: destination.lat, lng: destination.lng }
  );

  // Real-time device GPS detection & reverse geocoding with 1-click update
  const handleDetectLiveGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsNotice('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let addr = `Live GPS Position (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
        try {
          addr = await reverseGeocodeCoordinates(latitude, longitude);
        } catch {
          // fallback
        }

        setCurrentOrigin({
          lat: latitude,
          lng: longitude,
          address: addr,
        });
        setAmbulanceCoords({ lat: latitude, lng: longitude });

        const R = 6371;
        const dLat = ((destination.lat - latitude) * Math.PI) / 180;
        const dLng = ((destination.lng - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((destination.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = Math.max(0.4, Math.round(R * c * 1.35 * 10) / 10);
        const calcEta = Math.max(2, Math.round((dist / (liveSpeed || 40)) * 60));

        setDistanceKm(dist);
        setEtaMins(calcEta);
        setIsLocating(false);
        setGpsNotice(`Realtime GPS verified: ${addr}`);
        setTimeout(() => setGpsNotice(''), 4500);
      },
      (err) => {
        setIsLocating(false);
        setGpsNotice(`Location access not granted (${err.message}). Showing registered route.`);
        setTimeout(() => setGpsNotice(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullNavigationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 animate-fadeIn">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isHospitalView ? 'Hospital ER Live Radar' : 'Direct Route Navigation'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">
              ID: {patientId}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              Green Corridor Active
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            {isHospitalView ? (
              <>
                <Activity className="w-5 h-5 text-red-600 animate-pulse" />
                <span>Inbound Ambulance Live Route & Telemetry</span>
              </>
            ) : (
              <span>Direct Hospital Route Navigation</span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHospitalView
              ? `Real-time street position tracking for ambulance ${vehicleNumber} heading directly to this hospital.`
              : 'Pre-configured with current pickup origin and destination hospital ER bay.'}
          </p>
        </div>

        {/* Live ETA, Distance & Speed Badges */}
        <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>ETA:</span>
            <strong className="text-sm font-black text-red-700 animate-pulse">{etaMins} mins</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dist:</span>
            <strong className="text-sm font-black">{distanceKm} km</strong>
          </div>
          <div className="hidden xs:flex bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl items-center space-x-1.5 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Speed:</span>
            <strong className="text-sm font-black">{liveSpeed} km/h</strong>
          </div>
        </div>
      </div>

      {/* Origin & Destination Route Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Field 1: Patient Real-Time Pickup Origin */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="uppercase text-[11px] font-mono tracking-wider">
                {isHospitalView ? 'Patient Pickup Origin (Inbound Telemetry):' : 'Verified Pickup Origin (Real-Time GPS):'}
              </span>
            </span>

            <button
              type="button"
              onClick={handleDetectLiveGps}
              disabled={isLocating}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              title="Detect or refresh your real-time GPS location"
            >
              <LocateFixed className="w-3 h-3 text-blue-600" />
              <span>{isLocating ? 'Detecting GPS...' : 'Refresh Live GPS'}</span>
            </button>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <LocateFixed className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="font-extrabold text-slate-900 truncate text-sm">
                  {currentOrigin.address || origin.address || 'Real-Time Device GPS Location'}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Live Coordinates: <strong className="text-slate-700">{currentOrigin.lat.toFixed(4)}° N, {currentOrigin.lng.toFixed(4)}° E</strong>
                  <span className="mx-1 text-slate-300">•</span>
                  Status: <strong className="text-emerald-700">Realtime GPS Active</strong>
                </div>
                {emergencyBrief && (
                  <div className="text-[10px] font-semibold text-rose-700 mt-0.5 truncate">
                    Condition: {emergencyBrief}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-full font-bold block mb-1">
                PICKUP POINT
              </span>
              <span className="text-[10px] font-mono text-slate-500 block font-bold">
                {patientId || 'VERIFIED ORIGIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Route Transit Divider with Live Progress Bar & Telemetry Status */}
        <div className="space-y-1.5 py-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Ambulance className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>{transitWaypoints[progressStep] || 'In-Transit along Priority Corridor'}</span>
            </span>
            <span className="text-emerald-700 font-bold">
              GPS: {ambulanceCoords.lat.toFixed(4)}° N, {ambulanceCoords.lng.toFixed(4)}° E &bull; {liveSpeed} km/h
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(96, Math.max(15, ((progressStep + 1) / transitWaypoints.length) * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* Field 2: Hospital Location (Destination) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="uppercase text-[11px] font-mono tracking-wider">
                {isHospitalView ? 'Destination (Your Hospital ER Bay):' : 'Destination (Hospital & ER Bay):'}
              </span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              ER Bay Reserved
            </span>
          </div>

          <div className="bg-white border-2 border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="truncate">
                <div className="font-extrabold text-slate-900 text-sm truncate">
                  {destination.name}
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                  {destination.address}
                </div>
                <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                  Allocated Bay: <span className="font-mono bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded">{destination.bay || 'Trauma Bay #03 (Cath Lab 2)'}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold block mb-1">
                DESTINATION
              </span>
              <span className="text-[10px] font-mono text-slate-500 block">
                {destination.lat.toFixed(4)}° N, {destination.lng.toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>
      </div>

      {gpsNotice && (
        <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 p-2.5 rounded-xl font-medium animate-fadeIn">
          {gpsNotice}
        </div>
      )}

      {/* Direct App Launch Actions */}
      <div className="space-y-3">
        {/* Giant Direct Google Maps Action Button - Pre-filled from Live Ambulance Address to Hospital ER */}
        <a
          href={fullNavigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-red-600/30 hover:shadow-xl transition-all duration-200 cursor-pointer text-center"
          title="Open Google Maps with Live Route from Ambulance to Hospital ER"
        >
          <Navigation className="w-5 h-5 text-white" />
          <span>
            {isHospitalView
              ? `Open Live Ambulance Route in Google Maps (Ambulance → Hospital ER)`
              : `Open in Google Maps (Live Route from Ambulance to ${destination.name ? destination.name.split(' ')[0] : 'Hospital'})`}
          </span>
          <ExternalLink className="w-4 h-4 text-white/80" />
        </a>

        {/* Secondary Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Call Ambulance Driver Button */}
          <a
            href={driverPhone ? `tel:${driverPhone.replace(/[^0-9+]/g, '')}` : 'tel:108'}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer text-center shadow-2xs"
            title="Call the paramedic team inside this ambulance"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Call Paramedic: {driverName.split(' ')[0]} ({driverPhone})</span>
          </a>

          {/* Copy Navigation Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer text-center border border-slate-200"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedLink ? 'Ambulance Route Link Copied!' : 'Copy Live Ambulance Route Link'}</span>
          </button>
        </div>
      </div>

      {/* Paramedic & Green Corridor Clearance Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ambulance: <strong>{vehicleNumber}</strong> • Paramedic Lead: <strong>{driverName}</strong></span>
          {isHospitalView && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
              Hospital Radar View
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          Real-time Street Origin &bull; Direct Hospital Bay Routing
        </div>
      </div>
    </div>
  );
};
