import { ITourPlace } from "@/entities/tourPlace";

/** Travel mode for duration estimation. Maps to real-world options (e.g. Google Maps). */
export type TravelMode = "walk" | "drive" | "transit" | "bicycle";

/** Average speed km/h and buffer factor (roads/traffic/stops). Used for distance-based estimate. */
const TRAVEL_MODE_SPEED: Record<
  TravelMode,
  { speedKmh: number; bufferFactor: number; minMinutes: number }
> = {
  walk: { speedKmh: 5, bufferFactor: 1.4, minMinutes: 3 },
  drive: { speedKmh: 35, bufferFactor: 1.3, minMinutes: 2 },
  transit: { speedKmh: 18, bufferFactor: 1.5, minMinutes: 5 },
  bicycle: { speedKmh: 15, bufferFactor: 1.2, minMinutes: 3 },
};

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine distance in km between two coordinates.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimated travel time between two points (minutes) by mode.
 * Uses distance-based speed; for real times use a backend with Google Maps Directions/Distance Matrix.
 */
export function calculateTravelTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  mode: TravelMode = "walk"
): number {
  const distance = haversineDistanceKm(lat1, lon1, lat2, lon2);
  const { speedKmh, bufferFactor, minMinutes } = TRAVEL_MODE_SPEED[mode];
  const speedKmPerMin = speedKmh / 60;
  const travelTime = (distance / speedKmPerMin) * bufferFactor;
  return Math.max(minMinutes, Math.round(travelTime));
}

/** One leg = travel from place at index i to place at index i+1. */
export interface LegEstimate {
  fromPlace: ITourPlace;
  toPlace: ITourPlace;
  travelTimeMinutes: number;
  distanceKm: number;
}

/** Leg with travel times for all transport modes (for browsing). */
export interface LegEstimateAllModes {
  fromPlace: ITourPlace;
  toPlace: ITourPlace;
  distanceKm: number;
  travelTimeByMode: Record<TravelMode, number>;
}

/**
 * Get travel time (all modes) and distance for each leg. Use when user is browsing (no booking).
 */
export function getLegEstimatesAllModes(places: ITourPlace[]): LegEstimateAllModes[] {
  const legs: LegEstimateAllModes[] = [];
  const modes: TravelMode[] = ["walk", "drive", "transit", "bicycle"];
  for (let i = 0; i < places.length - 1; i++) {
    const from = places[i];
    const to = places[i + 1];
    const distance = haversineDistanceKm(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    const travelTimeByMode = {} as Record<TravelMode, number>;
    for (const mode of modes) {
      travelTimeByMode[mode] = calculateTravelTime(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude,
        mode
      );
    }
    legs.push({
      fromPlace: from,
      toPlace: to,
      distanceKm: Math.round(distance * 10) / 10,
      travelTimeByMode,
    });
  }
  return legs;
}

/**
 * Get travel time and distance for each leg between consecutive places (single mode).
 */
export function getLegEstimates(
  places: ITourPlace[],
  mode: TravelMode = "walk"
): LegEstimate[] {
  const legs: LegEstimate[] = [];
  for (let i = 0; i < places.length - 1; i++) {
    const from = places[i];
    const to = places[i + 1];
    const distance = haversineDistanceKm(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    const travelTime = calculateTravelTime(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
      mode
    );
    legs.push({
      fromPlace: from,
      toPlace: to,
      travelTimeMinutes: travelTime,
      distanceKm: Math.round(distance * 10) / 10,
    });
  }
  return legs;
}

const BASE_TIME_PER_PLACE = 30;

/**
 * Total tour duration (visit time + travel between places) for a given order and mode.
 */
export function estimateTourDuration(
  places: ITourPlace[],
  mode: TravelMode = "walk"
): number {
  if (!places || places.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    total += place.estimatedTime ?? BASE_TIME_PER_PLACE;
    if (i < places.length - 1) {
      const next = places[i + 1];
      total += calculateTravelTime(
        place.latitude,
        place.longitude,
        next.latitude,
        next.longitude,
        mode
      );
    }
  }
  return Math.round(total);
}

/**
 * Greedy nearest-neighbor order to minimize total travel distance.
 * Starts from the first place in the list; returns a new ordered array (does not mutate).
 */
export function optimizeRouteOrder(places: ITourPlace[]): ITourPlace[] {
  if (!places || places.length <= 1) return [...(places ?? [])];
  const remaining = new Set(places.map((_, i) => i));
  const ordered: ITourPlace[] = [];
  let currentIndex = 0;
  ordered.push(places[currentIndex]);
  remaining.delete(currentIndex);

  while (remaining.size > 0) {
    const current = places[currentIndex];
    let nearestIndex = -1;
    let nearestDist = Infinity;
    for (const i of remaining) {
      const d = haversineDistanceKm(
        current.latitude,
        current.longitude,
        places[i].latitude,
        places[i].longitude
      );
      if (d < nearestDist) {
        nearestDist = d;
        nearestIndex = i;
      }
    }
    if (nearestIndex === -1) break;
    ordered.push(places[nearestIndex]);
    remaining.delete(nearestIndex);
    currentIndex = nearestIndex;
  }

  return ordered.map((p, i) => ({ ...p, order: i }));
}

/**
 * Reorder tour so the first stop is nearest to the user, then nearest-neighbor for the rest.
 * Use after user has "got" the tour and we have their location.
 */
export function optimizeRouteOrderFromUserLocation(
  places: ITourPlace[],
  userLat: number,
  userLon: number
): ITourPlace[] {
  if (!places || places.length <= 1) return [...(places ?? [])];
  let nearestIndex = 0;
  let nearestDist = haversineDistanceKm(userLat, userLon, places[0].latitude, places[0].longitude);
  for (let i = 1; i < places.length; i++) {
    const d = haversineDistanceKm(userLat, userLon, places[i].latitude, places[i].longitude);
    if (d < nearestDist) {
      nearestDist = d;
      nearestIndex = i;
    }
  }
  const ordered: ITourPlace[] = [places[nearestIndex]];
  let remaining = places.filter((_, i) => i !== nearestIndex);
  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = haversineDistanceKm(current.latitude, current.longitude, remaining[0].latitude, remaining[0].longitude);
    for (let i = 1; i < remaining.length; i++) {
      const d = haversineDistanceKm(current.latitude, current.longitude, remaining[i].latitude, remaining[i].longitude);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    ordered.push(remaining[bestIdx]);
    remaining = remaining.filter((_, i) => i !== bestIdx);
  }
  return ordered.map((p, i) => ({ ...p, order: i }));
}

/**
 * Estimated time (minutes) from user's location to the first stop. Use for "Start tour" ETA.
 */
export function estimateTimeFromUserToFirstPlace(
  userLat: number,
  userLon: number,
  firstPlace: ITourPlace,
  mode: TravelMode = "walk"
): number {
  return calculateTravelTime(
    userLat,
    userLon,
    firstPlace.latitude,
    firstPlace.longitude,
    mode
  );
}

/**
 * Format duration in minutes to human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours}h ${mins}m`;
}
