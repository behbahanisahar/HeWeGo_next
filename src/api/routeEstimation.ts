import type { TravelMode } from "@/utils/aiEstimation";
import type { ITourPlace } from "@/entities/tourPlace";

/**
 * Response shape from a backend that uses Google Maps Directions/Distance Matrix.
 * When your backend exposes e.g. POST /api/route-estimate with body
 * { waypoints: [{ lat, lng }], mode: "drive" | "walk" | "transit" | "bicycle" },
 * return an array of leg durations in minutes and optional optimized order.
 */
export interface RouteEstimateLeg {
  fromIndex: number;
  toIndex: number;
  travelTimeMinutes: number;
  distanceKm?: number;
}

export interface RouteEstimateResponse {
  legs: RouteEstimateLeg[];
  totalDurationMinutes: number;
  optimizedOrder?: number[]; // indices into original waypoints
}

const ROUTE_ESTIMATION_API =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ROUTE_ESTIMATION_API
    ? String(import.meta.env.VITE_ROUTE_ESTIMATION_API).replace(/\/$/, "")
    : "";

/**
 * Fetch real travel times from your backend (e.g. calling Google Maps APIs).
 * Set VITE_ROUTE_ESTIMATION_API in .env to your endpoint URL.
 * If not set or request fails, return null so the app uses local estimation.
 */
export async function fetchRouteEstimate(
  places: ITourPlace[],
  mode: TravelMode
): Promise<RouteEstimateResponse | null> {
  if (!ROUTE_ESTIMATION_API || places.length < 2) return null;
  try {
    const waypoints = places.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      id: p.id,
    }));
    const res = await fetch(ROUTE_ESTIMATION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waypoints, mode }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.legs?.length) return null;
    return {
      legs: data.legs,
      totalDurationMinutes: data.totalDurationMinutes ?? 0,
      optimizedOrder: data.optimizedOrder,
    };
  } catch {
    return null;
  }
}
