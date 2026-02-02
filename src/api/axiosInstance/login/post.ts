import IUserInfo from 'src/entities/userinfo';
import { axiosInstance } from '../axiosInstance';

export interface ILoginPostData {
  username: string;
  password: string;
}
export interface ILoginResponse {
  access_token: string;
  role: string;
  user: IUserInfo;
  /** If the backend supports token refresh, include this so we can get a new access_token when it expires. */
  refresh_token?: string;
}
export async function postLoginData(data: ILoginPostData): Promise<ILoginResponse> {
  try {
    const response = await axiosInstance.post<ILoginResponse>('/api/login', data);
    return response.data;
  } catch (error) {
    console.error('Error posting Login data:', error);
    throw error;
  }
}
