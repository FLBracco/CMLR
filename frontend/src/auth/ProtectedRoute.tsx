import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLoginModal } from "./LoginModalContext";
import type { AuthRole } from "../types/auth";

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
  const { openLoginModal } = useLoginModal();

  const isAuthorized = Boolean(session && session.role === role);

  // El login de profesional es un modal global (no una ruta): en vez de navegar
  // a una URL de login, se abre acá y se recuerda a dónde volver al loguearse.
  useEffect(() => {
    if (!isAuthorized && role === "professional") {
      openLoginModal(location.pathname);
    }
  }, [isAuthorized, role, location.pathname, openLoginModal]);

  if (!isAuthorized) {
    if (role === "superadmin") {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
