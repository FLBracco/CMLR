import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const AppHeader = () => {
  const { professional, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-border-subtle bg-surface px-6 py-4">
      <h1 className="text-lg font-semibold text-text">CMLR</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-text-tertiary sm:inline">
          {professional?.firstName} {professional?.lastName}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};
