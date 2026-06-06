import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Sale, WarrantyStatus, WarrantyWithRelations } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import {
  formatDate,
  formatDateTimeDetail,
  getIdentifierLabel,
  getWarrantyProgress,
  shortSaleId,
  shortWarrantyId,
} from "@/lib/warranty";
import {
  WarrantyVoidHeaderButton,
  WarrantyVoidNotice,
} from "@/components/warranties/warranty-void-actions";
import { WarrantyManageHeaderButton } from "@/components/warranties/warranty-manage-actions";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4 border-r border-gray-100 last:border-r-0 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 truncate">
        {label}
      </p>
      <div
        className={`text-lg font-bold mt-1 truncate ${
          accent ? "text-amber-600" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm border-b border-gray-50 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

const progressBarStyles: Record<WarrantyStatus, string> = {
  vigente: "bg-emerald-500",
  por_vencer: "bg-amber-500",
  vencida: "bg-red-400",
  anulada: "bg-gray-400",
};

function WarrantyCoverageProgress({
  saleDate,
  warrantyEndDate,
  status,
}: {
  saleDate: string;
  warrantyEndDate: string;
  status: WarrantyStatus;
}) {
  const { percent, daysElapsed, daysTotal, daysRemaining } = getWarrantyProgress(
    saleDate,
    warrantyEndDate
  );
  const roundedPercent = Math.round(percent);

  if (status === "anulada") {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-gray-700">Garantía anulada</p>
          <p className="text-xs text-gray-500 mt-1">
            La barra de cobertura no aplica porque esta garantía fue cancelada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 border-t border-gray-100">
      <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mb-3">
        <span className="shrink-0">Venta {formatDate(saleDate)}</span>
        <span className="font-medium text-gray-700 text-center">
          {status === "vencida"
            ? "Garantía vencida"
            : `${daysRemaining} ${daysRemaining === 1 ? "día restante" : "días restantes"}`}
        </span>
        <span className="shrink-0">Vence {formatDate(warrantyEndDate)}</span>
      </div>

      <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${progressBarStyles[status]}`}
          style={{ width: `${roundedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>
          {daysElapsed} de {daysTotal} días
        </span>
        <span>{roundedPercent}% transcurrido</span>
      </div>
    </div>
  );
}

export function WarrantyDetailView({
  warranty,
  storeName,
  openClaimId,
  sale,
  saleItems,
}: {
  warranty: WarrantyWithRelations;
  storeName: string;
  openClaimId: string | null;
  sale: Sale | null;
  saleItems: WarrantyWithRelations[];
}) {
  const warrantyId = shortWarrantyId(warranty.id);
  const identifierLabel = getIdentifierLabel(warranty.product.category);
  const registeredAt = formatDateTimeDetail(warranty.created_at);
  const saleNotes = sale?.notes ?? warranty.notes;
  const isMultiItemSale = saleItems.length > 1;
  const saleLabel = sale ? shortSaleId(sale.id) : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Garantías / Garantía {warrantyId}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-2xl font-bold text-gray-900">Garantía {warrantyId}</h1>
              <StatusBadge status={warranty.status} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {registeredAt} · {warranty.customer.name} · Registrada en {storeName}
              {isMultiItemSale && saleLabel && (
                <>
                  {" "}
                  · Venta {saleLabel} ({saleItems.length} productos)
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <WarrantyManageHeaderButton
              warrantyId={warranty.id}
              status={warranty.status}
              openClaimId={openClaimId}
            />
            <WarrantyVoidHeaderButton
              warrantyId={warranty.id}
              status={warranty.status}
              voidedAt={warranty.voided_at}
            />
            <Link
              href="/garantias"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 border-t border-gray-100">
          <StatCard
            label="Estado"
            value={STATUS_LABELS[warranty.status]}
            accent={warranty.status !== "vigente"}
          />
          <StatCard label="Identificador" value={identifierLabel} />
          <StatCard
            label="Garantía"
            value={`${warranty.product.warranty_months} meses`}
          />
          <StatCard label="Fecha" value={registeredAt} />
        </div>
      </section>

      <WarrantyVoidNotice
        status={warranty.status}
        voidReason={warranty.void_reason}
        voidedAt={warranty.voided_at}
        storeName={storeName}
      />

      {/* Detalle de la garantía */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {isMultiItemSale ? "Productos de la venta" : "Detalle de la garantía"}
          </h2>
          {isMultiItemSale && (
            <p className="text-xs text-gray-400 mt-1">
              Estás viendo la garantía de un producto. Cada ítem tiene su propio identificador y
              cobertura.
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Producto
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 w-20">
                  Cant.
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                  Identificador
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                  Cobertura
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 w-28">
                  Estado
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vencimiento
                </th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item) => {
                const isCurrent = item.id === warranty.id;
                const itemIdentifierLabel = getIdentifierLabel(item.product.category);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-50 ${isCurrent ? "bg-brand-light/20" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand mt-0.5">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{item.product.name}</p>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand bg-white border border-brand/15 rounded-full px-2 py-0.5">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {CATEGORY_LABELS[item.product.category]}
                            {!isMultiItemSale && " · producto con garantía"}
                          </p>
                          {!isMultiItemSale && (
                            <p className="text-xs text-gray-400 mt-1 md:hidden font-mono">
                              {item.identifier}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">1</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-700">{item.identifier}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {itemIdentifierLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 hidden sm:table-cell">
                      {item.product.warranty_months} meses
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCurrent ? (
                        <span className="font-medium text-gray-900">
                          {formatDate(item.warranty_end_date)}
                        </span>
                      ) : (
                        <Link
                          href={`/garantias/${item.id}`}
                          className="font-medium text-brand hover:opacity-80"
                        >
                          {formatDate(item.warranty_end_date)}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <WarrantyCoverageProgress
          saleDate={warranty.sale_date}
          warrantyEndDate={warranty.warranty_end_date}
          status={warranty.status}
        />

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            Cobertura de este producto hasta
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatDate(warranty.warranty_end_date)}
          </span>
        </div>
      </section>

      {/* Identificación y observaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Identificación
          </h2>
          {isMultiItemSale && saleLabel && (
            <InfoRow label="Venta" value={saleLabel} />
          )}
          <InfoRow
            label="Cliente"
            value={
              <Link
                href={`/clientes/${warranty.customer_id}`}
                className="link-brand font-medium"
              >
                {warranty.customer.name}
              </Link>
            }
          />
          <InfoRow
            label="Producto"
            value={
              <Link
                href={`/productos/${warranty.product_id}`}
                className="link-brand font-medium"
              >
                {warranty.product.name}
              </Link>
            }
          />
          <InfoRow
            label={identifierLabel}
            value={<span className="font-mono text-xs">{warranty.identifier}</span>}
          />
          <InfoRow label="Fecha de venta" value={formatDate(warranty.sale_date)} />
          <InfoRow label="Vencimiento" value={formatDate(warranty.warranty_end_date)} />
          {warranty.customer.document_number && (
            <InfoRow
              label="Documento"
              value={warranty.customer.document_number}
            />
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Observaciones de la venta
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Notas registradas al crear la garantía.
          </p>
          {saleNotes ? (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {saleNotes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin observaciones registradas.</p>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Registrada el {registeredAt} en {storeName}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
