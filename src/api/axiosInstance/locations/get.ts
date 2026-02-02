import { axiosInstance } from '../axiosInstance';

export interface IUserLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  explanation?: string | null;
  average_rating?: number | null;
  tags?: string[];
}

export interface IUserLocationsResponse {
  locations: IUserLocation[];
}

/**
 * GET https://hewego.azurewebsites.net/api/user_locations
 * Returns the current user's created locations.
 */
export async function getUserLocations(): Promise<IUserLocation[]> {
  const response = await axiosInstance.get<IUserLocationsResponse>('/api/user_locations');
  const body = response.data as any;
  const list = body?.locations ?? body?.data?.locations ?? response.data?.locations ?? [];
  return Array.isArray(list) ? list : [];
}
