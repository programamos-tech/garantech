"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateClaimStatus } from "@/lib/actions/claims";
import {
  getAllowedClaimTransitionsForType,
  getClaimWorkflowSteps,
  getTransitionActionLabel,
  isTerminalClaimStatus,
} from "@/lib/claim";
import type { WarrantyClaimStatus, WarrantyClaimWithRelations } from "@/lib/types";
import { CLAIM_STATUS_LABELS, CLAIM_TYPE_LABELS } from "@/lib/types";
import {
  CLAIM_STATUS_DOT_STYLES,
  CLAIM_STATUS_STYLES,
} from "@/components/gestion/claim-status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const transitionHints: Partial<
  Record<WarrantyClaimStatus, Partial<Record<string, string>>>
> = {
  en_diagnostico: {
    default: "Revisa el equipo y documenta el hallazgo técnico.",
  },
  aprobado: {
    reparacion: "La falla está cubierta. Procede con la reparación.",
    default: "La garantía aplica. Continúa con la solución acordada.",
  },
  no_aplica: {
    default: "El daño no está cubierto. Informa al cliente y cierra el reclamo.",
  },
  devolucion_aprobada: {
    cambio: "Autoriza el cambio del producto por uno nuevo o equivalente.",
    devolucion: "Autoriza la devolución del dinero o del producto.",
    default: "Se autoriza devolución o cambio.",
  },
  listo_entrega: {
    cambio: "El cliente recibió el producto de reemplazo. Cierra el reclamo.",
    devolucion: "La devolución quedó completada. Cierra el reclamo.",
    reparacion: "El equipo reparado fue entregado. Cierra el reclamo.",
    default: "El equipo está listo para entregar al cliente.",
  },
};

function getHint(status: WarrantyClaimStatus, claimType: string | null): string {
  const hints = transitionHints[status];
  if (!hints) return "";
  if (claimType && hints[claimType]) return hints[claimType]!;
  return hints.default ?? "";
}

function getButtonLabel(
  status: WarrantyClaimStatus,
  claim: WarrantyClaimWithRelations
): string {
  const custom = getTransitionActionLabel(status, claim.claim_type);
  if (custom) return custom;
  return CLAIM_STATUS_LABELS[status];
}

function getStepLabel(
  step: WarrantyClaimStatus,
  claimType: WarrantyClaimWithRelations["claim_type"]
): string {
  if (step === "devolucion_aprobada" && claimType === "cambio") return "Cambio autorizado";
  if (step === "devolucion_aprobada" && claimType === "devolucion") return "Devolución autorizada";
  return CLAIM_STATUS_LABELS[step];
}

function ClaimWorkflowSteps({ claim }: { claim: WarrantyClaimWithRelations }) {
  const allSteps = getClaimWorkflowSteps(claim.claim_type);
  const isClosedSuccess = claim.status === "listo_entrega";
  const isClosedRejected = claim.status === "no_aplica";

  const steps =
    isClosedRejected
      ? allSteps.slice(0, allSteps.indexOf("en_diagnostico") + 1)
      : allSteps;

  const currentIndex = isClosedSuccess
    ? steps.length
    : isClosedRejected
      ? steps.length
      : steps.indexOf(claim.status);

  return (
    <div className="space-y-3">
      <ol className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent =
            !isClosedSuccess && !isClosedRejected && step === claim.status;

          return (
            <li key={step} className="flex items-center min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isComplete
                      ? cn(CLAIM_STATUS_DOT_STYLES[step], "text-white")
                      : isCurrent
                        ? cn(CLAIM_STATUS_STYLES[step], "ring-2 ring-offset-1")
                        : "bg-gray-100 text-gray-400"
                  )}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold truncate rounded-full border px-2 py-0.5",
                    isComplete || isCurrent
                      ? CLAIM_STATUS_STYLES[step]
                      : "text-gray-400 border-transparent"
                  )}
                >
                  {getStepLabel(step, claim.claim_type)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block mx-3 h-px w-8 lg:w-12",
                    isComplete ? "bg-emerald-300" : "bg-gray-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {(isClosedSuccess || isClosedRejected) && (
        <p
          className={cn(
            "text-sm font-medium rounded-xl px-4 py-3 border",
            isClosedSuccess
              ? "text-green-800 bg-green-50 border-green-100"
              : "text-red-800 bg-red-50 border-red-100"
          )}
        >
          Reclamo cerrado
        </p>
      )}
    </div>
  );
}

