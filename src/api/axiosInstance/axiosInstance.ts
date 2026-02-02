import axios, { AxiosInstance } from 'axios';

const baseURL = 'https://hewego.azurewebsites.net/';

const getAccessToken = () => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) {
    return `Bearer ${token}`;
  }
  return '';
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Authorization: getAccessToken(),
  },
});

// Keep auth header in sync after login/logout
axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.Authorization = getAccessToken();
  return config;
});
