import { SubscriptionExpirationService } from "../services/subscription-expiration.service.js";

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // 1h

// El hosting (Render free) puede dormir el proceso por inactividad, así que
// en la práctica este barrido corre sobre todo en cada arranque en frío (el
// primer run, antes del setInterval) — eso es lo que evita que "Activos" en
// el admin quede desactualizado por mucho tiempo. El self-healing en los
// puntos de lectura es lo que garantiza la corrección aunque el intervalo
// nunca llegue a dispararse.
export const startSubscriptionExpirationSweep = (
  intervalMs = DEFAULT_INTERVAL_MS,
  subscriptionExpiration = new SubscriptionExpirationService()
): NodeJS.Timeout => {
  let isRunning = false;

  const run = async (): Promise<void> => {
    if (isRunning) return;
    isRunning = true;

    try {
      const disabledCount = await subscriptionExpiration.sweep();
      if (disabledCount > 0) {
        console.log(
          `🔒 Barrido de suscripciones: ${disabledCount} desactivada(s) por vencimiento.`
        );
      }
    } catch (error) {
      // Una promesa rechazada sin catch tira abajo el proceso (Node 24) — el
      // caso típico acá es la DB dormida por scale-to-zero, no un bug.
      console.error("❌ Error en el barrido de vencimiento de suscripciones.");
      console.error(error);
    } finally {
      isRunning = false;
    }
  };

  void run();

  const timer = setInterval(() => void run(), intervalMs);
  timer.unref();

  return timer;
};
