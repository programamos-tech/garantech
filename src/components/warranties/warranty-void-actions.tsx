"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { voidWarranty } from "@/lib/actions/warranties";
import { formatDateTimeDetail } from "@/lib/warranty";
import type { WarrantyStatus } from "@/lib/types";

type VoidProps = {
  warrantyId: string;
  status: WarrantyStatus;
  voidReason: string | null;
  voidedAt: string | null;
  storeName: string;
};

function VoidWarrantyModal({
  open,
  onClose,
  warrantyId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  warrantyId: string;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleVoid(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await voidWarranty(warrantyId, reason);
      if (result.error) {
        setError(result.error);
      } else {
        setReason("");
        onClose();
        onSuccess();
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Anular garantía">
      <form onSubmit={handleVoid} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Esta garantía dejará de estar vigente. Indica por qué se anula (error de
          registro, devolución, cambio de producto, etc.).
        </p>
        <div className="space-y-1.5">
          <label
            htmlFor="void-reason"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Motivo de la anulación *
          </label>
          <textarea
            id="void-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Venta registrada por error — el cliente devolvió el producto."
            required
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all resize-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium dark:text-red-300 dark:bg-red-500/10">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || !reason.trim()}
            variant="danger"
            className="flex-1"
          >
            {isPending ? "Anulando..." : "Confirmar anulación"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function WarrantyVoidHeaderButton({
  warrantyId,
  status,
  voidedAt,
}: Pick<VoidProps, "warrantyId" | "status" | "voidedAt">) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isVoided = status === "anulada" || !!voidedAt;

  if (isVoided) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap dark:text-red-300 dark:border-red-800 dark:hover:bg-red-950/40"
      >
        <Ban className="h-4 w-4" />
        Anular garantía
      </Button>
      <VoidWarrantyModal
        open={open}
        onClose={() => setOpen(false)}
        warrantyId={warrantyId}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

export function WarrantyVoidNotice({
  voidReason,
  voidedAt,
  storeName,
  status,
}: Pick<VoidProps, "voidReason" | "voidedAt" | "storeName" | "status">) {
  const isVoided = status === "anulada" || !!voidedAt;
  if (!isVoided || !voidReason) return null;

  return (
    <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm dark:border-red-900/45 dark:bg-red-950/35">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-red-600 mb-2 dark:text-red-300">
        Garantía anulada
      </h2>
      {voidedAt && (
        <p className="text-xs text-red-600/80 mb-3 dark:text-red-300/90">
          Anulada el {formatDateTimeDetail(voidedAt)} · {storeName}
        </p>
      )}
      <div className="rounded-xl border border-red-100 bg-white p-4 dark:border-red-800/50 dark:bg-red-950/50">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600 mb-1 dark:text-red-300">
          Motivo de la anulación
        </p>
        <p className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap dark:text-red-100">
          {voidReason}
        </p>
      </div>
    </section>
  );
}
