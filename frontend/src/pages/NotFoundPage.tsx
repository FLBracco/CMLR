import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
    <p className="text-lg text-slate-700">Página no encontrada.</p>
    <Link to="/dashboard" className="text-sm text-slate-600 underline">
      Volver al dashboard
    </Link>
  </div>
);
