import { useState, type FormEvent } from "react";
import type { IPatient, IPatientPayload } from "../types/patient";

interface IPatientFormProps {
  initialValues?: IPatient;
  onSubmit: (payload: IPatientPayload) => Promise<void>;
  onCancel: () => void;
}

export const PatientForm = ({
  initialValues,
  onSubmit,
  onCancel,
}: IPatientFormProps) => {
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? "");
  const [lastName, setLastName] = useState(initialValues?.lastName ?? "");
  const [dni, setDni] = useState(initialValues?.dni ?? "");
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        firstName,
        lastName,
        dni,
        birthDate,
        phone,
        ...(email ? { email } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el paciente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-border-subtle bg-surface p-6 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-text-secondary">
          Nombre
        </label>
        <input
          id="firstName"
          required
          minLength={2}
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
          minLength={2}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="dni" className="mb-1 block text-sm font-medium text-text-secondary">
          DNI
        </label>
        <input
          id="dni"
          required
          pattern="[0-9.]+"
          title="Solo números y puntos"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-text-secondary">
          Fecha de nacimiento
        </label>
        <input
          id="birthDate"
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-text-secondary">
          Teléfono
        </label>
        <input
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
          Email (opcional)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-border-focus focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
