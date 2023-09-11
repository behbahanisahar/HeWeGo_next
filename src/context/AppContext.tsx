import { createContext } from "react";
import IUserInfo from "src/entities/userinfo";

export interface AppContextState {
  userInfo:IUserInfo;
}

interface AppContextActions {
  setUserInfo: (data: IUserInfo) => void;
}

export interface AppContextInterface {
  state: AppContextState;
  actions: AppContextActions;
}

export const Context = createContext<AppContextInterface | null>(null);

export const AppContextConsumer = Context.Consumer;
