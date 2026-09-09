import { Link } from "react-router-dom";
import type { ReactNode, SVGProps } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLoginModal } from "../auth/LoginModalContext";
import { Wordmark } from "../components/Wordmark";

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
    {...props}
  />
);

const ClinicalRecordIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 10.5h3.75m-7.5 3h4.5M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </Icon>
);

const CalendarIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </Icon>
);

const SearchIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </Icon>
);

const ShieldIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
    />
  </Icon>
);

const FolderIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0v6a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-6m-19.5 0h19.5M6 9.75V6.75a2.25 2.25 0 0 1 2.25-2.25h3.879a1.5 1.5 0 0 1 1.06.44l1.5 1.5a1.5 1.5 0 0 0 1.06.44H18a2.25 2.25 0 0 1 2.25 2.25v3"
    />
  </Icon>
);

const ClockIcon = () => (
  <Icon>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </Icon>
);

const HourglassIcon = () => (
  <Icon>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3h10.5M6.75 21h10.5M6.75 3c0 5.25 5.25 6.75 5.25 9s-5.25 3.75-5.25 9m10.5-18c0 5.25-5.25 6.75-5.25 9s5.25 3.75 5.25 9"
    />
  </Icon>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-4 w-4 shrink-0 text-accent-600"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

interface IFeature {
  icon: () => ReactNode;
  title: string;
  description: string;
}

const FEATURES: IFeature[] = [
  {
    icon: ClinicalRecordIcon,
    title: "Historia clínica digital",
    description:
      "Cargá y consultá el historial completo de cada paciente desde un solo lugar, sin planillas sueltas ni papeles.",
  },
  {
    icon: CalendarIcon,
    title: "Agenda de turnos",
    description:
      "Visualizá tu semana de un vistazo y llevá el control de cada turno: pendiente, confirmado, completado o cancelado.",
  },
  {
    icon: SearchIcon,
    title: "Búsqueda instantánea",
    description: "Encontrá cualquier paciente por nombre, apellido o DNI en segundos.",
  },
  {
    icon: ShieldIcon,
    title: "Acceso protegido",
    description:
      "Cada profesional accede solo a sus propios pacientes, con sesión protegida y datos que no se comparten entre cuentas.",
  },
];

const PAIN_POINTS: IFeature[] = [
  {
    icon: FolderIcon,
    title: "Historias clínicas dispersas",
    description:
      "Fichas en papel, archivos de Word sueltos o notas en el celular que después cuesta encontrar.",
  },
  {
    icon: ClockIcon,
    title: "Turnos en varios lugares a la vez",
    description:
      "Una agenda de papel, el calendario del teléfono y mensajes de WhatsApp que no se cruzan entre sí.",
  },
  {
    icon: HourglassIcon,
    title: "Perder tiempo buscando datos",
    description:
      "Revisar carpetas o scrollear el chat para encontrar el DNI o el teléfono de un paciente antes de atenderlo.",
  },
];

const TRUST_SIGNALS = [
  "Configurá tu cuenta en minutos",
  "Datos no compartidos entre profesionales",
  "Pensado para el día a día de tu consultorio",
];

const STEPS = [
  {
    number: "1",
    title: "Creá tu cuenta",
    description: "Elegí tu especialidad y registrate en menos de un minuto.",
  },
  {
    number: "2",
    title: "Cargá tus pacientes",
    description: "Sumá su información básica y empezá a registrar consultas.",
  },
  {
    number: "3",
    title: "Organizá tu agenda",
    description: "Programá turnos y llevá el seguimiento de cada uno.",
  },
];

// Degradado sutil y estatico (sin animacion) que se repite en cada recuadro de la
// pagina — se desvanece de arriba a abajo, contenido dentro de esa sola seccion.
const SECTION_GRADIENT_CLASS =
  "bg-[linear-gradient(to_bottom,rgba(99,102,241,0.10),transparent_70%)]";

export const HomePage = () => {
  const { professional } = useAuth();
  const { openLoginModal } = useLoginModal();

  return (
    <div className="bg-background">
      {/* Nav */}
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-text hover:text-text-secondary">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <a
              href="#funcionalidades"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-600"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-accent-600"
            >
              Cómo funciona
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {professional ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-primary transition-colors px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground"
              >
                Ir al panel
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="hidden cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text sm:block"
                >
                  Ingresar
                </button>
                <Link
                  to="/registro"
                  className="rounded-lg bg-primary transition-colors px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={SECTION_GRADIENT_CLASS}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Disponible hoy para psicólogos y psiquiatras
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Tu consultorio, ordenado en <span className="text-accent-600">un solo lugar</span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary">
            ClinicAR centraliza la información de tus pacientes, sus historias clínicas y tu agenda
            de turnos, para que puedas enfocarte en lo que importa: la consulta.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={professional ? "/dashboard" : "/registro"}
              className="w-full rounded-lg bg-primary transition-colors px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground sm:w-auto"
            >
              {professional ? "Ir al panel" : "Crear cuenta"}
            </Link>
            {!professional && (
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="w-full cursor-pointer rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover sm:w-auto"
              >
                Ya tengo cuenta
              </button>
            )}
          </div>
          <ul className="mt-6 flex flex-col items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted sm:flex-row">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal} className="flex items-center gap-1.5">
                <CheckIcon />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Problema */}
      <section className={`border-t border-dashed border-border px-6 py-20 ${SECTION_GRADIENT_CLASS}`}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-text">El problema que ya conocés</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-text-secondary">
            Antes de poder organizarte, tenés que lidiar con esto:
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <div
                key={pain.title}
                className="rounded-lg border border-border-subtle bg-surface p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-hover text-text-muted">
                  <pain.icon />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text">{pain.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{pain.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-base font-medium text-text">
            ClinicAR junta todo eso en un solo lugar.
          </p>
        </div>
      </section>

      {/* Funcionalidades */}
      <section
        id="funcionalidades"
        className={`border-t border-dashed border-border ${SECTION_GRADIENT_CLASS}`}
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-text">
            Todo lo que necesitás para tu consultorio
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border-subtle bg-surface p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <feature.icon />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text">{feature.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className={`border-t border-dashed border-border ${SECTION_GRADIENT_CLASS}`}
      >
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-text">Cómo funciona</h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center sm:text-left">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-accent-600">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">Empezá a ordenar tu consultorio hoy</h2>
          <p className="mt-3 text-accent-200">
            Creá tu cuenta y cargá a tu primer paciente en minutos.
          </p>
          <Link
            to={professional ? "/dashboard" : "/registro"}
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent-700 transition-opacity hover:opacity-90"
          >
            {professional ? "Ir al panel" : "Crear cuenta"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-text-muted sm:flex-row">
          <Wordmark className="font-semibold text-text" />
          <span>© {new Date().getFullYear()} ClinicAR. Todos los derechos reservados.</span>
          {professional ? (
            <Link to="/dashboard" className="text-text-secondary hover:text-text">
              Ir al panel
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="cursor-pointer text-text-secondary hover:text-text"
            >
              Ingresar
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
