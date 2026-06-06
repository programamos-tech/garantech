import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClaimStatusBadge } from "@/components/gestion/claim-status-badge";
import { ClaimStatusActions } from "@/components/gestion/claim-status-actions";
import type { Sale, WarrantyClaimWithRelations } from "@/lib/types";
import { CATEGORY_LABELS, CLAIM_TYPE_LABELS } from "@/lib/types";
import { shortClaimId } from "@/lib/claim";
import {
  formatDate,
  formatDateTimeDetail,
  getIdentifierLabel,
  shortSaleId,
  shortWarrantyId,
} from "@/lib/warranty";

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

export function ClaimDetailView({
  claim,
  storeName,
  sale,
}: {
  claim: WarrantyClaimWithRelations;
  storeName: string;
  sale: Sale | null;
}) {
  const { warranty } = claim;
  const claimId = shortClaimId(claim.id);
  const warrantyId = shortWarrantyId(warranty.id);
  const identifierLabel = getIdentifierLabel(warranty.product.category);
  const registeredAt = formatDateTimeDetail(claim.created_at);
  const saleLabel = sale ? shortSaleId(sale.id) : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Reclamos / Reclamo {claimId}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Reclamo {claimId}</h1>
            <p className="text-sm text-gray-500 mt-2">
              {registeredAt} · {warranty.customer.name} · {storeName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/gestion"
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
            value={<ClaimStatusBadge status={claim.status} showDot />}
          />
          <StatCard
            label="Tipo"
            value={
              claim.claim_type ? CLAIM_TYPE_LABELS[claim.claim_type] : "—"
            }
          />
          <StatCard
            label="Cobertura"
            value={`${warranty.product.warranty_months} meses`}
          />
          <StatCard label="Fecha" value={registeredAt} />
        </div>
      </section>

      {/* Gestión del reclamo — visible arriba para operación diaria */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Gestión del reclamo
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {claim.claim_type === "cambio"
              ? "Flujo: diagnóstico → autorizar cambio → entregar y cerrar."
              : claim.claim_type === "devolucion"
                ? "Flujo: diagnóstico → autorizar devolución → confirmar y cerrar."
                : claim.claim_type === "reparacion"
                  ? "Flujo: diagnóstico → aprobar reparación → entregar y cerrar."
                  : "Avanza el reclamo según el flujo operativo de postventa."}
          </p>
        </div>
        <ClaimStatusActions claim={claim} />
      </section>

      {/* Detalle del reclamo */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Detalle del reclamo
          </h2>
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
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                  Cobertura
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                  {identifierLabel}
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vencimiento
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand mt-0.5">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {warranty.product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {CATEGORY_LABELS[warranty.product.category]} · producto con
                        garantía
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">1</td>
                <td className="px-6 py-4 text-gray-700 hidden sm:table-cell">
                  {warranty.product.warranty_months} meses
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="font-mono text-xs text-gray-700">
                    {warranty.identifier}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  {formatDate(warranty.warranty_end_date)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Cobertura de venta</span>
            <StatusBadge status={warranty.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Vence</span>
            <span className="text-lg font-bold text-gray-900">
              {formatDate(warranty.warranty_end_date)}
            </span>
          </div>
        </div>
      </section>

      {/* Identificación y motivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Identificación
          </h2>
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
            label="Garantía"
            value={
              <Link
                href={`/garantias/${warranty.id}`}
                className="link-brand font-medium font-mono text-xs"
              >
                {warrantyId}
              </Link>
            }
          />
          {saleLabel && (
            <InfoRow
              label="Venta"
              value={
                <Link
                  href={`/garantias/${warranty.id}`}
                  className="link-brand font-medium font-mono text-xs"
                >
                  {saleLabel}
                </Link>
              }
            />
          )}
          <InfoRow label="Fecha de venta" value={formatDate(warranty.sale_date)} />
          {warranty.customer.document_number && (
            <InfoRow
              label="Documento"
              value={warranty.customer.document_number}
            />
          )}
          <InfoRow
            label={identifierLabel}
            value={
              <span className="font-mono text-xs">{warranty.identifier}</span>
            }
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Motivo de la garantía
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Registrado al iniciar la gestión postventa.
          </p>
          {claim.intake_notes ? (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {claim.intake_notes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin motivo registrado.</p>
          )}

          {(claim.diagnosis_notes || claim.resolution_notes) && (
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-4">
              {claim.diagnosis_notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Diagnóstico
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {claim.diagnosis_notes}
                  </p>
                </div>
              )}
              {claim.resolution_notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Resolución
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {claim.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {claim.closed_at
                ? `Cerrado el ${formatDateTimeDetail(claim.closed_at)} · ${storeName}`
                : `Actualizado el ${formatDateTimeDetail(claim.updated_at)} · ${storeName}`}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
