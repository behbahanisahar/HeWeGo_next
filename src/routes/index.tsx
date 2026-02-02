import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../templates/layouts";
import LogIn from "../pages/login/login";
import SignUp from "../pages/signup/signup";
import Home from "../pages/home/home";
import ProfileEditableForm from "../pages/profile/profileEditableForm";
import Tour from "../pages/tour/tour";
import TourDetail from "../pages/tourDetail/tourDetail";
import ProfileContainer from "../pages/profile/profileContainer";
import MyTour from "../pages/myTour/myTour";
import CreateTour from "../pages/createTour/createTour";
import NearbyTours from "../pages/nearbyTours/nearbyTours";
import RequireAuth from "./RequireAuth";

const routeList = [
  { path: "login", element: <LogIn /> },
  { path: "register", element: <SignUp /> },
  { path: "/", element: <Home /> },
  { path: "profile", element: <ProfileContainer />, protected: true },
  { path: "profile/edit", element: <ProfileEditableForm />, protected: true },
  { path: "tour/create", element: <CreateTour />, protected: true },
  { path: "tour/nearby", element: <NearbyTours />, protected: true },
  { path: "tour/:id", element: <TourDetail /> },
  { path: "tour", element: <Tour /> },
  { path: "mytour", element: <MyTour />, protected: true },
];

const RenderRouter: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        {routeList
          .filter((r) => !r.protected)
          .map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          {routeList
            .filter((r) => r.protected)
            .map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default RenderRouter;
