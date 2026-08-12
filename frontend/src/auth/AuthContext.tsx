import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../api/client";
import type {
  ILoginPayload,
  IProfessional,
  IRegisterPayload,
} from "../types/auth";

const PROFESSIONAL_STORAGE_KEY = "cmlr.professional";

interface IAuthContext {
  professional: IProfessional | null;
  isAuthenticated: boolean;
  login: (payload: ILoginPayload) => Promise<void>;
  register: (payload: IRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

const readStoredProfessional = (): IProfessional | null => {
  const raw = localStorage.getItem(PROFESSIONAL_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as IProfessional) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [professional, setProfessional] = useState<IProfessional | null>(
    () => (getStoredToken() ? readStoredProfessional() : null)
  );

  const persistSession = useCallback((token: string, prof: IProfessional) => {
    setStoredToken(token);
    localStorage.setItem(PROFESSIONAL_STORAGE_KEY, JSON.stringify(prof));
    setProfessional(prof);
  }, []);

  const login = useCallback(
    async (payload: ILoginPayload) => {
      const result = await authApi.login(payload);
      persistSession(result.token, result.professional);
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload: IRegisterPayload) => {
      const result = await authApi.register(payload);
      persistSession(result.token, result.professional);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearStoredToken();
      localStorage.removeItem(PROFESSIONAL_STORAGE_KEY);
      setProfessional(null);
    }
  }, []);

  const value = useMemo<IAuthContext>(
    () => ({
      professional,
      isAuthenticated: professional !== null,
      login,
      register,
      logout,
    }),
    [professional, login, register, logout]
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
