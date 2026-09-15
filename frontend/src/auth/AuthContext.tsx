import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import * as adminApi from "../api/admin";
import {
  ApiError,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  setUnauthorizedListener,
} from "../api/client";
import type {
  AuthRole,
  ILoginPayload,
  IProfessional,
  IRegisterPayload,
} from "../types/auth";
import type { IAdmin, IAdminLoginPayload } from "../types/admin";

const SESSION_STORAGE_KEY = "cmlr.session";

// Una sola sesión activa por navegador: un profesional y un SuperAdmin no
// conviven en la misma pestaña (si hace falta, ventana de incógnito aparte).
type Session =
  | { role: "professional"; professional: IProfessional }
  | { role: "superadmin"; admin: IAdmin };

interface IAuthContext {
  session: Session | null;
  professional: IProfessional | null;
  admin: IAdmin | null;
  role: AuthRole | null;
  isAuthenticated: boolean;
  login: (payload: ILoginPayload) => Promise<AuthRole>;
  register: (payload: IRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  adminLogin: (payload: IAdminLoginPayload) => Promise<void>;
  adminLogout: () => Promise<void>;
  updateProfessional: (professional: IProfessional) => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

const readStoredSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(() =>
    getStoredToken() ? readStoredSession() : null
  );

  const persistSession = useCallback((token: string, next: Session) => {
    setStoredToken(token);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  const adminLogin = useCallback(
    async (payload: IAdminLoginPayload) => {
      const result = await adminApi.adminLogin(payload);
      persistSession(result.token, {
        role: "superadmin",
        admin: result.admin,
      });
    },
    [persistSession]
  );

  // Un solo formulario de login para profesional y SuperAdmin: se prueba
  // primero como profesional y, sólo si las credenciales no corresponden a
  // ninguna cuenta profesional, se reintenta como SuperAdmin.
  const login = useCallback(
    async (payload: ILoginPayload): Promise<AuthRole> => {
      try {
        const result = await authApi.login(payload);
        persistSession(result.token, {
          role: "professional",
          professional: result.professional,
        });
        return "professional";
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await adminLogin(payload);
          return "superadmin";
        }
        throw err;
      }
    },
    [persistSession, adminLogin]
  );

  const register = useCallback(
    async (payload: IRegisterPayload) => {
      const result = await authApi.register(payload);
      persistSession(result.token, {
        role: "professional",
        professional: result.professional,
      });
    },
    [persistSession]
  );

  const updateProfessional = useCallback((professional: IProfessional) => {
    const next: Session = { role: "professional", professional };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const adminLogout = useCallback(async () => {
    try {
      await adminApi.adminLogout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedListener(() => clearSession());
    return () => setUnauthorizedListener(null);
  }, [clearSession]);

  const professional =
    session?.role === "professional" ? session.professional : null;
  const admin = session?.role === "superadmin" ? session.admin : null;

  const value = useMemo<IAuthContext>(
    () => ({
      session,
      professional,
      admin,
      role: session?.role ?? null,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
      adminLogin,
      adminLogout,
      updateProfessional,
    }),
    [
      session,
      professional,
      admin,
      login,
      register,
      logout,
      adminLogin,
      adminLogout,
      updateProfessional,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
};
