import { axiosInstance } from '../axiosInstance';

export interface ISignUpPostData {
    name: string;
    email: string;
    password: string;
    city: string;
}

export async function postSignUpData(data: ISignUpPostData): Promise<void> {
  try {
    const response = await axiosInstance.post<void>('/api/register', data);
    console.log('SignUp data posted:', response);
  } catch (error) {
    console.error('Error posting SignUp data:', error);
    throw error;
  }
}
