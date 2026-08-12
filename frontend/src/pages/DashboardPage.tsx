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
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">Pacientes</h2>
          <button
            onClick={() => setIsCreating((current) => !current)}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {isCreating ? "Cerrar formulario" : "Nuevo paciente"}
          </button>
        </div>

        {isCreating && (
          <div className="mb-6">
            <PatientForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
          <input
            type="search"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Buscar
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando pacientes...</p>
        ) : patients.length === 0 ? (
          <p className="text-sm text-slate-500">No hay pacientes para mostrar.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {patients.map((patient) => (
              <li key={patient.id}>
                <Link
                  to={`/pacientes/${patient.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {patient.lastName}, {patient.firstName}
                  </span>
                  <span className="text-sm text-slate-500">DNI {patient.dni}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
