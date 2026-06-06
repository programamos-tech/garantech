"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Pencil, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProductFormModal } from "@/components/products/product-form-modal";
import {
  formatDate,
  formatDateTime,
  getIdentifierLabel,
  shortProductId,
  shortWarrantyId,
  withRecalculatedStatus,
} from "@/lib/warranty";
import type { Customer, Product, WarrantyStatus } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

type WarrantyRow = {
  id: string;
  store_id: string;
  customer_id: string;
  product_id: string;
  sale_date: string;
  warranty_end_date: string;
  identifier: string;
  identifier_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  customer: Customer;
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4 border-r border-gray-100 last:border-r-0 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 truncate">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-1 truncate ${
          accent ? "text-amber-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
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

function SummaryMetric({
  title,
  value,
  sub,
  highlight,
}: {
  title: string;
  value: string | number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-brand-light/40 border-brand/10"
          : "bg-white border-gray-100"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

export function ProductDetailView({
  product,
  warranties: rawWarranties,
}: {
  product: Product;
  warranties: WarrantyRow[];
}) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  const warranties = useMemo(
    () =>
      rawWarranties.map((w) => ({
        ...w,
        status: withRecalculatedStatus({
          warranty_end_date: w.warranty_end_date,
          status: w.status as WarrantyStatus,
        }).status,
      })),
    [rawWarranties]
  );

  const stats = useMemo(() => {
    const vigentes = warranties.filter((w) => w.status === "vigente").length;
    const porVencer = warranties.filter((w) => w.status === "por_vencer").length;
    const vencidas = warranties.filter((w) => w.status === "vencida").length;
    const uniqueCustomers = new Set(warranties.map((w) => w.customer_id)).size;
    const coverageRate =
      warranties.length > 0 ? Math.round((vigentes / warranties.length) * 100) : 0;

    return {
      total: warranties.length,
      vigentes,
      porVencer,
      vencidas,
      uniqueCustomers,
      coverageRate,
    };
  }, [warranties]);

  const identifierLabel = getIdentifierLabel(product.category);
  const subtitle = [
    shortProductId(product.id),
    CATEGORY_LABELS[product.category],
    identifierLabel,
  ].join(" · ");

  function openWarranty(id: string) {
    router.push(`/garantias/${id}`);
  }

  function handleEditSuccess() {
    setShowEditModal(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Productos / {product.name}</p>
            <div className="flex items-start gap-4 mt-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Package className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/productos"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowEditModal(true)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Link href="/garantias/nueva">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Registrar garantía
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 border-t border-gray-100">
          <StatCard
            label="Garantía configurada"
            value={`${product.warranty_months} meses`}
            sub="Plazo por venta"
          />
          <StatCard label="Total registradas" value={stats.total} sub="Garantías del producto" />
          <StatCard label="Vigentes" value={stats.vigentes} sub="En cobertura" />
          <StatCard
            label="Por vencer"
            value={stats.porVencer}
            sub="Próximos 30 días"
            accent={stats.porVencer > 0}
          />
          <StatCard label="Vencidas" value={stats.vencidas} sub="Sin cobertura" />
        </div>
      </section>

      {/* Resumen de cobertura */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Resumen de cobertura
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Estado de las garantías registradas para este producto en tu tienda.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryMetric
            title="Garantías registradas"
            value={stats.total}
            sub="Ventas con garantía asociada"
          />
          <SummaryMetric
            title="En cobertura"
            value={stats.vigentes}
            sub={`${stats.porVencer} por vencer · ${stats.vencidas} vencidas`}
            highlight
          />
          <SummaryMetric
            title="Clientes con garantía"
            value={stats.uniqueCustomers}
            sub={
              stats.total > 0
                ? `${stats.coverageRate}% vigentes del total`
                : "Sin ventas registradas"
            }
          />
        </div>
      </section>

      {/* Tres columnas de detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Identificación
          </h2>
          <InfoRow label="Código" value={<span className="font-mono text-xs">{shortProductId(product.id)}</span>} />
          <InfoRow label="Categoría" value={CATEGORY_LABELS[product.category]} />
          <InfoRow label="Tipo de identificador" value={identifierLabel} />
          <InfoRow
            label="Producto desde"
            value={formatDate(product.created_at.split("T")[0])}
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Configuración de garantía
          </h2>
          <InfoRow label="Plazo" value={`${product.warranty_months} meses`} />
          <InfoRow label="Inicio de cobertura" value="Fecha de venta" />
          <InfoRow label="Fin de cobertura" value="Venta + plazo configurado" />
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.category === "telefonia"
                  ? "Cada venta requiere el IMEI de 15 dígitos del equipo. El identificador se ingresa al registrar la garantía, no en el catálogo."
                  : "Cada venta requiere la referencia o número de serie. El identificador se ingresa al registrar la garantía, no en el catálogo."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Últimas garantías
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            {stats.total > 0
              ? "Las ventas más recientes con este producto."
              : "Aún no hay garantías registradas."}
          </p>
          {!warranties.length ? (
            <Link
              href="/garantias/nueva"
              className="text-sm link-brand"
            >
              Registrar primera garantía →
            </Link>
          ) : (
            <ul className="divide-y divide-gray-50">
              {warranties.slice(0, 5).map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => openWarranty(w.id)}
                    className="w-full py-2.5 text-left hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {w.customer.name}
                      </span>
                      <StatusBadge status={w.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                      {w.identifier}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Listado completo de garantías */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Garantías
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Todas las ventas con garantía de este producto. Abre el detalle para ver cliente,
            identificador y fechas.
          </p>
        </div>

        {!warranties.length ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-400">Sin garantías registradas</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {warranties.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => openWarranty(w.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{w.customer.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {shortWarrantyId(w.id)} · Venta {formatDate(w.sale_date)} ·{" "}
                      {formatDateTime(w.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <p className="text-sm font-mono text-gray-600">{w.identifier}</p>
                    <StatusBadge status={w.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProductFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        product={product}
      />
    </div>
  );
}
