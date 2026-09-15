import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import { listProfessionals, updateSubscriptionStatus } from "../../api/admin";
import { ApiError } from "../../api/client";
import type { IAdminProfessional } from "../../types/admin";
import type { SubscriptionStatus } from "../../types/auth";

const SPECIALITY_LABELS: Record<string, string> = {
  psychologist: "Psicólogo/a",
  psychiatrist: "Psiquiatra",
};

const STATUS_BADGES: Record<SubscriptionStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAYMENT_REPORTED: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  DISABLED: "border-red-200 bg-red-50 text-destructive",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  PENDING: "Sin comprobante",
  PAYMENT_REPORTED: "Comprobante enviado",
  ACTIVE: "Activa",
  DISABLED: "Desactivada",
};

const formatDate = (iso: string | null): string =>
  iso
    ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(iso))
    : "—";

export type AdminProfessionalsView = "new" | "reported" | "active";

interface IViewConfig {
  title: string;
  description: string;
  statuses: SubscriptionStatus[];
  emptyMessage: string;
  dateColumnLabel: string;
  getDate: (professional: IAdminProfessional) => string | null;
  sort: (a: IAdminProfessional, b: IAdminProfessional) => number;
}

const byCreatedAtDesc = (a: IAdminProfessional, b: IAdminProfessional) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

// FIFO: quien avisó primero se atiende primero.
const bySubscriptionUpdatedAtAsc = (a: IAdminProfessional, b: IAdminProfessional) =>
  new Date(a.subscriptionUpdatedAt ?? a.createdAt).getTime() -
  new Date(b.subscriptionUpdatedAt ?? b.createdAt).getTime();

const VIEWS: Record<AdminProfessionalsView, IViewConfig> = {
  new: {
    title: "Profesionales nuevos",
    description: "Recién registrados, todavía sin comprobante de pago.",
    statuses: ["PENDING"],
    emptyMessage: "No hay profesionales nuevos.",
    dateColumnLabel: "Alta",
    getDate: (p) => p.createdAt,
    sort: byCreatedAtDesc,
  },
  reported: {
    title: "Por activar",
    description:
      "Ya avisaron que enviaron el comprobante. Verificá el pago y activá la cuenta.",
    statuses: ["PAYMENT_REPORTED"],
    emptyMessage: "No hay comprobantes esperando verificación.",
    dateColumnLabel: "Avisó",
    getDate: (p) => p.subscriptionUpdatedAt,
    sort: bySubscriptionUpdatedAtAsc,
  },
  active: {
    title: "Profesionales activos",
    description: "Gestioná bajas y reactivaciones.",
    statuses: ["ACTIVE", "DISABLED"],
    emptyMessage: "Todavía no hay profesionales activos.",
    dateColumnLabel: "Alta",
    getDate: (p) => p.createdAt,
    sort: byCreatedAtDesc,
  },
};

export const AdminProfessionalsPage = ({ view }: { view: AdminProfessionalsView }) => {
  const config = VIEWS[view];

  const [professionals, setProfessionals] = useState<IAdminProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadProfessionals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listProfessionals();
      setProfessionals(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cargar el listado de profesionales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfessionals();
  }, []);

  // Al cambiar de vista (nuevos/por activar/activos) el buscador arranca vacío otra vez.
  useEffect(() => {
    setSearch("");
  }, [view]);

  const handleChangeStatus = async (
    professional: IAdminProfessional,
    status: SubscriptionStatus,
    confirmMessage?: string
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setPendingId(professional.id);
    setError(null);

    try {
      const updated = await updateSubscriptionStatus(professional.id, status);
      setProfessionals((current) =>
        current.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el estado de la suscripción."
      );
    } finally {
      setPendingId(null);
    }
  };

  const renderActions = (professional: IAdminProfessional) => {
    const disabled = pendingId === professional.id;
    const fullName = `${professional.firstName} ${professional.lastName}`;

    if (professional.subscriptionStatus === "PENDING") {
      return (
        <button
          disabled={disabled}
          onClick={() => handleChangeStatus(professional, "ACTIVE")}
          className="rounded-lg bg-confirm px-3 py-1.5 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover disabled:opacity-50"
        >
          Activar
        </button>
      );
    }

    if (professional.subscriptionStatus === "PAYMENT_REPORTED") {
      return (
        <div className="flex items-center gap-2">
          <button
            disabled={disabled}
            onClick={() => handleChangeStatus(professional, "ACTIVE")}
            className="rounded-lg bg-confirm px-3 py-1.5 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover disabled:opacity-50"
          >
            Activar
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              handleChangeStatus(
                professional,
                "PENDING",
                `¿Volver a ${fullName} a "Nuevos"? Usá esto si el comprobante no era válido o nunca llegó.`
              )
            }
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50"
          >
            Volver a nuevos
          </button>
        </div>
      );
    }

    if (professional.subscriptionStatus === "ACTIVE") {
      return (
        <button
          disabled={disabled}
          onClick={() =>
            handleChangeStatus(
              professional,
              "DISABLED",
              `¿Desactivar la suscripción de ${fullName}? Va a perder acceso a pacientes y consultas.`
            )
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-red-100 disabled:opacity-50"
        >
          Desactivar
        </button>
      );
    }

    return (
      <button
        disabled={disabled}
        onClick={() => handleChangeStatus(professional, "ACTIVE")}
        className="rounded-lg bg-confirm px-3 py-1.5 text-sm font-medium text-confirm-foreground hover:bg-confirm-hover disabled:opacity-50"
      >
        Reactivar
      </button>
    );
  };

  // Búsqueda 100% client-side: el listado ya viene completo de `listProfessionals()`,
  // no hace falta un endpoint de búsqueda para esto. Prioriza matrícula porque es
  // el dato que llega por WhatsApp junto con el comprobante — así se activa rápido
  // sin tener que adivinar por nombre/email.
  const viewProfessionals = useMemo(
    () =>
      professionals
        .filter((p) => config.statuses.includes(p.subscriptionStatus))
        .sort(config.sort),
    [professionals, config]
  );

  const filteredProfessionals = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return viewProfessionals;

    return viewProfessionals.filter((professional) => {
      const fullName = `${professional.firstName} ${professional.lastName}`.toLowerCase();
      return (
        professional.licenseNumber.toLowerCase().includes(term) ||
        fullName.includes(term) ||
        professional.email.toLowerCase().includes(term)
      );
    });
  }, [viewProfessionals, search]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">{config.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {config.description}
          {!isLoading && viewProfessionals.length > 0 && (
            <span className="text-text-muted"> · {viewProfessionals.length}</span>
          )}
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="mb-4 max-w-sm">
        <input
          type="search"
          placeholder="Buscar por matrícula, nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-text-tertiary">Cargando...</p>
      ) : viewProfessionals.length === 0 ? (
        <p className="text-sm text-text-tertiary">{config.emptyMessage}</p>
      ) : filteredProfessionals.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          No se encontraron profesionales para "{search}".
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Especialidad</th>
                <th className="px-4 py-3 font-medium">{config.dateColumnLabel}</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.map((professional) => (
                <tr
                  key={professional.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-4 py-3 text-text">
                    {professional.firstName} {professional.lastName}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {professional.licenseNumber}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {professional.email}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {SPECIALITY_LABELS[professional.speciality] ??
                      professional.speciality}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(config.getDate(professional))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGES[professional.subscriptionStatus]
                      }`}
                    >
                      {STATUS_LABELS[professional.subscriptionStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{renderActions(professional)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
};
