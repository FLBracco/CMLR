import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PatientForm } from "../components/PatientForm";
import { createPatient, listPatients } from "../api/patients";
import { getConsultationStats } from "../api/consultations";
import { ApiError } from "../api/client";
import type { IPatient, IPatientPayload } from "../types/patient";
import type { IConsultationStats } from "../types/consultation";

const StatInline = ({ label, value }: { label: string; value: number | null }) => (
  <div className="flex items-center gap-2">
    <p className="text-xs text-text-muted">{label}:</p>
    <p className="text-lg font-semibold text-text">{value ?? "—"}</p>
  </div>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const SEARCH_DEBOUNCE_MS = 300;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [stats, setStats] = useState<IConsultationStats | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(() => searchParams.get("new") === "1");

  const fetchPatients = useCallback(async (term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listPatients(term || undefined);
      setPatients(result);
      if (!term) setTotalPatients(result.length);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cargar el listado de pacientes."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search, fetchPatients]);

  useEffect(() => {
    getConsultationStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (payload: IPatientPayload) => {
    await createPatient(payload);
    setIsCreating(false);
    await fetchPatients(search);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-text">Pacientes</h2>
          <button
            onClick={() => setIsCreating((current) => !current)}
            className={
              isCreating
                ? "rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                : "rounded-lg bg-primary transition-colors px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground active:bg-primary-active active:text-primary-hover-foreground"
            }
          >
            {isCreating ? "Cerrar formulario" : "Nuevo paciente"}
          </button>
        </div>

        {isCreating && (
          <div className="mb-6">
            <PatientForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          </div>
        )}

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-border-subtle bg-surface p-3 shadow-sm sm:gap-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <StatInline label="Pacientes totales" value={totalPatients} />
            <span className="hidden h-8 w-px bg-border-subtle sm:block" aria-hidden="true" />
            <StatInline label="Consultas este mes" value={stats?.consultationsThisMonth ?? null} />
            <span className="hidden h-8 w-px bg-border-subtle sm:block" aria-hidden="true" />
            <StatInline label="Consultas esta semana" value={stats?.consultationsThisWeek ?? null} />
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
              <input
                type="search"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm focus:border-border-focus focus:outline-none"
              />
            </div>
          </div>
        </div>

        {!isLoading && search && (
          <h2 className="mb-3 text-lg font-semibold text-text">
            {patients.length} paciente{patients.length === 1 ? "" : "s"} encontrado
            {patients.length === 1 ? "" : "s"}
          </h2>
        )}

        {isLoading ? (
          <p className="text-sm text-text-muted">Cargando pacientes...</p>
        ) : patients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-text-secondary">
              {search
                ? `No se encontraron pacientes para "${search}".`
                : "Todavía no hay pacientes cargados."}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {search
                ? "Probá con otro nombre, apellido o DNI."
                : 'Usá el botón "Nuevo paciente" para cargar el primero.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface shadow-sm">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-border-subtle bg-surface-hover text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Paciente</th>
                  <th className="px-4 py-3 font-medium">DNI</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => navigate(`/pacientes/${patient.id}`)}
                    className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-background"
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      {patient.lastName}, {patient.firstName}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{patient.dni}</td>
                    <td className="px-4 py-3 text-text-secondary">{patient.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
};
