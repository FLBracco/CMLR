import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLoginModal } from "../auth/LoginModalContext";
import { ApiError } from "../api/client";

export const LoginModal = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isOpen, redirectTo, closeLoginModal } = useLoginModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Limpiar el formulario cada vez que se abre, y bloquear el scroll del fondo.
    setEmail("");
    setPassword("");
    setError(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLoginModal();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeLoginModal]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      closeLoginModal();
      navigate(redirectTo ?? "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={closeLoginModal}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8"
      >
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Cerrar"
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 id="login-modal-title" className="mb-6 text-center text-2xl font-semibold text-text">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-modal-email"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="login-modal-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-modal-password"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Contraseña
            </label>
            <input
              id="login-modal-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary transition-colors py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground active:bg-primary-active active:text-primary-hover-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-text-tertiary">
          ¿No tenés cuenta?{" "}
          <Link to="/registro" onClick={closeLoginModal} className="font-medium text-text underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
};
