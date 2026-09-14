import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { PaymentInstructionsModal } from "../components/PaymentInstructionsModal";
import { useAuth } from "../auth/AuthContext";
import { getSubscriptionSettings } from "../api/subscriptionSettings";
import type { SubscriptionStatus } from "../types/auth";
import type { ISubscriptionSettings } from "../types/subscriptionSettings";

const STATUS_CONTENT: Record<
  SubscriptionStatus,
  { label: string; badgeClassName: string; body: string }
> = {
  PENDING: {
    label: "Pendiente de activación",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    body: "Tu registro fue recibido. Vamos a activar tu cuenta a la brevedad — vas a poder registrar pacientes y consultas apenas quede activa.",
  },
  ACTIVE: {
    label: "Activa",
    badgeClassName: "border-green-200 bg-green-50 text-green-700",
    body: "Tu suscripción está al día. Tenés acceso completo a pacientes y consultas.",
  },
  DISABLED: {
    label: "Desactivada",
    badgeClassName: "border-red-200 bg-red-50 text-destructive",
    body: "Tu suscripción fue desactivada y perdiste el acceso a pacientes y consultas. Contactá al administrador para reactivarla.",
  },
};

export const SubscriptionPage = () => {
  const { professional } = useAuth();
  const status = professional?.subscriptionStatus ?? "PENDING";
  const content = STATUS_CONTENT[status];
  const needsActivation = status !== "ACTIVE";

  const [settings, setSettings] = useState<ISubscriptionSettings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!needsActivation) return;

    getSubscriptionSettings()
      .then((result) => {
        setSettings(result);
        setIsModalOpen(true);
      })
      .catch(() => {
        // Sin datos de pago no hay modal que mostrar — el estado de la
        // suscripción sigue visible en la página igual.
      });
  }, [needsActivation]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-text">Suscripción</h2>

        <div className="rounded-lg border border-border-subtle bg-surface p-6">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${content.badgeClassName}`}
          >
            {content.label}
          </span>
          <p className="mt-4 text-sm text-text-secondary">{content.body}</p>

          {needsActivation && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
            >
              Ver cómo activar mi cuenta
            </button>
          )}
        </div>
      </div>

      {professional && (
        <PaymentInstructionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          settings={settings}
          professionalName={`${professional.firstName} ${professional.lastName}`}
          licenseNumber={professional.licenseNumber}
        />
      )}
    </AppShell>
  );
};
