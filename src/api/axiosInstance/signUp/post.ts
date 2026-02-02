import axios, { AxiosError } from 'axios';
import { axiosInstance } from '../axiosInstance';

export interface ISignUpPostData extends Record<string, string | number | undefined> {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  city: string;
}

/** Payload sent to the register API (no confirmPassword) */
export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  city: string;
}

/** Error response when e.g. user already exists (400 Bad Request) */
export interface IRegisterErrorResponse {
  message: string;
}

export function isRegisterError(error: unknown): error is AxiosError<IRegisterErrorResponse> {
  return axios.isAxiosError(error);
}

export async function postSignUpData(data: ISignUpPostData): Promise<void> {
  const payload: IRegisterPayload = {
    name: data.name,
    email: data.email,
    password: data.password,
    city: data.city,
  };
  const response = await axiosInstance.post<void>('/api/register', payload);
  console.log('SignUp data posted:', response);
}
