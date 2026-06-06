import { cn } from "@/lib/utils";
import type { WarrantyStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const styles: Record<WarrantyStatus, string> = {
  vigente:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/35",
  por_vencer:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/35",
  vencida:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/35",
  anulada:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/55 dark:text-red-300 dark:border-red-800/50",
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
