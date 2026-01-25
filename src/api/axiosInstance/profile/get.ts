import {axiosInstance} from '../axiosInstance'; // Import your Axios instance

export async function getUserTours(): Promise<any> {
  try {
    const response = await axiosInstance.get('/user_tours');
    return response.data;
  } catch (error) {
    console.error('Error fetching user tours:', error);
    throw error;
  }
}
