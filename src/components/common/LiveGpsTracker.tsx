import React, { useState, useEffect } from 'react';
import type { EmergencyBooking } from '../../types';
import { 
  Navigation, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Radio, 
  CheckCircle2,
  Zap
} from 'lucide-react';

interface Props {
  booking: EmergencyBooking;
  role: 'patient' | 'hospital' | 'ambulance';
  onSimulateDriverLogin?: (code: string) => void;
}

export const LiveGpsTracker: React.FC<Props> = ({
  booking,
  role,
  onSimulateDriverLogin,
}) => {
  const [progress, setProgress] = useState<number>(35);
  const [etaMins, setEtaMins] = useState<number>(booking.ambulanceDetails.currentEtaMins || 6);

  const isDriverOnline = booking.driverLoggedIn || booking.status !== 'PENDING_AMBULANCE';

  // Smooth live animation of vehicle movement along route
  useEffect(() => {
    if (!isDriverOnline) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const next = prev + 1;
        if (next % 15 === 0) {
          setEtaMins((e) => Math.max(1, e - 1));
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isDriverOnline]);

  const originLat = booking.patientPickupCoords?.lat || 28.5500;
  const originLng = booking.patientPickupCoords?.lng || 77.2200;
  const destLat = booking.hospitalCoords?.lat || 28.5672;
  const destLng = booking.hospitalCoords?.lng || 77.2100;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <Navigation className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-red-700 font-bold">
                Live GPS Ambulance Tracking
              </span>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                Unit {booking.ambulanceDetails.vehicleNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              En Route to {booking.hospitalName} ({booking.reservedBay})
            </h3>
          </div>
        </div>

        {/* Live GPS Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isDriverOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Driver Logged In • GPS Live</span>
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-medium">
                Waiting for Driver Login (ID: <strong className="font-mono">{booking.bookingCode}</strong>)
              </span>
              {onSimulateDriverLogin && (
                <button
                  type="button"
                  onClick={() => onSimulateDriverLogin(booking.bookingCode)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded-lg text-xs transition cursor-pointer shadow-xs"
                >
                  Login Driver Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Visual Route Map Graphic */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 sm:p-5 space-y-4 relative overflow-hidden w-full max-w-full">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>

        {/* Route Header Info */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE TELEMETRY</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Speed: <strong>52 km/h</strong></span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Distance: <strong>{booking.ambulanceDetails.distanceRemainingKm} km</strong></span>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <span className="text-slate-400">Driver ID:</span>
            <strong className="text-red-400">{booking.bookingCode}</strong>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Patient ID:</span>
            <strong className="text-slate-200">{booking.patientUniqueId}</strong>
          </div>
        </div>

        {/* Visual Route Progress Track */}
        <div className="relative z-10 py-4">
          <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Moving Ambulance Vehicle Icon on Track */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center"
            style={{ left: `calc(${progress}% - 18px)` }}
          >
            <div className="bg-red-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[10px] font-mono font-bold text-red-300 mt-1 whitespace-nowrap bg-slate-950/80 px-1.5 py-0.5 rounded border border-red-500/30">
              Ambulance ({etaMins}m)
            </span>
          </div>

          {/* Origin and Destination Landmarks */}
          <div className="flex items-center justify-between text-xs mt-3 pt-2 text-slate-300">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Patient Pickup</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{booking.patientPickupCoords.address}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-right">
              <div>
                <div className="font-semibold text-white">{booking.hospitalName.split(' ')[0]} Hospital</div>
                <div className="text-[11px] text-emerald-400 font-bold">{booking.reservedBay}</div>
              </div>
              <Building2 className="w-4 h-4 text-red-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">ETA to Hospital</span>
            <span className="font-bold text-emerald-400 text-sm">{etaMins} Mins</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Driver Name</span>
            <span className="font-bold text-white text-xs truncate block">{booking.ambulanceDetails.driverName}</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Driver Phone</span>
            <span className="font-bold text-white text-xs">{booking.ambulanceDetails.driverPhone}</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Reserved Bay</span>
            <span className="font-bold text-emerald-400 text-xs truncate block">{booking.reservedBay}</span>
          </div>
        </div>
      </div>

      {/* Google Maps External Turn-by-Turn Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Live GPS coordinates synchronizing to {role === 'patient' ? 'Hospital ER Bay' : 'Patient'}.</span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Open Live Route in Google Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
};
