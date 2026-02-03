/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Nominatim address can have various keys depending on location (city, town, village, municipality, etc.) */
const CITY_KEYS = [
  'city',
  'town',
  'village',
  'municipality',
  'suburb',
  'locality',
  'district',
  'borough',
  'county',
  'state_district',
  'state',
  'region',
] as const;

/**
 * Reverse geocode: get city (and country) from latitude/longitude using OpenStreetMap Nominatim.
 * Returns a short label like "London, UK" or null if the request fails.
 * Requires addressdetails=1 so the API returns the address object.
 */
export async function getCityFromCoords(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'HeWeGo/1.0 (https://hewego.azurewebsites.net)' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const addr = data?.address;
    const country = addr?.country ?? '';

    // Try each known address key for a city-like name (prefer more specific first)
    let cityPart = '';
    for (const key of CITY_KEYS) {
      const value = addr?.[key];
      if (value && typeof value === 'string' && value.trim()) {
        cityPart = value.trim();
        break;
      }
    }

    if (cityPart && country) return `${cityPart}, ${country}`;
    if (cityPart) return cityPart;
    if (country) return country;

    // Fallback: use display_name (e.g. "Westminster, London, Greater London, England, United Kingdom")
    const displayName = data?.display_name;
    if (displayName && typeof displayName === 'string') {
      const parts = displayName.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) return `${parts[0]}, ${parts[parts.length - 1]}`;
      if (parts.length === 1) return parts[0];
      return displayName;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get user's current location using Geolocation API
 */
export async function getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Error getting user location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Filter tours by location (city name or distance from user)
 * - If search query exists: Show all tours matching search (ignore location filter)
 * - If location enabled and no search: Show only nearby tours (within maxDistanceKm)
 * - If neither: Show all tours
 */
export function filterToursByLocation(
  tours: any[],
  searchQuery?: string,
  userLocation?: { latitude: number; longitude: number },
  maxDistanceKm?: number
): any[] {
  let filtered = [...tours];
  const hasSearchQuery = searchQuery && searchQuery.trim();
  const hasLocation = userLocation && maxDistanceKm;

  // If search query exists, show all matching tours (ignore location filter)
  if (hasSearchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((tour) => {
      const cityName = tour.city?.name?.toLowerCase() || '';
      const countryName = tour.city?.country?.toLowerCase() || '';
      const tourName = tour.name?.toLowerCase() || '';
      return cityName.includes(query) || countryName.includes(query) || tourName.includes(query);
    });

    // Still calculate distances for display if location is available
    if (userLocation) {
      filtered = filtered.map((tour) => {
        if (!tour.city?.latitude || !tour.city?.longitude) {
          return { ...tour, distance: undefined };
        }
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          tour.city.latitude,
          tour.city.longitude
        );
        return { ...tour, distance };
      });

      // Sort by distance (closest first) when searching
      filtered.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    return filtered;
  }

  // If location is enabled and no search query, filter by distance
  if (hasLocation) {
    filtered = filtered.map((tour) => {
      if (!tour.city?.latitude || !tour.city?.longitude) {
        return { ...tour, distance: undefined };
      }
      const distance = calculateDistance(
        userLocation!.latitude,
        userLocation!.longitude,
        tour.city.latitude,
        tour.city.longitude
      );
      return { ...tour, distance };
    });

    // Filter by max distance
    filtered = filtered.filter((tour) => tour.distance !== undefined && tour.distance <= maxDistanceKm!);

    // Sort by distance (closest first)
    filtered.sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    return filtered;
  }

  // If neither search nor location, show all tours
  // Still calculate distances if location is available (for display purposes)
  if (userLocation) {
    filtered = filtered.map((tour) => {
      if (!tour.city?.latitude || !tour.city?.longitude) {
        return { ...tour, distance: undefined };
      }
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        tour.city.latitude,
        tour.city.longitude
      );
      return { ...tour, distance };
    });
  }

  return filtered;
}
