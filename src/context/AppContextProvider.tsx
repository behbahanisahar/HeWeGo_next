import React, { Component, ReactNode } from "react";
import { AppContextState, Context } from "./AppContext";
import IUserInfo from "src/entities/userinfo";
import { getUserInfoAndFavorites } from "@/api/users/getInfo";

const AUTH_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_INFO_KEY = "userInfo";
const getStorage = (rememberMe?: boolean): Storage =>
  rememberMe ? localStorage : sessionStorage;

const EMPTY_USERINFO: IUserInfo = {
  id: 0,
  email: "",
  name: "",
  city: "",
  active: true,
  role: "guide",
  member_circles: [],
  created_circles: [],
  created_tours: [],
};

/** Read stored user from localStorage or sessionStorage (sync) so new tab/refresh stays logged in */
function getInitialUserInfo(): IUserInfo {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem(AUTH_TOKEN_KEY);
    const userJson = storage.getItem(USER_INFO_KEY);
    if (token && userJson) {
      try {
        return JSON.parse(userJson) as IUserInfo;
      } catch {
        // ignore invalid stored user
      }
    }
  }
  return EMPTY_USERINFO;
}

interface AppContextProviderProps {
  children: ReactNode; // Include the children prop
}

class AppContextProvider extends Component<AppContextProviderProps, AppContextState> {
  emptyUserinfo: IUserInfo = EMPTY_USERINFO;

  state: AppContextState = {
    userInfo: getInitialUserInfo(),
    favorites: [],
  };

  componentDidMount(): void {
    // Initial user is already set from getInitialUserInfo(); refresh from server when logged in
    if (localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)) {
      void this.refreshUserInfoFromServer();
    }
  }

  setUserInfo = (data: IUserInfo): void => {
    this.setState({ userInfo: data });
  };

  setFavorites = (favorites: unknown[]): void => {
    this.setState({ favorites });
  };

  refreshUserInfoFromServer = async (): Promise<void> => {
    try {
      const data = await getUserInfoAndFavorites();
      if (data?.user) {
        // Persist updated user back to whichever storage currently has the token
        const tokenInLocal = localStorage.getItem(AUTH_TOKEN_KEY);
        const storage = tokenInLocal ? localStorage : sessionStorage;
        storage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
        this.setState({
          userInfo: data.user,
          favorites: data.favorites ?? [],
        });
      }
    } catch {
      // ignore refresh failures; keep existing userInfo
    }
  };

  setAuth = (
    user: IUserInfo,
    accessToken: string,
    _role: string,
    rememberMe: boolean = true,
    refreshToken?: string
  ): void => {
    // ensure we don't leave stale auth in the other storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_INFO_KEY);

    const storage = getStorage(rememberMe);
    storage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    storage.setItem(USER_INFO_KEY, JSON.stringify(user));
    this.setState({ userInfo: user, favorites: [] });
    // refresh to get latest user + favorites from server
    void this.refreshUserInfoFromServer();
  };

  clearAuth = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_INFO_KEY);
    this.setState({ userInfo: this.emptyUserinfo, favorites: [] });
  };

  render(): React.ReactElement {
    return (
      <Context.Provider
        value={{
          state: this.state,
          actions: {
            setUserInfo: this.setUserInfo,
            setFavorites: this.setFavorites,
            setAuth: this.setAuth,
            clearAuth: this.clearAuth,
          },
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

export { AppContextProvider };
export default AppContextProvider;
export const AppConsumer = Context.Consumer;
