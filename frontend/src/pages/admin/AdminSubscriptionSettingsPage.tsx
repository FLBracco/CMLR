import { useEffect, useState, type FormEvent } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import {
  getAdminSubscriptionSettings,
  updateAdminSubscriptionSettings,
} from "../../api/subscriptionSettings";
import { ApiError } from "../../api/client";

const inputClassName =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none";
const labelClassName = "mb-1 block text-sm font-medium text-text-secondary";
const sectionHeadingClassName = "text-sm font-semibold text-text";

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
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text">Configuración</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Estos datos son los que ven los profesionales para pagar y activar su cuenta.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-tertiary">Cargando...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border border-border-subtle bg-surface p-6 shadow-sm"
          >
            <div>
              <h2 className={sectionHeadingClassName}>Precio de la suscripción</h2>
              <div className="mt-3 max-w-xs">
                <label htmlFor="monthlyAmount" className={labelClassName}>
                  Cuota mensual (ARS)
                </label>
                <input
                  id="monthlyAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h2 className={sectionHeadingClassName}>Datos para la transferencia</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="alias" className={labelClassName}>
                    Alias
                  </label>
                  <input
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="cbu" className={labelClassName}>
                    CBU/CVU
                  </label>
                  <input
                    id="cbu"
                    value={cbu}
                    onChange={(e) => setCbu(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="accountHolderName" className={labelClassName}>
                  Titular de la cuenta
                </label>
                <input
                  id="accountHolderName"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h2 className={sectionHeadingClassName}>Contacto por WhatsApp</h2>
              <div className="mt-3">
                <label htmlFor="whatsappNumber" className={labelClassName}>
                  Número (solo dígitos, con código de país)
                </label>
                <input
                  id="whatsappNumber"
                  placeholder="5493815551234"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={inputClassName}
                />
                <p className="mt-1 text-xs text-text-muted">
                  Sin "+", espacios ni guiones. Ej: 54 (Argentina) + 9 + código de área + número.
                </p>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                Configuración guardada.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-confirm transition-colors px-4 py-2 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover hover:text-confirm-hover-foreground active:bg-confirm-active active:text-confirm-hover-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>
    </AdminShell>
  );
};
