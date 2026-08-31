import { AppShell } from "../components/AppShell";

export const ComingSoonPage = ({ title }: { title: string }) => (
  <AppShell>
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-semibold text-text">{title}</h2>
      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium text-text-secondary">
          {title} está próximamente.
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Todavía no está disponible, estamos trabajando en esta sección.
        </p>
      </div>
    </div>
  </AppShell>
);
