import rateLimit from "express-rate-limit";

// Instancias separadas por endpoint: si compartieran una sola instancia, los
// intentos contra /api/auth/login y /api/admin/auth/login se contarían
// juntos por IP, penalizando a un rol por los intentos del otro.
export const createLoginRateLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Demasiados intentos. Probá de nuevo en unos minutos.",
      },
    },
  });
