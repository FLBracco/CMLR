export type CalendarViewMode = "day" | "week" | "month";

interface ICalendarToolbarProps {
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  label: string;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export const CalendarToolbar = ({
  view,
  onViewChange,
  label,
  onToday,
  onPrev,
  onNext,
}: ICalendarToolbarProps) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToday}
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
      >
        Hoy
      </button>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Período anterior"
        className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
      >
        ←
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Período siguiente"
        className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
      >
        →
      </button>
      <span className="ml-1 text-sm font-medium text-text">{label}</span>
    </div>

    <div className="flex gap-1 rounded-lg border border-border p-1">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onViewChange(option.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            view === option.value
              ? "bg-primary text-primary-foreground"
              : "text-text-secondary hover:bg-surface-hover"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
