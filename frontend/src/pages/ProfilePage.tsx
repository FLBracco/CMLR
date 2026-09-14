import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../auth/AuthContext";
import { getMyProfile, updateMyProfile } from "../api/professionals";
import { getSpecialities } from "../api/auth";
import { ApiError } from "../api/client";
import type { ISpecialityDto } from "../types/auth";

export const ProfilePage = () => {
  const { professional, updateProfessional } = useAuth();

  const [specialities, setSpecialities] = useState<ISpecialityDto[]>([]);
  const [firstName, setFirstName] = useState(professional?.firstName ?? "");
  const [lastName, setLastName] = useState(professional?.lastName ?? "");
  const [specialityCode, setSpecialityCode] = useState(professional?.speciality ?? "");
  const [licenseNumber, setLicenseNumber] = useState(professional?.licenseNumber ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getMyProfile(), getSpecialities()])
      .then(([profile, specialityList]) => {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setSpecialityCode(profile.speciality);
        setLicenseNumber(profile.licenseNumber);
        setSpecialities(specialityList);
      })
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const updated = await updateMyProfile({ firstName, lastName, specialityCode, licenseNumber });
      updateProfessional(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-semibold text-text">Perfil</h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-text-muted">Cargando...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-lg border border-border-subtle bg-surface p-6"
          >
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-text-secondary">
                Nombre
              </label>
              <input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-text-secondary">
                Apellido
              </label>
              <input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                disabled
                value={professional?.email ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-muted"
              />
              <p className="mt-1 text-xs text-text-muted">
                El email no se puede cambiar por ahora.
              </p>
            </div>

            <div>
              <label htmlFor="speciality" className="mb-1 block text-sm font-medium text-text-secondary">
                Especialidad
              </label>
              <select
                id="speciality"
                required
                value={specialityCode}
                onChange={(e) => setSpecialityCode(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
              >
                {specialities.map((speciality) => (
                  <option key={speciality.id} value={speciality.code}>
                    {speciality.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="mb-1 block text-sm font-medium text-text-secondary">
                Matrícula profesional
              </label>
              <input
                id="licenseNumber"
                required
                minLength={3}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-text-secondary">Perfil actualizado.</p>}

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
    </AppShell>
  );
};
