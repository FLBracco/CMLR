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

// Valor 24hs que espera el atributo `value` de <input type="time">.
export const toTimeInputValue = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

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

