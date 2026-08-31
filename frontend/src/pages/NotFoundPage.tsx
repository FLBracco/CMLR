import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
    <p className="text-lg text-text-secondary">Página no encontrada.</p>
    <Link to="/dashboard" className="text-sm text-text-tertiary underline">
      Volver al dashboard
    </Link>
  </div>
);
