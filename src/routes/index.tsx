import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../templates/layouts";
import LogIn from "@/pages/login/login";
import SignUp from "@/pages/signup/signup";
import Home from "@/pages/home/home";
import ProfileEditableForm from "@/pages/profile/profileEditableForm";
import Tour from "@/pages/tour/tour";
import ProfileContainer from "@/pages/profile/profileContainer";
import MyTour from "@/pages/myTour/myTour";

const routeList = [
  { path: "login", element: <LogIn /> },
  { path: "register", element: <SignUp /> },
  { path: "/", element: <Home /> },
  { path: "profile", element: <ProfileContainer /> },
  { path: "profile/edit", element: <ProfileEditableForm /> },
  { path: "tour", element: <Tour /> },
  { path: "mytour", element: <MyTour /> },
  { path: "tour/:page?/:per_page?", element: <Tour /> },
];

const RenderRouter: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {routeList.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
};

export default RenderRouter;
