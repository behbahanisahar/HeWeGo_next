import { ITourPlace } from "@/entities/tourPlace";

/**
 * Mock AI duration estimation
 * In a real app, this would call an AI service to estimate tour duration
 * based on places, distances, and typical visit times
 */
export function estimateTourDuration(places: ITourPlace[]): number {
  if (!places || places.length === 0) return 0;

  // Base time per place (in minutes)
  const baseTimePerPlace = 30;
  
  // Calculate total estimated time
  let totalTime = 0;
  
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    
    // Use custom estimated time if provided, otherwise use base time
    const placeTime = place.estimatedTime || baseTimePerPlace;
    totalTime += placeTime;
    
    // Add travel time between places (if not the last place)
    if (i < places.length - 1) {
      const nextPlace = places[i + 1];
      const travelTime = calculateTravelTime(
        place.latitude,
        place.longitude,
        nextPlace.latitude,
        nextPlace.longitude
      );
      totalTime += travelTime;
    }
  }
  
  return Math.round(totalTime);
}

/**
 * Calculate estimated travel time between two coordinates (in minutes)
 * Uses a simple distance-based calculation (walking speed ~5 km/h)
 */
function calculateTravelTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula to calculate distance
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  // Assume walking speed of 5 km/h = 0.083 km/min
  // Add buffer for traffic, stops, etc. (multiply by 1.5)
  const walkingSpeed = 0.083; // km per minute
  const travelTime = (distance / walkingSpeed) * 1.5;
  
  // Minimum 5 minutes between places
  return Math.max(5, Math.round(travelTime));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours}h ${mins}m`;
}
