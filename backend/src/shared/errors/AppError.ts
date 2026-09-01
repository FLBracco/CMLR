export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }

  public static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, message, details);
  }

  public static unauthorized(message = "No autorizado."): AppError {
    return new AppError(401, message);
  }

  public static forbidden(
    message = "Acceso denegado.",
    details?: unknown
  ): AppError {
    return new AppError(403, message, details);
  }

  public static notFound(message = "Recurso no encontrado."): AppError {
    return new AppError(404, message);
  }

  public static conflict(message: string): AppError {
    return new AppError(409, message);
  }
}
