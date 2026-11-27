/**
 * LifeCare Real-Time Geolocation & Reverse Geocoding Service
 * Provides high-accuracy browser GPS telemetry and human-readable reverse geocoding
 */

export interface RealtimeLocation {
  lat: number;
  lng: number;
  address: string;
  isLiveGps: boolean;
  accuracyMeters?: number;
}

/**
 * Request high-accuracy GPS coordinates from the device via browser Geolocation API
 */
export const getDeviceRealtimeCoordinates = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by this browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Reverse geocodes latitude & longitude into a clean, human-readable address.
 * Uses OpenStreetMap Nominatim with graceful fallback to formatted coordinates.
 */
export const reverseGeocodeCoordinates = async (
  lat: number,
  lng: number
): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const streetOrLocality =
          addr.road ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.commercial ||
          addr.amenity ||
          '';

        const cityOrTown =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.district ||
          '';

        const state = addr.state || '';

        const parts = [streetOrLocality, cityOrTown, state].filter(Boolean);

        if (parts.length > 0) {
          return parts.join(', ');
        }

        if (data.display_name) {
          const shortName = data.display_name.split(',').slice(0, 3).join(',').trim();
          if (shortName) return shortName;
        }
      }
    }
  } catch {
    // Graceful fallback if offline or request blocked
  }

  return `Live GPS Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
};

/**
 * Haversine formula to compute distance in km between two GPS coordinates with road-routing multiplier
 */
export const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return Math.max(0.5, Math.round(km * 1.35 * 10) / 10);
};

/**
 * Calculates estimated driving transit time in minutes given distance and speed
 */
export const calculateTransitTimeMins = (
  distanceKm: number,
  speedKmh = 40
): number => {
  return Math.max(2, Math.round((distanceKm / speedKmh) * 60));
};
