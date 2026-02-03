import { axiosInstance } from '../axiosInstance';

/**
 * DELETE https://hewego.azurewebsites.net/api/favourites
 * Same URL for GET (list), POST (add), DELETE (remove). DELETE = remove a tour from favourites.
 * Body: { "tour_id": number }
 */
export async function deleteFavourite(tourId: number): Promise<void> {
  await axiosInstance.delete('/api/favourites', {
    data: { tour_id: tourId },
  });
}
