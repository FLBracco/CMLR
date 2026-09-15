import { useState, type ReactNode, type SVGProps } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Wordmark } from "../Wordmark";

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
    className="h-5 w-5 shrink-0"
    {...props}
  />
);

const NewProfessionalsIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
    />
  </Icon>
);

const AwaitingActivationIcon = () => (
  <Icon>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </Icon>
);

const ActiveProfessionalsIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
    />
  </Icon>
);

const SettingsIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </Icon>
);

const MenuIcon = () => (
  <Icon>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </Icon>
);

const CloseIcon = () => (
  <Icon>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </Icon>
);

const LogoutIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3.75"
    />
  </Icon>
);

interface INavItem {
  label: string;
  to: string;
  icon: () => ReactNode;
}

const NAV_ITEMS: INavItem[] = [
  { label: "Nuevos", to: "/admin/profesionales/nuevos", icon: NewProfessionalsIcon },
  { label: "Por activar", to: "/admin/profesionales/por-activar", icon: AwaitingActivationIcon },
  { label: "Activos", to: "/admin/profesionales/activos", icon: ActiveProfessionalsIcon },
  { label: "Configuración", to: "/admin/configuracion", icon: SettingsIcon },
];

const getInitial = (email?: string) => (email?.[0] ?? "").toUpperCase();

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    await adminLogout();
  };

  const isActive = (to: string) => location.pathname === to;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <span className="text-lg font-semibold text-text">
          <Wordmark /> <span className="text-text-muted">· SuperAdmin</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
              isActive(item.to)
                ? "bg-primary transition-colors text-primary-foreground"
                : "text-text-secondary hover:bg-surface-hover"
            }`}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border-subtle px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary transition-colors text-sm font-semibold text-primary-foreground">
            {getInitial(admin?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{admin?.email}</p>
            <p className="truncate text-xs text-text-muted">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-destructive hover:bg-red-100"
        >
          <LogoutIcon />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background sm:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border-subtle bg-surface sm:block">
        {sidebarContent}
      </aside>

      <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 sm:hidden">
        <span className="text-lg font-semibold text-text">
          <Wordmark /> <span className="text-text-muted">· SuperAdmin</span>
        </span>
        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover"
        >
          <MenuIcon />
        </button>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border-subtle bg-surface">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover"
              >
                <CloseIcon />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
};
