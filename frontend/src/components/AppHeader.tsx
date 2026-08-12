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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-slate-800">CMLR</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          {professional?.firstName} {professional?.lastName}
        </span>
        <button
          onClick={handleLogout}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};
