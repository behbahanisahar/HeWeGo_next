import axios, { AxiosInstance } from 'axios';

const baseURL = 'https://hewego.azurewebsites.net/';

const getAccessToken = () => {
  const token = localStorage.getItem('access_token');
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
