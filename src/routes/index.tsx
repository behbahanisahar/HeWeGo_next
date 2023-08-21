import { FC } from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import Layout from "../templates/layouts";
import LogIn from "../pages/login/login";
import SignUp from "../pages/signup/signup";
import Home from "../pages/home/home";

const routeList: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: <LogIn />,
      },
      {
        path: "/register",
        element: <SignUp />,
      },
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
];

const RenderRouter: FC = () => {
  const element = useRoutes(routeList);
  return element;
};

export default RenderRouter;
