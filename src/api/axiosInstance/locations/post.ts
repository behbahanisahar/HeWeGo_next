import { axiosInstance } from '../axiosInstance';

export interface ICreateLocationPayload {
  name: string;
  latitude: string;
  longitude: string;
  explanation: string;
  tags: string[];
}

export interface ICreateLocationResponse {
  id?: number;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  explanation?: string;
}

/**
 * POST https://hewego.azurewebsites.net/api/locations/create
 * Create a location (e.g. from map click). latitude/longitude as strings.
 */
export async function createLocation(
  payload: ICreateLocationPayload
): Promise<ICreateLocationResponse> {
  const response = await axiosInstance.post<ICreateLocationResponse>(
    '/api/locations/create',
    payload
  );
  const body = response.data as any;
  const location =
    body?.data != null ? body.data : body?.location != null ? body.location : body;
  return (location ?? response.data) as ICreateLocationResponse;
}
