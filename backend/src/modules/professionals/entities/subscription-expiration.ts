import type { Professional } from "./professional.entity.js";

export const SUBSCRIPTION_PERIOD_MONTHS = 1;

type SubscriptionLifecycle = Pick<
  Professional,
  "subscriptionStatus" | "subscriptionUpdatedAt"
>;

// Mes calendario con clamp al último día (ej: 31/01 + 1 mes = 28 o 29/02, no
// "overflow" a marzo). setDate(1) antes de mover el mes evita justamente ese
// overflow de Date.setMonth cuando el mes de origen tiene más días que el
// destino.
export const addOneMonth = (date: Date): Date => {
  const result = new Date(date.getTime());
  const day = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + SUBSCRIPTION_PERIOD_MONTHS);

  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();
  result.setDate(Math.min(day, lastDayOfTargetMonth));

  return result;
};

// Sin fecha de activación conocida (profesionales ACTIVE desde antes de que
// existiera este campo, o cualquier estado que no sea ACTIVE) no hay
// vencimiento calculable — se los trata como "no vence nunca" en vez de
// desactivarlos en masa por un dato que nunca tuvieron.
export const getSubscriptionExpiresAt = (
  professional: SubscriptionLifecycle
): Date | null => {
  if (
    professional.subscriptionStatus !== "ACTIVE" ||
    !professional.subscriptionUpdatedAt
  ) {
    return null;
  }

  return addOneMonth(professional.subscriptionUpdatedAt);
};

export const isSubscriptionExpired = (
  professional: SubscriptionLifecycle,
  now: Date = new Date()
): boolean => {
  const expiresAt = getSubscriptionExpiresAt(professional);
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
};

// Pre-filtro conservador para la query del barrido: el mes calendario más
// corto posible son 28 días (31/01 -> 28/02), así que nada activado hace
// menos de 27 días puede estar vencido todavía. La regla autoritativa sigue
// siendo isSubscriptionExpired — esto solo acota qué filas trae la DB.
export const getExpirationScanCutoff = (now: Date = new Date()): Date => {
  const cutoff = new Date(now.getTime());
  cutoff.setDate(cutoff.getDate() - 27);
  return cutoff;
};
