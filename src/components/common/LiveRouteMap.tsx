import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, MapPin, ExternalLink, Compass } from 'lucide-react';
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
  origin = { lat: 28.5500, lng: 77.2200, address: 'B-44, Greater Kailash Part 1, New Delhi' },
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
  const [progress, setProgress] = useState<number>(0.35); // 0.0 to 1.0 along the route

  // Animated progress along route
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.2;
        return prev + 0.015;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const distance = Math.max(0.4, Math.round(initialDistanceKm * (1 - progress) * 10) / 10);
  const eta = Math.max(1, Math.round(initialEtaMins * (1 - progress)));

  const navUrl = getGoogleMapsNavigationUrl(
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng }
  );

  // Calculate SVG vehicle coordinates along a curved bezier path
  // Start: (80, 260), Control1: (200, 150), Control2: (450, 220), End: (580, 70)
  const t = progress;
  const p0 = { x: 80, y: 260 };
  const p1 = { x: 220, y: 140 };
  const p2 = { x: 420, y: 230 };
  const p3 = { x: 580, y: 70 };

  const cx =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x;

  const cy =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative text-white">
      {/* Top HUD Telemetry Bar */}
      <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
            Live GPS Route & Navigation
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded-md">
            ID: {patientId}
          </span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA:</span>
            <strong className="text-amber-300 text-sm">{eta} mins</strong>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dist:</span>
            <strong className="text-emerald-300 text-sm">{distance} km</strong>
          </div>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-white" />
          </a>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-950 overflow-hidden flex items-center justify-center select-none">
        {/* City Map Grid Texture Background */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
              <circle cx="20" cy="20" r="1" fill="#475569" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Ambient Simulated Roads */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 700 350">
          <path d="M 0 100 Q 300 120 700 80" stroke="#475569" strokeWidth="12" fill="none" />
          <path d="M 0 280 Q 350 240 700 300" stroke="#475569" strokeWidth="10" fill="none" />
          <path d="M 180 0 Q 150 200 220 350" stroke="#475569" strokeWidth="8" fill="none" />
          <path d="M 500 0 Q 520 180 480 350" stroke="#475569" strokeWidth="8" fill="none" />
        </svg>

        {/* Live Dynamic Transit Route */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Route Glow Filter */}
            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="route-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Underlay Highway Path */}
          <path
            d="M 80 260 C 220 140, 420 230, 580 70"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Green Corridor Active Route with Glow */}
          <path
            d="M 80 260 C 220 140, 420 230, 580 70"
            fill="none"
            stroke="url(#route-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#route-glow)"
          />

          {/* Animated Dash Corridor Indicator */}
          <path
            d="M 80 260 C 220 140, 420 230, 580 70"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 12"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Origin Marker (Patient Pickup Point) */}
          <g transform="translate(80, 260)">
            <circle r="18" fill="#06b6d4" opacity="0.25" className="animate-ping" />
            <circle r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
            <circle r="4" fill="#ffffff" />
            <text x="-40" y="26" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
              PICKUP LOCATION
            </text>
          </g>

          {/* Destination Marker (Hospital Emergency Gate & Bay) */}
          <g transform="translate(580, 70)">
            <circle r="22" fill="#ef4444" opacity="0.3" className="animate-ping" />
            <circle r="13" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
            {/* Red Cross */}
            <rect x="-2" y="-7" width="4" height="14" fill="#ffffff" rx="1" />
            <rect x="-7" y="-2" width="14" height="4" fill="#ffffff" rx="1" />
            <text x="-50" y="-18" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
              HOSPITAL ER BAY
            </text>
          </g>

          {/* Moving 108 Ambulance Vehicle Marker */}
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Halo pulse */}
            <circle r="16" fill="#10b981" opacity="0.3" className="animate-ping" />
            {/* Vehicle body */}
            <rect x="-14" y="-10" width="28" height="20" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="-6" cy="10" r="3" fill="#64748b" />
            <circle cx="6" cy="10" r="3" fill="#64748b" />
            {/* Flashing light bar */}
            <rect x="-5" y="-12" width="10" height="3" rx="1.5" fill="#ef4444" className="animate-pulse" />
            {/* 108 label */}
            <text x="-9" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">
              108
            </text>
          </g>
        </svg>

        {/* Floating Callout: Patient Origin */}
        <div className="absolute left-3 bottom-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 max-w-[210px] text-[11px] shadow-lg pointer-events-none hidden sm:block">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Patient Pickup</span>
          </div>
          <div className="text-slate-300 truncate font-mono text-[10px]">{origin.address}</div>
        </div>

        {/* Floating Callout: Hospital Destination */}
        <div className="absolute right-3 top-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 max-w-[230px] text-[11px] shadow-lg pointer-events-none text-right hidden sm:block">
          <div className="flex items-center justify-end space-x-1.5 text-rose-400 font-bold mb-0.5">
            <span>Destination Bay</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-white font-bold truncate text-[11px]">{destination.name}</div>
          <div className="text-emerald-400 font-mono text-[10px] font-bold">
            Locked: {destination.bay || 'Trauma Bay #03'}
          </div>
        </div>
      </div>

      {/* Bottom Live Corridor Status Footer */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Vehicle: <strong className="text-slate-200 font-mono">{vehicleNumber}</strong> ({speedKmh} km/h)
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-emerald-400 font-medium hidden sm:inline">
            Delhi Traffic Police Green Corridor Signal Preemption Active
          </span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
            0% Gate Rejection Locked
          </span>
          {isDriverView && (
            <span className="bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
              Driver Live Stream
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
