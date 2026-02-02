import { axiosInstance } from '../axiosInstance';
import ICity from "src/entities/city";

export interface IAllCitiesResponse {
  cities: ICity[];
}

/**
 * GET https://hewego.azurewebsites.net/api/all_cities
 * Returns list of all cities (id, name, country, latitude, longitude).
 */
export async function getAllCities(): Promise<ICity[]> {
  const response = await axiosInstance.get<IAllCitiesResponse>('/api/all_cities');
  return response.data.cities ?? [];
}
