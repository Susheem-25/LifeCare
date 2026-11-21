import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Compass, ExternalLink, Navigation } from 'lucide-react';
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);

  const [mapType, setMapType] = useState<'realtime_osm' | 'google_embed'>('realtime_osm');
  const [progress, setProgress] = useState<number>(0.3);

  // Generate intermediate route coordinates along real Delhi roadways
  // (Greater Kailash Part 1 -> Outer Ring Road -> Africa Avenue -> Ring Road AIIMS Trauma)
  const routeWaypoints: [number, number][] = [
    [origin.lat, origin.lng],
    [28.5480, 77.2310],
    [28.5520, 77.2250],
    [28.5560, 77.2200],
    [28.5610, 77.2150],
    [28.5640, 77.2120],
    [destination.lat, destination.lng],
  ];

  // Initialize Real Leaflet Map with OpenStreetMap Real-Time Tile API
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Center midway between origin and destination
      const centerLat = (origin.lat + destination.lat) / 2;
      const centerLng = (origin.lng + destination.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      // Real-Time OpenStreetMap Tiles API
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Real Route Polyline
      const polyline = L.polyline(routeWaypoints, {
        color: '#dc2626',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit map bounds to show route nicely
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      // Origin Marker (Patient Pickup)
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div style="background-color: #0284c7; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
            P
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([origin.lat, origin.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>Patient Pickup:</b><br/>${origin.address || 'Pickup Point'}`);

      // Destination Marker (Hospital Emergency Gate)
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-pin',
        html: `
          <div style="background-color: #dc2626; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 16px;">
            +
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([destination.lat, destination.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`<b>${destination.name}</b><br/>Bay: ${destination.bay || 'Trauma Bay'}`);

      // Moving Ambulance Vehicle Marker
      const ambulanceIcon = L.divIcon({
        className: 'custom-amb-pin',
        html: `
          <div style="background-color: #0f172a; width: 40px; height: 26px; border-radius: 8px; border: 2px solid #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: bold; font-family: monospace; font-size: 10px;">
            108 AMB
          </div>
        `,
        iconSize: [40, 26],
        iconAnchor: [20, 13],
      });

      // Calculate initial position on waypoint array based on progress
      const currentPoint = routeWaypoints[Math.min(Math.floor(progress * routeWaypoints.length), routeWaypoints.length - 1)];
      const ambMarker = L.marker(currentPoint, { icon: ambulanceIcon }).addTo(map);
      ambulanceMarkerRef.current = ambMarker;

      mapInstanceRef.current = map;

      // Invalidate size shortly after mounting so tiles load cleanly
      const resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      return () => {
        clearTimeout(resizeTimer);
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (e) {
      console.warn('Leaflet map initialization:', e);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [mapType, destination.lat, destination.lng, origin.lat, origin.lng]);

  // Update ambulance marker position periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev >= 0.9 ? 0.2 : prev + 0.03;
        if (ambulanceMarkerRef.current && routeWaypoints.length > 0) {
          const idx = Math.min(Math.floor(next * (routeWaypoints.length - 1)), routeWaypoints.length - 1);
          ambulanceMarkerRef.current.setLatLng(routeWaypoints[idx]);
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distance = Math.max(0.4, Math.round(initialDistanceKm * (1 - progress) * 10) / 10);
  const eta = Math.max(1, Math.round(initialEtaMins * (1 - progress)));

  const googleMapsNavUrl = getGoogleMapsNavigationUrl(
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng }
  );

  // Google Maps interactive embed URL
  const googleEmbedUrl = `https://maps.google.com/maps?q=${destination.lat},${destination.lng}&z=14&output=embed`;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg space-y-0">
      {/* Realtime Map HUD Bar */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
            Realtime GPS Navigation Map
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300 text-[11px]">
            ID: {patientId}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA:</span>
            <strong className="text-amber-300 text-sm">{eta} mins</strong>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Distance:</span>
            <strong className="text-emerald-300 text-sm">{distance} km</strong>
          </div>

          {/* Toggle between Leaflet OpenStreetMap Realtime API and Google Maps View */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('realtime_osm')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                mapType === 'realtime_osm' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Realtime OSM
            </button>
            <button
              type="button"
              onClick={() => setMapType('google_embed')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                mapType === 'google_embed' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Maps
            </button>
          </div>

          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
          >
            <span>Live App</span>
            <ExternalLink className="w-3 h-3 text-white" />
          </a>
        </div>
      </div>

      {/* Main Interactive Realtime Map Display */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100">
        {mapType === 'realtime_osm' ? (
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        ) : (
          <iframe
            title="Google Maps Live Hospital Route"
            src={googleEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* Floating Route Badge */}
        <div className="absolute left-4 bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-lg max-w-xs text-xs pointer-events-none">
          <div className="flex items-center space-x-1.5 text-slate-900 font-extrabold">
            <Navigation className="w-3.5 h-3.5 text-red-600" />
            <span className="truncate">{destination.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Locked Bay: <strong className="text-emerald-700 font-mono">{destination.bay || 'Trauma Bay #03'}</strong>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Live OpenStreetMap Real-Time Tile Engine
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Ambulance: <strong className="font-mono text-slate-900">{vehicleNumber}</strong> ({speedKmh} km/h)</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-semibold">Green Corridor Signal Active</span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
            0% Gate Rejection
          </span>
          {isDriverView && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
              Driver Cockpit Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
