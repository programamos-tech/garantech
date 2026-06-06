"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  DollarSign,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { openOrResumeClaim } from "@/lib/actions/claims";
import { canManageWarrantyClaim } from "@/lib/claim";
import type { WarrantyClaimType, WarrantyManageContext } from "@/lib/types";
import { CLAIM_TYPE_LABELS } from "@/lib/types";
import {
  formatDate,
  getIdentifierLabel,
  shortSaleId,
  shortWarrantyId,
} from "@/lib/warranty";

const claimTypes: {
  value: WarrantyClaimType;
  label: string;
  icon: typeof Wrench;
}[] = [
  { value: "cambio", label: CLAIM_TYPE_LABELS.cambio, icon: ArrowLeftRight },
  { value: "devolucion", label: CLAIM_TYPE_LABELS.devolucion, icon: DollarSign },
  { value: "reparacion", label: CLAIM_TYPE_LABELS.reparacion, icon: Wrench },
];

function SectionTitle({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </h2>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value || "—"}</span>
    </div>
  );
}

export function WarrantyManageForm({ context }: { context: WarrantyManageContext }) {
  const router = useRouter();
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(
    context.defaultWarrantyId
  );
  const [claimType, setClaimType] = useState<WarrantyClaimType | "">("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedItem = context.items.find(
    (item) => item.warranty.id === selectedWarrantyId
  );
  const selectedWarranty = selectedItem?.warranty;
  const isMulti = context.items.length > 1;

  const manageableItems = context.items.filter((item) =>
    canManageWarrantyClaim(item.warranty.status)
  );

  const canSubmit =
    !!selectedWarrantyId &&
    !!claimType &&
    !!motivo.trim() &&
    selectedItem?.coverage === "cubierta" &&
    !selectedItem?.openClaimId;

  const saleLabel = context.sale ? shortSaleId(context.sale.id) : null;

  const resumeClaimId = useMemo(() => {
    const item = context.items.find((i) => i.warranty.id === selectedWarrantyId);
    return item?.openClaimId ?? null;
  }, [context.items, selectedWarrantyId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (resumeClaimId) {
      router.push(`/gestion/reclamos/${resumeClaimId}`);
      return;
    }

    if (!claimType) {
      setError("Selecciona el tipo de gestión");
      return;
    }

    startTransition(async () => {
      const result = await openOrResumeClaim(
        selectedWarrantyId,
        motivo,
        claimType
      );
      if (result.error) {
        setError(result.error);
      } else if (result.claimId) {
        router.push(`/gestion/reclamos/${result.claimId}`);
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Garantías /{" "}
            <Link
              href={`/garantias/${context.defaultWarrantyId}`}
              className="link-brand"
            >
              Garantía {shortWarrantyId(context.defaultWarrantyId)}
            </Link>{" "}
            / Gestionar
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Gestionar garantía</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Selecciona el producto, el tipo de gestión y describe el motivo del reclamo.
          </p>
        </div>
        <Link
          href={`/garantias/${context.defaultWarrantyId}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {manageableItems.length === 0 ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center">
          <p className="font-semibold text-red-900">Sin cobertura vigente</p>
          <p className="text-sm text-red-700/90 mt-1">
            Ningún producto de esta venta tiene garantía activa para gestionar.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="space-y-4">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle required>Venta</SectionTitle>
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {saleLabel
                      ? `Venta ${saleLabel}`
                      : `Garantía ${shortWarrantyId(context.defaultWarrantyId)}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {context.customerName} · {formatDate(context.saleDate)}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle required>Producto de la venta</SectionTitle>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  {isMulti
                    ? "Elige el producto al que le vas a gestionar la garantía."
                    : "Producto incluido en esta venta."}
                </p>
                <div className="space-y-2">
                  {context.items.map((item) => {
                    const { warranty, coverage, openClaimId } = item;
                    const identifierLabel = getIdentifierLabel(warranty.product.category);
                    const canSelect =
                      coverage === "cubierta" && canManageWarrantyClaim(warranty.status);
                    const isSelected = selectedWarrantyId === warranty.id;

                    return (
                      <label
                        key={warranty.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                          !canSelect
                            ? "border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "border-brand bg-brand-light/30 ring-2 ring-brand/10"
                              : "border-gray-200 hover:border-brand/20 hover:bg-gray-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="warranty-product"
                          value={warranty.id}
                          checked={isSelected}
                          disabled={!canSelect}
                          onChange={() => setSelectedWarrantyId(warranty.id)}
                          className="mt-1 h-4 w-4 text-brand focus:ring-brand/20"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">
                              {warranty.product.name}
                            </p>
                            <StatusBadge status={warranty.status} />
                            {openClaimId && (
                              <Link
                                href={`/gestion/reclamos/${openClaimId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] font-semibold text-amber-700 hover:underline"
                              >
                                Reclamo en curso
                              </Link>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                            {identifierLabel}: {warranty.identifier}
                          </p>
                          {coverage !== "cubierta" && (
                            <p className="text-xs text-red-600 mt-1">
                              Sin cobertura vigente
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle required>Motivo de la garantía</SectionTitle>
                <p className="text-xs text-gray-400 mt-1 mb-3">
                  Describe el problema o motivo del reclamo.
                </p>
                <textarea
                  rows={4}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Pantalla sin respuesta táctil. El cliente solicita cambio por otro equipo."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 resize-none"
                />
              </section>
            </div>

            <div className="space-y-4 lg:sticky lg:top-20">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle required>Tipo de gestión</SectionTitle>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {claimTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={!!resumeClaimId}
                      onClick={() => setClaimType(value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                        claimType === value
                          ? "border-brand bg-brand text-white shadow-sm"
                          : "border-gray-200 text-gray-700 hover:border-brand/20 hover:bg-brand-light/40"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle>Resumen</SectionTitle>
                <div className="mt-3 divide-y divide-gray-100">
                  <SummaryRow
                    label="Venta"
                    value={
                      saleLabel
                        ? saleLabel
                        : shortWarrantyId(context.defaultWarrantyId)
                    }
                  />
                  <SummaryRow label="Cliente" value={context.customerName} />
                  <SummaryRow
                    label="Producto"
                    value={selectedWarranty?.product.name}
                  />
                  <SummaryRow
                    label="Identificador"
                    value={
                      selectedWarranty ? (
                        <span className="font-mono text-xs">
                          {selectedWarranty.identifier}
                        </span>
                      ) : null
                    }
                  />
                  <SummaryRow
                    label="Tipo"
                    value={claimType ? CLAIM_TYPE_LABELS[claimType] : null}
                  />
                </div>

                {resumeClaimId && (
                  <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    Este producto ya tiene un reclamo abierto.
                  </p>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isPending || (!resumeClaimId && !canSubmit)}
                  className="w-full mt-5"
                >
                  {isPending
                    ? "Procesando..."
                    : resumeClaimId
                      ? "Ir al reclamo en curso"
                      : "Iniciar gestión"}
                </Button>
              </section>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
