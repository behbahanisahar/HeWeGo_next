import { createContext } from "react";
import IUserInfo from "src/entities/userinfo";

export interface AppContextState {
  userInfo:IUserInfo;
  favorites: unknown[];
}

interface AppContextActions {
  setUserInfo: (data: IUserInfo) => void;
  setFavorites: (favorites: unknown[]) => void;
  /** Set user + persist token/user to localStorage (use after login) */
  setAuth: (
    user: IUserInfo,
    accessToken: string,
    role: string,
    rememberMe?: boolean
  ) => void;
  /** Clear user from state and localStorage (use on logout) */
  clearAuth: () => void;
}

export interface AppContextInterface {
  state: AppContextState;
  actions: AppContextActions;
}

export const Context = createContext<AppContextInterface | null>(null);

export const AppContextConsumer = Context.Consumer;
