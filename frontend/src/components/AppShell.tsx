import { useState, type ReactNode, type SVGProps } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { SubscriptionStatus } from "../types/auth";

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

const PatientsIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </Icon>
);

const ProfileIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </Icon>
);

const CalendarIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </Icon>
);

const SubscriptionIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-9-10.5h18A2.25 2.25 0 0 1 21.75 8.25v9A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25v-9A2.25 2.25 0 0 1 4.5 6Z"
    />
  </Icon>
);

const PlusIcon = () => (
  <Icon strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
  disabled?: boolean;
}

const SPECIALITY_LABELS: Record<string, string> = {
  psychologist: "Psicólogo/a",
  psychiatrist: "Psiquiatra",
};

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const NAV_ITEMS: INavItem[] = [
  { label: "Pacientes", to: "/dashboard", icon: PatientsIcon },
  { label: "Perfil", to: "/perfil", icon: ProfileIcon },
  { label: "Calendario", to: "/calendario", icon: CalendarIcon },
  { label: "Suscripción", to: "/suscripcion", icon: SubscriptionIcon },
];

const SUBSCRIPTION_NAV_BADGES: Partial<
  Record<SubscriptionStatus, { label: string; className: string }>
> = {
  PENDING: { label: "Pendiente", className: "bg-amber-50 text-amber-700" },
  DISABLED: { label: "Desactivada", className: "bg-red-50 text-destructive" },
};

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { professional, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (to: string) =>
    location.pathname === to || (to === "/dashboard" && location.pathname.startsWith("/pacientes"));

  const subscriptionBadge =
    professional && professional.subscriptionStatus !== "ACTIVE"
      ? SUBSCRIPTION_NAV_BADGES[professional.subscriptionStatus]
      : undefined;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <span className="text-lg font-semibold text-text">CMLR</span>
      </div>

      <div className="px-3">
        <Link
          to="/dashboard?new=1"
          onClick={() => setIsDrawerOpen(false)}
          className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-primary transition-colors px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground active:bg-primary-active active:text-primary-hover-foreground"
        >
          <PlusIcon />
          Nuevo paciente
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <div
              key={item.to}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-muted"
            >
              <span className="flex items-center gap-3">
                <item.icon />
                {item.label}
              </span>
              <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs">
                Próximamente
              </span>
            </div>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsDrawerOpen(false)}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive(item.to)
                  ? "bg-primary transition-colors text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon />
                {item.label}
              </span>
              {item.to === "/suscripcion" && subscriptionBadge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${subscriptionBadge.className}`}
                >
                  {subscriptionBadge.label}
                </span>
              )}
            </Link>
          )
        )}
      </nav>

      <div className="border-t border-border-subtle px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary transition-colors text-sm font-semibold text-primary-foreground">
            {getInitials(professional?.firstName, professional?.lastName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {professional?.firstName} {professional?.lastName}
            </p>
            <p className="truncate text-xs text-text-muted">
              {professional?.speciality ? SPECIALITY_LABELS[professional.speciality] ?? professional.speciality : ""}
            </p>
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
        <span className="text-lg font-semibold text-text">CMLR</span>
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
