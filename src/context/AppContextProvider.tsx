import { Component, ReactNode } from "react";
import { AppContextState, Context } from "./AppContext";
import IUserInfo from "src/entities/userinfo";

interface AppContextProviderProps {
  children: ReactNode; // Include the children prop
}

class AppContextProvider extends Component<AppContextProviderProps, AppContextState> {
  emptyUserinfo: IUserInfo = {
    "id": 0,
    "email": "",
    "name": "",
    "city": "",
    "active": true,
    "role": "guide",
    "member_circles": [],
    "created_circles": [],
    "created_tours": []
  };

  state: AppContextState = {
    userInfo: this.emptyUserinfo,
  };

  setUserInfo = (data: IUserInfo): void => {
    this.setState({
      userInfo: data,
    });
  };

  render(): JSX.Element {
    return (
      <Context.Provider
        value={{
          state: this.state,
          actions: {
            setUserInfo: this.setUserInfo,
          },
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

export { AppContextProvider };
export const AppConsumer = Context.Consumer;
