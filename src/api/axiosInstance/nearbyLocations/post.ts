import { axiosInstance } from '../axiosInstance';

export interface INearbyLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  explanation?: string | null;
  average_rating?: number | null;
  tags?: string[];
  distance?: number;
}

export interface INearbyLocationsPayload {
  tags: string[];
  longitude: string;
  latitude: string;
  max_distance: number;
}

export interface INearbyLocationsResponse {
  locations?: INearbyLocation[];
}

/**
 * POST https://hewego.azurewebsites.net/api/nearby-locations
 * Returns locations near the given coordinates, optionally filtered by tags and max distance (km).
 */
export async function getNearbyLocations(
  payload: INearbyLocationsPayload
): Promise<INearbyLocation[]> {
  const response = await axiosInstance.post<INearbyLocationsResponse | INearbyLocation[]>(
    '/api/nearby-locations',
    payload
  );
  const data = response.data;
  if (Array.isArray(data)) return data;
  const list = (data as INearbyLocationsResponse)?.locations;
  return Array.isArray(list) ? list : [];
}
