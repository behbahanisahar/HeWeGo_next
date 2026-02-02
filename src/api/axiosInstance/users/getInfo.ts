import IUserInfo from "src/entities/userinfo";
import { axiosInstance } from "../axiosInstance";

export interface IUserInfoAndFavoritesResponse {
  user: IUserInfo;
  /** Backend may include favorites; keep optional for compatibility */
  favorites?: unknown[];
}

export async function getUserInfoAndFavorites(): Promise<IUserInfoAndFavoritesResponse> {
  const response = await axiosInstance.get<IUserInfoAndFavoritesResponse>("/api/users/info");
  return response.data;
}

