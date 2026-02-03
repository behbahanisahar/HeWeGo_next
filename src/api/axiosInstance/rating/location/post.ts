import { axiosInstance } from '../../axiosInstance';

/**
 * POST https://hewego.azurewebsites.net/api/rating/location/:locationId?rating=:rating
 * Rates a location (1–5).
 */
export async function rateLocation(
  locationId: number,
  rating: number
): Promise<void> {
  const value = Math.min(5, Math.max(1, Math.round(rating)));
  await axiosInstance.post(
    `/api/rating/location/${locationId}?rating=${value}`,
    {}
  );
}
