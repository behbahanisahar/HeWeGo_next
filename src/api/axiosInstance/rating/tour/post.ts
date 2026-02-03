import { axiosInstance } from '../../axiosInstance';

export interface IRateTourPayload {
  tour_id: number;
  location_id?: number;
}

/**
 * POST https://hewego.azurewebsites.net/api/rating/tour/:tourId?rating=:rating
 * Body: { tour_id, location_id? }
 * Rates a tour (optionally a specific location within the tour).
 */
export async function rateTour(
  tourId: number,
  rating: number,
  payload: IRateTourPayload
): Promise<void> {
  await axiosInstance.post(
    `/api/rating/tour/${tourId}?rating=${Math.min(10, Math.max(1, Math.round(rating)))}`,
    payload
  );
}
