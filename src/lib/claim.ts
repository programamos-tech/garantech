import type {
  CoverageResult,
  WarrantyClaimStatus,
  WarrantyClaimType,
  WarrantyWithRelations,
} from "./types";
import { withRecalculatedStatus } from "./warranty";

export const TERMINAL_CLAIM_STATUSES: WarrantyClaimStatus[] = [
  "no_aplica",
  "listo_entrega",
];

const CLAIM_TRANSITIONS: Record<
  WarrantyClaimStatus,
  WarrantyClaimStatus[]
> = {
  ingresado: ["en_diagnostico"],
  en_diagnostico: ["aprobado", "no_aplica", "devolucion_aprobada"],
  aprobado: ["listo_entrega"],
  devolucion_aprobada: ["listo_entrega"],
  no_aplica: [],
  listo_entrega: [],
};

export function isTerminalClaimStatus(status: WarrantyClaimStatus): boolean {
  return TERMINAL_CLAIM_STATUSES.includes(status);
}

export function getAllowedClaimTransitions(
  status: WarrantyClaimStatus
): WarrantyClaimStatus[] {
  return CLAIM_TRANSITIONS[status] ?? [];
}

export function canTransitionClaimStatus(
  from: WarrantyClaimStatus,
  to: WarrantyClaimStatus
): boolean {
  return getAllowedClaimTransitions(from).includes(to);
}

export function getClaimWorkflowSteps(
  claimType: WarrantyClaimType | null
): WarrantyClaimStatus[] {
  if (claimType === "cambio" || claimType === "devolucion") {
    return ["ingresado", "en_diagnostico", "devolucion_aprobada", "listo_entrega"];
  }

  return ["ingresado", "en_diagnostico", "aprobado", "listo_entrega"];
}

export function getAllowedClaimTransitionsForType(
  status: WarrantyClaimStatus,
  claimType: WarrantyClaimType | null
): WarrantyClaimStatus[] {
  const base = getAllowedClaimTransitions(status);

  if (status !== "en_diagnostico" || !claimType) {
    return base;
  }

  if (claimType === "cambio" || claimType === "devolucion") {
    return base.filter((next) => next !== "aprobado");
  }

  if (claimType === "reparacion") {
    return base.filter((next) => next !== "devolucion_aprobada");
  }

  return base;
}

export function canTransitionClaimStatusForType(
  from: WarrantyClaimStatus,
  to: WarrantyClaimStatus,
  claimType: WarrantyClaimType | null
): boolean {
  return getAllowedClaimTransitionsForType(from, claimType).includes(to);
}

export function getTransitionActionLabel(
  status: WarrantyClaimStatus,
  claimType: WarrantyClaimType | null
): string {
  if (status === "devolucion_aprobada") {
    if (claimType === "cambio") return "Autorizar cambio";
    if (claimType === "devolucion") return "Autorizar devolución";
  }

  if (status === "listo_entrega") {
    if (claimType === "cambio") return "Entregar cambio y cerrar";
    if (claimType === "devolucion") return "Confirmar devolución y cerrar";
    if (claimType === "reparacion") return "Entregar reparado y cerrar";
  }

  if (status === "aprobado" && claimType === "reparacion") {
    return "Aprobar reparación";
  }

  return "";
}

export function evaluateCoverage(
  warranty: WarrantyWithRelations | null | undefined
): CoverageResult {
  if (!warranty) return "sin_registro";

  const recalculated = withRecalculatedStatus(warranty);

  if (recalculated.status === "anulada" || recalculated.status === "vencida") {
    return "sin_cobertura";
  }

  return "cubierta";
}

export function shortClaimId(id: string): string {
  return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function canManageWarrantyClaim(
  status: WarrantyWithRelations["status"]
): boolean {
  return status === "vigente" || status === "por_vencer";
}
