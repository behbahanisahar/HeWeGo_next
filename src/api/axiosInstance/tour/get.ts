import { axiosInstance } from '../axiosInstance';

export async function getAllTours(page: number, per_page: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`api/alltours?page=${page}&per_page=${per_page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tours:', error);
      throw error;
    }
  }
  
