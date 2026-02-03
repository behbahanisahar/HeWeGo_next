import { axiosInstance } from '../axiosInstance';
import type ICity from '@/entities/city';

/** Favourite tour item as returned by GET /api/favourites (full tour object). */
export interface IFavouriteItem {
  id: number;
  name: string;
  city?: ICity;
  description?: string | null;
  creator_id?: number | null;
  status_id?: number;
  average_rating?: number | null;
  locations?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    explanation?: string | null;
    average_rating?: number | null;
    tags?: string[];
  }>;
  tags?: string[];
  prices?: number[];
}

interface IFavouritesResponse {
  favourites: IFavouriteItem[];
}

/**
 * GET https://hewego.azurewebsites.net/api/favourites
 * Same URL for GET (list), POST (add), DELETE (remove). GET = returns the current user's favourite tours.
 * Response: { "favourites": IFavouriteItem[] }
 */
export async function getFavourites(): Promise<IFavouriteItem[]> {
  const response = await axiosInstance.get<IFavouritesResponse>('/api/favourites');
  const data = response.data;
  if (Array.isArray(data?.favourites)) return data.favourites;
  return [];
}
