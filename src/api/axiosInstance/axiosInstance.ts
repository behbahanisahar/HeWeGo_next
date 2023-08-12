// axiosInstance.ts
import axios, { AxiosInstance } from 'axios';

const baseURL = 'https://hewego.azurewebsites.net/';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
});
