import { cn } from "@/lib/utils";
import type { WarrantyStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const styles: Record<WarrantyStatus, string> = {
  vigente: "bg-green-100 text-green-800 border-green-200",
  por_vencer: "bg-amber-100 text-amber-800 border-amber-200",
  vencida: "bg-red-100 text-red-800 border-red-200",
  anulada: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: WarrantyStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
