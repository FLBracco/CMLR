import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Wordmark } from "../Wordmark";

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border-subtle bg-surface px-6 py-4">
        <span className="text-lg font-semibold text-text">
          <Wordmark /> <span className="text-text-muted">· SuperAdmin</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">{admin?.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-destructive hover:bg-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
};
