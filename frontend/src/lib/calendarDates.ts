export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date => {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Lunes como inicio de semana, igual que el backend (ver appointment.service.ts).
export const startOfWeek = (date: Date): Date => {
  const result = startOfDay(date);
  const day = result.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diffToMonday);
  return result;
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

// Grilla de 6 semanas (42 días) empezando el lunes on/antes del día 1 del mes.
export const getMonthGridDays = (date: Date): Date[] => {
  const gridStart = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const formatTime = (date: Date): string =>
  new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(date);

export const formatDayHeader = (date: Date): string =>
  new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);

export const formatMonthYear = (date: Date): string => {
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatWeekRange = (days: Date[]): string => {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return "";

  const dayFmt = new Intl.DateTimeFormat("es-AR", { day: "numeric" });
  const monthFmt = new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" });
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();

  if (sameMonth) {
    return `${dayFmt.format(first)} – ${dayFmt.format(last)} ${monthFmt.format(last)}`;
  }
  return `${dayFmt.format(first)} ${monthFmt.format(first)} – ${dayFmt.format(last)} ${monthFmt.format(last)}`;
};
