import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { AuthRole } from "../types/auth";

const LOGIN_PATH_BY_ROLE: Record<AuthRole, string> = {
  professional: "/login",
  superadmin: "/admin/login",
};

interface IProtectedRouteProps {
  children: ReactNode;
  role?: AuthRole;
}

export const ProtectedRoute = ({
  children,
  role = "professional",
}: IProtectedRouteProps) => {
  const { session } = useAuth();
  const location = useLocation();

  if (!session || session.role !== role) {
    return (
      <Navigate
        to={LOGIN_PATH_BY_ROLE[role]}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};
