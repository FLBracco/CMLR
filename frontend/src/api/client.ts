const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

const TOKEN_STORAGE_KEY = "cmlr.token";

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

type UnauthorizedListener = () => void;

let unauthorizedListener: UnauthorizedListener | null = null;

export const setUnauthorizedListener = (
  listener: UnauthorizedListener | null
): void => {
  unauthorizedListener = listener;
};

interface IApiErrorBody {
  error: {
    message: string;
    details?: unknown;
  };
}

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getStoredToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as IApiErrorBody | null;

    if (response.status === 401 && token) {
      unauthorizedListener?.();
    }

    throw new ApiError(
      response.status,
      errorBody?.error?.message ?? "Ocurrió un error inesperado.",
      errorBody?.error?.details
    );
  }

  return body as T;
};
