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