export function ClaimStatusActions({ claim }: { claim: WarrantyClaimWithRelations }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<WarrantyClaimStatus | "">("");
  const [diagnosisNotes, setDiagnosisNotes] = useState(claim.diagnosis_notes ?? "");
  const [resolutionNotes, setResolutionNotes] = useState(claim.resolution_notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const allowed = getAllowedClaimTransitionsForType(claim.status, claim.claim_type);
  const isTerminal = isTerminalClaimStatus(claim.status);
  const typeLabel = claim.claim_type ? CLAIM_TYPE_LABELS[claim.claim_type] : "reclamo";
  const hasMultipleActions = allowed.length > 1;
  const activeStatus = hasMultipleActions ? selectedStatus : allowed[0] ?? "";

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!activeStatus) return;
    setError("");

    startTransition(async () => {
      const notes: { diagnosisNotes?: string; resolutionNotes?: string } = {};

      if (
        activeStatus === "aprobado" ||
        activeStatus === "no_aplica" ||
        activeStatus === "devolucion_aprobada"
      ) {
        notes.diagnosisNotes = diagnosisNotes;
      }

      if (activeStatus === "listo_entrega" || activeStatus === "no_aplica") {
        notes.resolutionNotes = resolutionNotes;
      }

      const result = await updateClaimStatus(claim.id, activeStatus, notes);
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedStatus("");
        router.refresh();
      }
    });
  }

  const showDiagnosisNotes =
    claim.status === "en_diagnostico" ||
    activeStatus === "aprobado" ||
    activeStatus === "no_aplica" ||
    activeStatus === "devolucion_aprobada";

  const showResolutionNotes =
    activeStatus === "listo_entrega" || activeStatus === "no_aplica";

  if (isTerminal) {
    return <ClaimWorkflowSteps claim={claim} />;
  }

  return (
    <div className="space-y-5">
      <ClaimWorkflowSteps claim={claim} />

      <div className="rounded-xl border border-brand/10 bg-brand-light/40 px-4 py-3">
        <p className="text-sm text-brand font-medium">
          {claim.status === "ingresado" && (
            <>
              Paso 1: pasa el reclamo de <strong>{typeLabel.toLowerCase()}</strong> a diagnóstico
              para revisar el equipo.
            </>
          )}
          {claim.status === "en_diagnostico" && claim.claim_type === "cambio" && (
            <>
              Paso 2: si aplica garantía, autoriza el cambio. Si no, cierra el reclamo.
            </>
          )}
          {claim.status === "en_diagnostico" && claim.claim_type === "devolucion" && (
            <>Paso 2: si aplica, autoriza la devolución. Si no, cierra el reclamo.</>
          )}
          {claim.status === "en_diagnostico" && claim.claim_type === "reparacion" && (
            <>
              Paso 2: si la falla está cubierta, aprueba la reparación. Si no, cierra el
              reclamo.
            </>
          )}
          {claim.status === "devolucion_aprobada" &&
            (claim.claim_type === "cambio" || claim.claim_type === "devolucion") && (
              <>
                Paso 3: cuando el cliente reciba el{" "}
                {claim.claim_type === "cambio" ? "producto de cambio" : "resultado de la devolución"}
                , confirma la entrega para cerrar el reclamo.
              </>
            )}
          {claim.status === "aprobado" && (
            <>
              Paso 3: cuando el equipo reparado sea entregado al cliente, confirma la entrega
              para cerrar el reclamo.
            </>
          )}
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        {hasMultipleActions && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Elige una acción
            </p>
            <div className="flex flex-wrap gap-2">
              {allowed.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                    selectedStatus === status
                      ? "border-brand bg-brand text-white shadow-sm ring-2 ring-brand/20"
                      : cn("hover:opacity-90", CLAIM_STATUS_STYLES[status])
                  )}
                >
                  {getButtonLabel(status, claim)}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeStatus && getHint(activeStatus, claim.claim_type) && (
          <p className="text-xs text-gray-500">
            {getHint(activeStatus, claim.claim_type)}
          </p>
        )}

        {showDiagnosisNotes && (
          <div className="space-y-1.5">
            <label
              htmlFor="diagnosis-notes"
              className="block text-sm font-semibold text-gray-700"
            >
              Notas de diagnóstico
            </label>
            <textarea
              id="diagnosis-notes"
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="Hallazgos del técnico..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 resize-none"
            />
          </div>
        )}

        {showResolutionNotes && (
          <div className="space-y-1.5">
            <label
              htmlFor="resolution-notes"
              className="block text-sm font-semibold text-gray-700"
            >
              Notas de cierre
            </label>
            <textarea
              id="resolution-notes"
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder={
                claim.claim_type === "cambio"
                  ? "Ej. IMEI del equipo entregado, observaciones..."
                  : "Cómo se cerró el reclamo..."
              }
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 resize-none"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">
            {error}
          </p>
        )}

        {activeStatus && (
          <Button type="submit" disabled={isPending} size="sm">
            {isPending
              ? "Actualizando..."
              : hasMultipleActions
                ? "Confirmar"
                : getButtonLabel(activeStatus, claim)}
          </Button>
        )}
      </form>
    </div>
  );
}
