import { Navigate, Outlet } from "react-router-dom";

import { Spinner } from "../components/common/Spinner";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <Spinner />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};