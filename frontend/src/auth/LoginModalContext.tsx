import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ILoginModalContext {
  isOpen: boolean;
  /** Ruta a la que navegar después de un login exitoso (ej. la página protegida que el usuario quería ver) */
  redirectTo: string | null;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<ILoginModalContext | null>(null);

export const LoginModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const openLoginModal = useCallback((target?: string) => {
    setRedirectTo(target ?? null);
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
    setRedirectTo(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, redirectTo, openLoginModal, closeLoginModal }),
    [isOpen, redirectTo, openLoginModal, closeLoginModal]
  );

  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>;
};

export const useLoginModal = (): ILoginModalContext => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal debe usarse dentro de LoginModalProvider");
  }
  return context;
};
