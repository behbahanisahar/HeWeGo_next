import IUserInfo from 'src/entities/userinfo';
import { axiosInstance } from '../axiosInstance';

export interface ILoginPostData {
  username: string;
  password: string;
}
export interface ILoginResponse {
  access_token:string;
  role:string;
  user:IUserInfo;
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
