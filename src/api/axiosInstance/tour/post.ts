import { axiosInstance } from '../axiosInstance';

export interface ICreateTourPayload {
  name: string;
  city: number;
  explanation: string;
  tags: string[];
  /** Optional: IDs of user locations to include in this tour (from GET /api/user_locations). */
  location_ids?: number[];
  /** Optional: estimated duration in minutes. */
  estimated_duration?: number;
  /** Optional: price in currency units (e.g. single price). Sent as array for API compatibility. */
  prices?: number[];
}

export interface ICreateTourResponse {
  id?: number;
  name?: string;
  city?: unknown;
  explanation?: string;
  tags?: string[];
}

/**
 * POST https://hewego.azurewebsites.net/api/tours/create
 * Create a new tour with name, city (id), explanation, tags, and optional location_ids, estimated_duration, prices.
 */
export async function createTour(payload: ICreateTourPayload): Promise<ICreateTourResponse> {
  const response = await axiosInstance.post<ICreateTourResponse>('/api/tours/create', payload);
  const body = response.data as any;
  const tour = body?.data != null ? body.data : body?.tour != null ? body.tour : body;
  return (tour ?? response.data) as ICreateTourResponse;
}
