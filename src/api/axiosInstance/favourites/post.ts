import { axiosInstance } from '../axiosInstance';

/**
 * POST https://hewego.azurewebsites.net/api/favourites
 * Same URL for GET (list), POST (add), DELETE (remove). POST = add a tour to favourites.
 * Body: { "tour_id": number }
 */
export async function addFavourite(tourId: number): Promise<void> {
  await axiosInstance.post('/api/favourites', { tour_id: tourId });
}
