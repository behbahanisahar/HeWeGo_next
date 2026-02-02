import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Context } from "@/context/AppContext";

/**
 * Protects routes that require authentication.
 * If not authenticated, redirects to /login and stores the original destination in router state.
 */
export default function RequireAuth() {
  const appContext = useContext(Context);
  const location = useLocation();
  const isAuthenticated = Boolean(appContext?.state.userInfo?.id);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

