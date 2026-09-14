import { useEffect, useState, type FormEvent } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import {
  getAdminSubscriptionSettings,
  updateAdminSubscriptionSettings,
} from "../../api/subscriptionSettings";
import { ApiError } from "../../api/client";

export const AdminSubscriptionSettingsPage = () => {
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [alias, setAlias] = useState("");
  const [cbu, setCbu] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAdminSubscriptionSettings()
      .then((settings) => {
        setMonthlyAmount(settings.monthlyAmount != null ? String(settings.monthlyAmount) : "");
        setAlias(settings.alias ?? "");
        setCbu(settings.cbu ?? "");
        setAccountHolderName(settings.accountHolderName ?? "");
        setWhatsappNumber(settings.whatsappNumber ?? "");
      })
      .catch(() => setError("No se pudo cargar la configuración."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const updated = await updateAdminSubscriptionSettings({
        ...(monthlyAmount !== "" && { monthlyAmount: Number(monthlyAmount) }),
        alias,
        cbu,
        accountHolderName,
        whatsappNumber,
      });
      setMonthlyAmount(updated.monthlyAmount != null ? String(updated.monthlyAmount) : "");
      setAlias(updated.alias ?? "");
      setCbu(updated.cbu ?? "");
      setAccountHolderName(updated.accountHolderName ?? "");
      setWhatsappNumber(updated.whatsappNumber ?? "");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la configuración.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-semibold text-text">Configuración de suscripción</h1>

      {isLoading ? (
        <p className="text-sm text-text-tertiary">Cargando...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg space-y-4 rounded-lg border border-border-subtle bg-surface p-6"
        >
          <p className="text-sm text-text-muted">
            Estos datos son los que ven los profesionales para pagar y activar su cuenta.
          </p>

          <div>
            <label htmlFor="monthlyAmount" className="mb-1 block text-sm font-medium text-text-secondary">
              Cuota mensual (ARS)
            </label>
            <input
              id="monthlyAmount"
              type="number"
              min={0}
              step="0.01"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="alias" className="mb-1 block text-sm font-medium text-text-secondary">
              Alias
            </label>
            <input
              id="alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cbu" className="mb-1 block text-sm font-medium text-text-secondary">
              CBU/CVU
            </label>
            <input
              id="cbu"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="accountHolderName" className="mb-1 block text-sm font-medium text-text-secondary">
              Titular de la cuenta
            </label>
            <input
              id="accountHolderName"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="whatsappNumber" className="mb-1 block text-sm font-medium text-text-secondary">
              WhatsApp (solo números, con código de país)
            </label>
            <input
              id="whatsappNumber"
              placeholder="5493815551234"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
            />
            <p className="mt-1 text-xs text-text-muted">
              Sin "+", espacios ni guiones. Ej: 54 (Argentina) + 9 + código de área + número.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-text-secondary">Configuración guardada.</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-confirm transition-colors px-4 py-2 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover hover:text-confirm-hover-foreground active:bg-confirm-active active:text-confirm-hover-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </AdminShell>
  );
};
