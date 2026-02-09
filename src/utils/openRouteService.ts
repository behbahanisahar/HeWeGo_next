/**
 * OpenRouteService Directions API – real travel times by foot, car, and bicycle.
 * Get a free API key at https://openrouteservice.org/dev/#/signup
 * Set VITE_OPENROUTE_SERVICE_API_KEY in your .env
 *
 * Transit is not supported by ORS; use fallback estimates for transit.
 */

const ORS_API_KEY =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENROUTE_SERVICE_API_KEY
    ? String(import.meta.env.VITE_OPENROUTE_SERVICE_API_KEY).trim()
    : "";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions";

const PROFILE_MAP = {
  walk: "foot-walking",
  drive: "driving-car",
  bicycle: "cycling-regular",
} as const;

export type ORSMode = keyof typeof PROFILE_MAP;

export interface RealLegResult {
  legs: { durationMinutes: number }[];
  totalDurationMinutes: number;
}

/**
 * Fetch real route durations from OpenRouteService.
 * Coordinates: array of { latitude, longitude }. We convert to [lon, lat] for ORS.
 * Returns null if no key, request fails, or < 2 waypoints.
 */
export async function fetchRealRouteDurations(
  coordinates: { latitude: number; longitude: number }[],
  mode: ORSMode
): Promise<RealLegResult | null> {
  if (!ORS_API_KEY || coordinates.length < 2) return null;

  const profile = PROFILE_MAP[mode];
  const coordsLonLat = coordinates.map((c) => [c.longitude, c.latitude]);

  try {
    const res = await fetch(`${ORS_BASE}/${profile}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({ coordinates: coordsLonLat }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("OpenRouteService error:", res.status, err);
      return null;
    }

    const data = (await res.json()) as {
      routes?: Array<{
        segments?: Array<{ duration?: number }>;
        summary?: { duration?: number };
      }>;
    };

    const route = data?.routes?.[0];
    const segments = route?.segments ?? [];
    const summaryDuration = route?.summary?.duration;

    const legs = segments.map((seg) => ({
      durationMinutes: Math.round((seg.duration ?? 0) / 60),
    }));

    const totalDurationMinutes = summaryDuration
      ? Math.round(summaryDuration / 60)
      : legs.reduce((sum, l) => sum + l.durationMinutes, 0);

    return { legs, totalDurationMinutes };
  } catch (e) {
    console.warn("OpenRouteService fetch failed:", e);
    return null;
  }
}

export function hasRealTimesApiKey(): boolean {
  return Boolean(ORS_API_KEY);
}
