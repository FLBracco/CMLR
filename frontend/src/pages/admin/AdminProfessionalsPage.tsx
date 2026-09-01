import { useEffect, useState } from "react";
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
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  DISABLED: "border-red-200 bg-red-50 text-destructive",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  PENDING: "Pendiente",
  ACTIVE: "Activa",
  DISABLED: "Desactivada",
};

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    new Date(iso)
  );

export const AdminProfessionalsPage = () => {
  const [professionals, setProfessionals] = useState<IAdminProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

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

  const handleChangeStatus = async (
    professional: IAdminProfessional,
    status: SubscriptionStatus
  ) => {
    if (
      status === "DISABLED" &&
      !window.confirm(
        `¿Desactivar la suscripción de ${professional.firstName} ${professional.lastName}? Va a perder acceso a pacientes y consultas.`
      )
    ) {
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

    if (professional.subscriptionStatus === "ACTIVE") {
      return (
        <button
          disabled={disabled}
          onClick={() => handleChangeStatus(professional, "DISABLED")}
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

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-semibold text-text">Profesionales</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-text-tertiary">Cargando...</p>
      ) : professionals.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          Todavía no hay profesionales registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Especialidad</th>
                <th className="px-4 py-3 font-medium">Alta</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((professional) => (
                <tr
                  key={professional.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-4 py-3 text-text">
                    {professional.firstName} {professional.lastName}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {professional.email}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {SPECIALITY_LABELS[professional.speciality] ??
                      professional.speciality}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(professional.createdAt)}
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
