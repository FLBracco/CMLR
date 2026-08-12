import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getSpecialities } from "../api/auth";
import { ApiError } from "../api/client";
import type { ISpecialityDto } from "../types/auth";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [specialities, setSpecialities] = useState<ISpecialityDto[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialityCode, setSpecialityCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSpecialities()
      .then((result) => {
        setSpecialities(result);
        setSpecialityCode((current) => current || result[0]?.code || "");
      })
      .catch(() => setError("No se pudieron cargar las especialidades."));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ firstName, lastName, email, password, specialityCode });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo completar el registro."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-800">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
              Apellido
            </label>
            <input
              id="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="speciality" className="mb-1 block text-sm font-medium text-slate-700">
              Especialidad
            </label>
            <select
              id="speciality"
              required
              value={specialityCode}
              onChange={(e) => setSpecialityCode(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {specialities.map((speciality) => (
                <option key={speciality.id} value={speciality.code}>
                  {speciality.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-slate-800 underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
