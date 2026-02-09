import { axiosInstance } from '../axiosInstance';

/** Per-location visit time (minutes) set by tour creator. */
export interface ILocationEstimatedTime {
  location_id: number;
  estimated_time: number;
}

export interface ICreateTourPayload {
  name: string;
  city: number;
  explanation: string;
  tags: string[];
  /** Optional: IDs of user locations to include in this tour (from GET /api/user_locations). */
  location_ids?: number[];
  /** Optional: estimated duration in minutes (total tour). */
  estimated_duration?: number;
  /** Optional: visit time in minutes per location (set by creator). Backend may use this to store and return estimated_time per place. */
  location_estimated_times?: ILocationEstimatedTime[];
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
