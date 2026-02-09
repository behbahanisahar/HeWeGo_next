import { useState, useEffect, useMemo } from "react";
import type { ITourPlace } from "@/entities/tourPlace";
import type { TravelMode } from "@/utils/aiEstimation";
import {
  getLegEstimatesAllModes,
  estimateTourDuration,
} from "@/utils/aiEstimation";
import {
  fetchRealRouteDurations,
  hasRealTimesApiKey,
  type ORSMode,
  type RealLegResult,
} from "@/utils/openRouteService";

export interface LegDisplayAllModes {
  fromPlace: ITourPlace;
  toPlace: ITourPlace;
  distanceKm: number;
  travelTimeByMode: Record<TravelMode, number>;
}

export interface TotalsByMode {
  walk: number;
  drive: number;
  transit: number;
  bicycle: number;
}

export interface UseRealRouteTimesResult {
  /** Legs with real times when available, otherwise estimated */
  legs: LegDisplayAllModes[];
  /** Total duration by mode (real when available) */
  totalsByMode: TotalsByMode;
  /** True while fetching real times */
  loading: boolean;
  /** True if API key is set (real times may be used) */
  hasRealTimesAvailable: boolean;
}

const ORS_MODES: ORSMode[] = ["walk", "drive", "bicycle"];

/**
 * Fetches real travel times from OpenRouteService when API key is set,
 * and merges with fallback estimates (used for transit and when API fails).
 */
export function useRealRouteTimes(places: ITourPlace[]): UseRealRouteTimesResult {
  const fallback = useMemo(
    () => getLegEstimatesAllModes(places),
    [places]
  );

  const [realByMode, setRealByMode] = useState<{
    walk: RealLegResult | null;
    drive: RealLegResult | null;
    bicycle: RealLegResult | null;
  }>({ walk: null, drive: null, bicycle: null });
  const [loading, setLoading] = useState(false);

  const placesKey = places.map((p) => `${p.id}-${p.latitude}-${p.longitude}`).join(",");

  useEffect(() => {
    if (!hasRealTimesApiKey() || places.length < 2) {
      setRealByMode({ walk: null, drive: null, bicycle: null });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const coords = places.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));

    Promise.all(
      ORS_MODES.map(async (mode) => {
        const result = await fetchRealRouteDurations(coords, mode);
        return { mode, result };
      })
    ).then((results) => {
      if (cancelled) return;
      setRealByMode({
        walk: results.find((r) => r.mode === "walk")?.result ?? null,
        drive: results.find((r) => r.mode === "drive")?.result ?? null,
        bicycle: results.find((r) => r.mode === "bicycle")?.result ?? null,
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [placesKey, places.length]);

  const legs: LegDisplayAllModes[] = useMemo(() => {
    return fallback.map((leg, i) => {
      const travelTimeByMode: Record<TravelMode, number> = {
        walk: realByMode.walk?.legs[i]?.durationMinutes ?? leg.travelTimeByMode.walk,
        drive: realByMode.drive?.legs[i]?.durationMinutes ?? leg.travelTimeByMode.drive,
        transit: leg.travelTimeByMode.transit,
        bicycle: realByMode.bicycle?.legs[i]?.durationMinutes ?? leg.travelTimeByMode.bicycle,
      };
      return {
        fromPlace: leg.fromPlace,
        toPlace: leg.toPlace,
        distanceKm: leg.distanceKm,
        travelTimeByMode,
      };
    });
  }, [fallback, realByMode]);

  const totalsByMode: TotalsByMode = useMemo(() => {
    const visitTotal = places.reduce(
      (sum, p) => sum + (p.estimatedTime ?? 30),
      0
    );
    return {
      walk:
        realByMode.walk != null
          ? Math.round(realByMode.walk.totalDurationMinutes + visitTotal)
          : estimateTourDuration(places, "walk"),
      drive:
        realByMode.drive != null
          ? Math.round(realByMode.drive.totalDurationMinutes + visitTotal)
          : estimateTourDuration(places, "drive"),
      transit: estimateTourDuration(places, "transit"),
      bicycle:
        realByMode.bicycle != null
          ? Math.round(realByMode.bicycle.totalDurationMinutes + visitTotal)
          : estimateTourDuration(places, "bicycle"),
    };
  }, [places, realByMode]);

  return {
    legs,
    totalsByMode,
    loading,
    hasRealTimesAvailable: hasRealTimesApiKey(),
  };
}
