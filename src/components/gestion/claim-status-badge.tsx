import { cn } from "@/lib/utils";
import type { WarrantyClaimStatus } from "@/lib/types";
import { CLAIM_STATUS_LABELS } from "@/lib/types";

export const CLAIM_STATUS_STYLES: Record<WarrantyClaimStatus, string> = {
  ingresado: "bg-sky-100 text-sky-800 border-sky-200",
  en_diagnostico: "bg-amber-100 text-amber-800 border-amber-200",
  aprobado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  no_aplica: "bg-red-100 text-red-800 border-red-200",
  devolucion_aprobada: "bg-violet-100 text-violet-800 border-violet-200",
  listo_entrega: "bg-green-100 text-green-800 border-green-200",
};

export const CLAIM_STATUS_DOT_STYLES: Record<WarrantyClaimStatus, string> = {
  ingresado: "bg-sky-500",
  en_diagnostico: "bg-amber-500",
  aprobado: "bg-emerald-500",
  no_aplica: "bg-red-500",
  devolucion_aprobada: "bg-violet-500",
  listo_entrega: "bg-green-500",
};

export function ClaimStatusBadge({
  status,
  className,
  showDot = false,
}: {
  status: WarrantyClaimStatus;
  className?: string;
  showDot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        CLAIM_STATUS_STYLES[status],
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", CLAIM_STATUS_DOT_STYLES[status])}
        />
      )}
      {CLAIM_STATUS_LABELS[status]}
    </span>
  );
}
