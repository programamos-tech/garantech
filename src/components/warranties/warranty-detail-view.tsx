import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
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
    <div className="px-5 py-4 border-r border-gray-100 last:border-r-0 min-w-0 dark:border-gray-800">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 truncate dark:text-gray-400">
        {label}
      </p>
      <div
        className={`text-lg font-bold mt-1 truncate ${
          accent ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm border-b border-gray-50 last:border-0 dark:border-gray-800">
      <span className="text-gray-500 shrink-0 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right dark:text-gray-100">{value}</span>
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
      <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800">
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-center dark:bg-gray-800/50 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Garantía anulada</p>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            La barra de cobertura no aplica porque esta garantía fue cancelada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mb-3 dark:text-gray-400">
        <span className="shrink-0">Venta {formatDate(saleDate)}</span>
        <span className="font-medium text-gray-700 text-center dark:text-gray-200">
          {status === "vencida"
            ? "Garantía vencida"
            : `${daysRemaining} ${daysRemaining === 1 ? "día restante" : "días restantes"}`}
        </span>
        <span className="shrink-0">Vence {formatDate(warrantyEndDate)}</span>
      </div>

      <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all ${progressBarStyles[status]}`}
          style={{ width: `${roundedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
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
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/garantias/${warranty.id}/certificado`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              Certificado
            </Link>
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
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
                    className={`border-b border-gray-50 dark:border-gray-800 ${
                      isCurrent ? "bg-brand-light/20 dark:bg-indigo-500/10" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand mt-0.5 dark:bg-indigo-500/20 dark:text-indigo-300">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.product.name}</p>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-brand bg-white border border-brand/15 rounded-full px-2 py-0.5 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
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
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">1</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{item.identifier}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {itemIdentifierLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 hidden sm:table-cell dark:text-gray-300">
                      {item.product.warranty_months} meses
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCurrent ? (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(item.warranty_end_date)}
                        </span>
                      ) : (
                        <Link
                          href={`/garantias/${item.id}`}
                          className="font-medium link-brand hover:opacity-80"
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

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/40">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Cobertura de este producto hasta
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 dark:bg-gray-800/50 dark:border-gray-700">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap dark:text-gray-300">
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
