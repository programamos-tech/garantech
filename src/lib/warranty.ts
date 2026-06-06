import type {
  IdentifierType,
  ProductCategory,
  WarrantyStatus,
} from "./types";

export function getIdentifierType(category: ProductCategory): IdentifierType {
  return category === "telefonia" ? "imei" : "referencia";
}

export function getIdentifierLabel(category: ProductCategory): string {
  return category === "telefonia" ? "IMEI" : "Referencia";
}

export function calculateWarrantyEndDate(
  saleDate: string,
  warrantyMonths: number
): string {
  const date = new Date(saleDate + "T00:00:00");
  date.setMonth(date.getMonth() + warrantyMonths);
  return date.toISOString().split("T")[0];
}

export function calculateWarrantyStatus(
  warrantyEndDate: string,
  referenceDate: Date = new Date()
): WarrantyStatus {
  const end = new Date(warrantyEndDate + "T00:00:00");
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const thirtyDaysBefore = new Date(end);
  thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);

  if (today > end) return "vencida";
  if (today >= thirtyDaysBefore) return "por_vencer";
  return "vigente";
}

export function validateIdentifier(
  identifier: string,
  category: ProductCategory
): string | null {
  if (!identifier.trim()) {
    return category === "telefonia"
      ? "El IMEI es obligatorio"
      : "La referencia es obligatoria";
  }

  if (category === "telefonia") {
    if (!/^\d{15}$/.test(identifier)) {
      return "El IMEI debe tener exactamente 15 dígitos numéricos";
    }
  }

  return null;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
  return `${time} - ${day}`;
}

export function formatDateTimeDetail(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} · ${time}`;
}

export function formatCertificateIssuedAt(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export function shortWarrantyId(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function shortSaleId(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function shortProductId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function withRecalculatedStatus<
  T extends {
    warranty_end_date: string;
    status: WarrantyStatus;
    voided_at?: string | null;
  },
>(warranty: T): T {
  if (warranty.status === "anulada" || warranty.voided_at) {
    return { ...warranty, status: "anulada" };
  }

  return {
    ...warranty,
    status: calculateWarrantyStatus(warranty.warranty_end_date),
  };
}

export function getWarrantyProgress(saleDate: string, warrantyEndDate: string) {
  const start = new Date(saleDate + "T00:00:00");
  const end = new Date(warrantyEndDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = today.getTime() - start.getTime();
  const dayMs = 1000 * 60 * 60 * 24;

  if (totalMs <= 0) {
    return { percent: 100, daysElapsed: 0, daysTotal: 0, daysRemaining: 0 };
  }

  const daysTotal = Math.round(totalMs / dayMs);
  const daysElapsed = Math.min(
    daysTotal,
    Math.max(0, Math.round(elapsedMs / dayMs))
  );
  const daysRemaining = Math.max(0, Math.round((end.getTime() - today.getTime()) / dayMs));
  const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

  return { percent, daysElapsed, daysTotal, daysRemaining };
}
