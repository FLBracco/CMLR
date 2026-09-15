import { describe, expect, it } from "vitest";
import {
  addOneMonth,
  getExpirationScanCutoff,
  getSubscriptionExpiresAt,
  isSubscriptionExpired,
} from "./subscription-expiration.js";

describe("addOneMonth", () => {
  it("caso normal: 15/01 -> 15/02", () => {
    expect(addOneMonth(new Date(2026, 0, 15, 10, 30))).toEqual(
      new Date(2026, 1, 15, 10, 30)
    );
  });

  it("clamp en año no bisiesto: 31/01/2026 -> 28/02/2026", () => {
    expect(addOneMonth(new Date(2026, 0, 31, 9, 0))).toEqual(
      new Date(2026, 1, 28, 9, 0)
    );
  });

  it("clamp en año bisiesto: 31/01/2028 -> 29/02/2028", () => {
    expect(addOneMonth(new Date(2028, 0, 31, 9, 0))).toEqual(
      new Date(2028, 1, 29, 9, 0)
    );
  });

  it("29/02/2028 -> 29/03/2028", () => {
    expect(addOneMonth(new Date(2028, 1, 29, 12, 0))).toEqual(
      new Date(2028, 2, 29, 12, 0)
    );
  });

  it("mes de 30 días: 31/03 -> 30/04", () => {
    expect(addOneMonth(new Date(2026, 2, 31, 0, 0))).toEqual(
      new Date(2026, 3, 30, 0, 0)
    );
  });

  it("cruce de año: 31/12/2025 -> 31/01/2026", () => {
    expect(addOneMonth(new Date(2025, 11, 31, 8, 15))).toEqual(
      new Date(2026, 0, 31, 8, 15)
    );
  });

  it("preserva hora y minutos", () => {
    const result = addOneMonth(new Date(2026, 0, 10, 23, 59, 5));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(5);
  });
});

describe("getSubscriptionExpiresAt / isSubscriptionExpired", () => {
  it("ACTIVE con fecha -> vence al mes calendario", () => {
    const professional = {
      subscriptionStatus: "ACTIVE" as const,
      subscriptionUpdatedAt: new Date(2026, 0, 15, 10, 0),
    };

    expect(getSubscriptionExpiresAt(professional)).toEqual(
      new Date(2026, 1, 15, 10, 0)
    );
  });

  it("ACTIVE con subscriptionUpdatedAt null -> no vence nunca", () => {
    const professional = {
      subscriptionStatus: "ACTIVE" as const,
      subscriptionUpdatedAt: null,
    };

    expect(getSubscriptionExpiresAt(professional)).toBeNull();
    expect(isSubscriptionExpired(professional)).toBe(false);
  });

  it.each(["PENDING", "PAYMENT_REPORTED", "DISABLED"] as const)(
    "%s con fecha vieja -> no vence nunca (no está activo)",
    (status) => {
      const professional = {
        subscriptionStatus: status,
        subscriptionUpdatedAt: new Date(2020, 0, 1),
      };

      expect(getSubscriptionExpiresAt(professional)).toBeNull();
      expect(isSubscriptionExpired(professional)).toBe(false);
    }
  );

  it("vencido: justo en el instante de corte cuenta como vencido", () => {
    const expiresAt = new Date(2026, 1, 15, 10, 0);
    const professional = {
      subscriptionStatus: "ACTIVE" as const,
      subscriptionUpdatedAt: new Date(2026, 0, 15, 10, 0),
    };

    expect(isSubscriptionExpired(professional, expiresAt)).toBe(true);
  });

  it("no vencido: 1 ms antes del corte", () => {
    const oneMsBefore = new Date(2026, 1, 15, 9, 59, 59, 999);
    const professional = {
      subscriptionStatus: "ACTIVE" as const,
      subscriptionUpdatedAt: new Date(2026, 0, 15, 10, 0),
    };

    expect(isSubscriptionExpired(professional, oneMsBefore)).toBe(false);
  });
});

describe("getExpirationScanCutoff", () => {
  it("está al menos 27 días antes de 'now'", () => {
    const now = new Date(2026, 5, 15, 12, 0);
    const cutoff = getExpirationScanCutoff(now);

    const diffDays =
      (now.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(27);
  });
});
