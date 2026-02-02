import { axiosInstance } from '../axiosInstance';
import type ICity from '@/entities/city';

/**
 * GET https://hewego.azurewebsites.net/api/all_cities
 * Returns list of all cities (id, name, country, latitude, longitude).
 * Handles response shapes: { cities: [...] }, { data: { cities: [...] } }, or array.
 */
export async function getAllCities(): Promise<ICity[]> {
  const response = await axiosInstance.get<unknown>('/api/all_cities');
  const data = response.data as Record<string, unknown> | unknown[];
  let list: unknown[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object' && 'cities' in data) {
    list = Array.isArray((data as { cities: unknown }).cities) ? (data as { cities: unknown[] }).cities : [];
  } else if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) list = inner;
    else if (inner && typeof inner === 'object' && 'cities' in (inner as object)) {
      list = Array.isArray((inner as { cities: unknown }).cities) ? (inner as { cities: unknown[] }).cities : [];
    }
  }
  return list
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      id: Number(item.id) || 0,
      name: String(item.name ?? ''),
      country: String(item.country ?? ''),
      longitude: Number(item.longitude) || 0,
      latitude: Number(item.latitude) || 0,
    }))
    .filter((c) => c.id > 0 && c.name.trim() !== '');
}
