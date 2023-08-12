// login api file
import { axiosInstance } from '../axiosInstance';

export interface ILoginPostData {
  username: string;
  password: string;
}

export async function postLoginData(data: ILoginPostData): Promise<void> {
  try {
    const response = await axiosInstance.post<void>('/api/login', data);
    console.log('Login data posted:', response);
  } catch (error) {
    console.error('Error posting Login data:', error);
    throw error;
  }
}
