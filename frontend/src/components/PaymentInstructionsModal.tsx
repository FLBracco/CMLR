import { useEffect } from "react";
import type { ISubscriptionSettings } from "../types/subscriptionSettings";

interface IPaymentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ISubscriptionSettings | null;
  professionalName: string;
  licenseNumber: string;
}

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border-subtle bg-background px-3 py-2">
    <p className="text-xs text-text-muted">{label}</p>
    <p className="text-sm font-medium text-text">{value}</p>
  </div>
);

export const PaymentInstructionsModal = ({
  isOpen,
  onClose,
  settings,
  professionalName,
  licenseNumber,
}: IPaymentInstructionsModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sin alias/CBU y sin WhatsApp configurados todavía, no hay nada útil que
  // mostrar — evita instrucciones a medias con campos en blanco.
  const isConfigured = Boolean(settings?.alias || settings?.cbu) && Boolean(settings?.whatsappNumber);

  const whatsappMessage = `Hola! Soy ${professionalName}, matrícula ${licenseNumber}. Te envío el comprobante de mi suscripción a ClinicAR.`;
  const whatsappUrl = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : "#";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        className="relative w-full max-w-sm rounded-lg border border-border-subtle bg-surface p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 id="payment-modal-title" className="mb-1 text-xl font-semibold text-text">
          Activá tu cuenta
        </h1>

        {!isConfigured ? (
          <p className="mt-4 text-sm text-text-secondary">
            Todavía no cargamos los datos de pago. Contactá al administrador para activar tu
            cuenta.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-secondary">
              Hacé la transferencia y enviános el comprobante por WhatsApp junto con tu
              matrícula para activar tu cuenta.
            </p>

            <div className="space-y-2">
              {settings?.monthlyAmount != null && (
                <Field label="Cuota mensual" value={formatAmount(settings.monthlyAmount)} />
              )}
              {settings?.alias && <Field label="Alias" value={settings.alias} />}
              {settings?.cbu && <Field label="CBU/CVU" value={settings.cbu} />}
              {settings?.accountHolderName && (
                <Field label="Titular" value={settings.accountHolderName} />
              )}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
            >
              Enviar comprobante por WhatsApp
            </a>
            <p className="mt-2 text-center text-xs text-text-muted">
              Adjuntá la foto o captura del comprobante en el chat de WhatsApp.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
