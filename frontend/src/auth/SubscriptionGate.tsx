import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AppShell } from "../components/AppShell";
import type { SubscriptionStatus } from "../types/auth";

const BLOCKED_MESSAGES: Partial<
  Record<SubscriptionStatus, { title: string; body: string }>
> = {
  PENDING: {
    title: "Tu cuenta está pendiente de activación",
    body: "Tu registro fue recibido pero todavía no activamos tu suscripción. Te vamos a avisar apenas quede lista.",
  },
  DISABLED: {
    title: "Tu suscripción está desactivada",
    body: "Perdiste el acceso a pacientes y consultas. Contactá al administrador para reactivarla.",
  },
};

export const SubscriptionGate = ({ children }: { children: ReactNode }) => {
  const { professional } = useAuth();

  const message = professional
    ? BLOCKED_MESSAGES[professional.subscriptionStatus]
    : undefined;

  if (!message) {
    return <>{children}</>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <h2 className="text-xl font-semibold text-text">{message.title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{message.body}</p>
          <Link
            to="/suscripcion"
            className="mt-4 inline-block text-sm font-medium text-text underline"
          >
            Ver estado de mi suscripción
          </Link>
        </div>
      </div>
    </AppShell>
  );
};
