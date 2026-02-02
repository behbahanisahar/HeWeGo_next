import IUserInfo from "src/entities/userinfo";
import { axiosInstance } from "../axiosInstance";

export interface IUpdateUserInfoPayload {
  name: string;
  email: string;
  city: string;
}

/**
 * Update current user info (edit profile).
 * POST https://hewego.azurewebsites.net/api/users/info
 */
export async function updateUserInfo(
  data: IUpdateUserInfoPayload
): Promise<IUserInfo> {
  const response = await axiosInstance.post<IUserInfo>("/api/users/info", data);
  return response.data;
}
