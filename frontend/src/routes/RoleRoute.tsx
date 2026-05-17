import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

export const RoleRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};