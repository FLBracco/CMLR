import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Wordmark } from "../Wordmark";

const NAV_ITEMS = [
  { to: "/admin/profesionales", label: "Profesionales" },
  { to: "/admin/configuracion", label: "Configuración" },
];

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await adminLogout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-subtle bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
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
        </div>

        <nav className="mt-4 flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
};
