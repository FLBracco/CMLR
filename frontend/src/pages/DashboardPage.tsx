import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PatientForm } from "../components/PatientForm";
import { createPatient, listPatients } from "../api/patients";
import { ApiError } from "../api/client";
import type { IPatient, IPatientPayload } from "../types/patient";

export const DashboardPage = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPatients = useCallback(async (term?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listPatients(term || undefined);
      setPatients(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cargar el listado de pacientes."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchPatients(search);
  };

  const handleCreate = async (payload: IPatientPayload) => {
    await createPatient(payload);
    setIsCreating(false);
    await fetchPatients(search);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-text">Pacientes</h2>
          <button
            onClick={() => setIsCreating((current) => !current)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {isCreating ? "Cerrar formulario" : "Nuevo paciente"}
          </button>
        </div>

        {isCreating && (
          <div className="mb-6">
            <PatientForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none sm:max-w-sm"
          />
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
          >
            Buscar
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

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
          <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface">
            {patients.map((patient) => (
              <li key={patient.id}>
                <Link
                  to={`/pacientes/${patient.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-background"
                >
                  <span className="text-sm font-medium text-text">
                    {patient.lastName}, {patient.firstName}
                  </span>
                  <span className="text-sm text-text-muted">DNI {patient.dni}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
