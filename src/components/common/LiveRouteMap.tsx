import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ExternalLink, 
  MapPin, 
  Building2, 
  Clock, 
  Compass, 
  Copy, 
  Check, 
  LocateFixed, 
  ShieldCheck,
  Ambulance
} from 'lucide-react';
import { getGoogleMapsNavigationUrl } from '../../services/sarvamAiService';

interface LiveRouteMapProps {
  origin?: { lat: number; lng: number; address?: string };
  destination?: { lat: number; lng: number; name?: string; address?: string; bay?: string };
  patientId?: string;
  initialEtaMins?: number;
  initialDistanceKm?: number;
  speedKmh?: number;
  vehicleNumber?: string;
  isDriverView?: boolean;
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  origin = { lat: 28.5420, lng: 77.2350, address: 'Greater Kailash Part 1, New Delhi' },
  destination = {
    lat: 28.5672,
    lng: 77.2100,
    name: 'AIIMS Apex Trauma Center',
    address: 'Ring Road, Safdarjung Enclave, New Delhi',
    bay: 'Trauma Bay #03',
  },
  patientId = 'PAT-2026-4821',
  initialEtaMins = 8,
  initialDistanceKm = 3.2,
  speedKmh = 54,
  vehicleNumber = 'DL-01-AMB-849',
  isDriverView = false,
}) => {
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string>('');
  const [etaMins, setEtaMins] = useState<number>(initialEtaMins);
  const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm);

  // Sync with prop if it updates
  useEffect(() => {
    setCurrentOrigin(origin);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, origin.address]);

  // Primary Google Maps navigation URL with pre-filled origin (current location) and destination (hospital)
  const fullNavigationUrl = getGoogleMapsNavigationUrl(
    { lat: currentOrigin.lat, lng: currentOrigin.lng },
    { lat: destination.lat, lng: destination.lng }
  );

  // Direct Device GPS URL (omits origin so Google Maps automatically uses the device's real-time live GPS)
  const deviceGpsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;

  // Detect live device GPS coordinates and calculate route from current location
  const handleDetectLiveGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsNotice('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentOrigin({
          lat: latitude,
          lng: longitude,
          address: `Current Live Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
        });

        // Calculate dynamic real-world driving distance and ETA from current GPS to destination hospital
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
        const calcEta = Math.max(2, Math.round((dist / (speedKmh || 40)) * 60));

        setDistanceKm(dist);
        setEtaMins(calcEta);
        setIsLiveGpsActive(true);
        setIsLocating(false);
        setGpsNotice('Live GPS detected! Hospital route set from your exact current location.');
        setTimeout(() => setGpsNotice(''), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGpsNotice(`Could not retrieve device location (${err.message}). Route set to default pickup location.`);
        setTimeout(() => setGpsNotice(''), 4500);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Always automatically ask for location access as soon as route card mounts
  useEffect(() => {
    handleDetectLiveGps();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.lat, destination.lng]);

  // Copy link to clipboard
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
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Direct Route Navigation
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              ID: {patientId}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Direct Hospital Route Navigation
          </h3>
          <p className="text-xs text-slate-500">
            Pre-configured with current pickup origin and destination hospital ER bay.
          </p>
        </div>

        {/* Quick ETA & Distance Badges */}
        <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>ETA:</span>
            <strong className="text-sm font-black">{etaMins} mins</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Distance:</span>
            <strong className="text-sm font-black">{distanceKm} km</strong>
          </div>
        </div>
      </div>

      {/* Origin & Destination Fields Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Field 1: Current Location (Origin) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="uppercase text-[11px] font-mono tracking-wider">Current Location (Origin):</span>
            </span>
            <button
              type="button"
              onClick={handleDetectLiveGps}
              disabled={isLocating}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <LocateFixed className="w-3 h-3 text-blue-600" />
              <span>{isLocating ? 'Detecting GPS...' : 'Use Device Live GPS'}</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">
                  {currentOrigin.address || 'Current Patient Location'}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Coordinates: {currentOrigin.lat.toFixed(4)}° N, {currentOrigin.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold shrink-0">
              PICKUP
            </span>
          </div>
        </div>

        {/* Route Transit Divider */}
        <div className="flex items-center space-x-3 text-xs text-slate-400 px-2 font-mono">
          <div className="h-px bg-slate-200 flex-1"></div>
          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-bold">
            <Ambulance className="w-3.5 h-3.5 text-red-600" />
            <span>Turn-by-turn driving route ({speedKmh} km/h)</span>
          </div>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* Field 2: Hospital Location (Destination) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="uppercase text-[11px] font-mono tracking-wider">Destination (Hospital & ER Bay):</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ER Bay Reserved
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Building2 className="w-4 h-4 text-red-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {destination.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {destination.address} • Reserved Bay: <strong className="text-emerald-700 font-mono">{destination.bay || 'Trauma Bay #03'}</strong>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Coordinates: {destination.lat.toFixed(4)}° N, {destination.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold shrink-0">
              HOSPITAL
            </span>
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
        {/* Giant Direct App Action Button */}
        <a
          href={fullNavigationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-red-600/30 hover:shadow-xl transition-all duration-200 cursor-pointer text-center"
        >
          <Navigation className="w-5 h-5 text-white" />
          <span>
            {isLiveGpsActive
              ? `Open Google Maps (Live Route from Current Location)`
              : `Open in Google Maps App (Route to ${(destination.name || 'Hospital').split(' ')[0]})`}
          </span>
          <ExternalLink className="w-4 h-4 text-white/80" />
        </a>

        {/* Secondary Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <a
            href={deviceGpsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer text-center"
          >
            <LocateFixed className="w-3.5 h-3.5 text-slate-600" />
            <span>Launch from My Live Phone GPS</span>
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer text-center"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedLink ? 'Navigation Link Copied!' : 'Copy Navigation Link'}</span>
          </button>
        </div>
      </div>

      {/* Safety & Transit Info Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vehicle: <strong>{vehicleNumber}</strong> • Green Corridor Active</span>
          {isDriverView && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
              Driver View
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          Fields pre-filled • Direct app routing
        </div>
      </div>
    </div>
  );
};
