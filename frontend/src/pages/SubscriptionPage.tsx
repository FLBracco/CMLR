import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { PaymentInstructionsModal } from "../components/PaymentInstructionsModal";
import { useAuth } from "../auth/AuthContext";
import { getSubscriptionSettings } from "../api/subscriptionSettings";
import { reportSubscriptionPayment } from "../api/professionals";
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
  PAYMENT_REPORTED: {
    label: "Comprobante enviado",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    body: "Recibimos tu aviso de pago. Estamos verificando el comprobante para activar tu cuenta.",
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
  const { professional, updateProfessional } = useAuth();
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
        // A quien ya avisó que mandó el comprobante no le vuelve a saltar el
        // modal en la cara en cada visita — solo a quien todavía no hizo nada.
        if (status === "PENDING") setIsModalOpen(true);
      })
      .catch(() => {
        // Sin datos de pago no hay modal que mostrar — el estado de la
        // suscripción sigue visible en la página igual.
      });
  }, [needsActivation, status]);

  const handleReportPayment = () => {
    reportSubscriptionPayment()
      .then(updateProfessional)
      .catch(() => {
        // El link de WhatsApp ya se abrió igual, y el admin puede activar desde
        // "Nuevos" sin depender de este aviso — un fallo acá no bloquea a nadie.
      });
  };

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
          subscriptionStatus={status}
          onReportPayment={handleReportPayment}
        />
      )}
    </AppShell>
  );
};
