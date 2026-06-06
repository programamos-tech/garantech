"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatDateTime,
  shortWarrantyId,
  withRecalculatedStatus,
} from "@/lib/warranty";
import type { Customer, Product, WarrantyStatus } from "@/lib/types";

function formatDocument(doc: string | null): string {
  if (!doc) return "Sin documento";
  return doc;
}

function contactLine(customer: Customer): string {
  return [
    formatDocument(customer.document_number),
    customer.phone || "Sin teléfono",
    customer.email || "Sin correo",
  ].join(" · ");
}

type WarrantyRow = {
  id: string;
  sale_date: string;
  warranty_end_date: string;
  identifier: string;
  identifier_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  product: Product;
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
    <div className="px-5 py-4 border-r border-gray-100 last:border-r-0 min-w-0 dark:border-gray-800">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 truncate dark:text-gray-400">
        {label}
      </p>
      <p
        className={`text-xl font-bold mt-1 truncate ${
          accent ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 mt-0.5 truncate dark:text-gray-500">{sub}</p>
      )}
    </div>
  );
}

export function CustomerDetailView({
  customer,
  warranties: rawWarranties,
}: {
  customer: Customer;
  warranties: WarrantyRow[];
}) {
  const router = useRouter();

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
    return { total: warranties.length, vigentes, porVencer, vencidas };
  }, [warranties]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of warranties) {
      counts.set(w.product.name, (counts.get(w.product.name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [warranties]);

  function openWarranty(id: string) {
    router.push(`/garantias/${id}`);
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Clientes / {customer.name}</p>
            <div className="flex items-center gap-4 mt-3">
              <UserAvatar seed={customer.id} name={customer.name} size={56} />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate dark:text-gray-100">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1 truncate dark:text-gray-400">
                  {contactLine(customer)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/clientes"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/garantias/nueva">
              <Button size="sm">+ Registrar garantía</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
          <StatCard label="Total garantías" value={stats.total} sub="Registradas" />
          <StatCard label="Vigentes" value={stats.vigentes} sub="En cobertura" />
          <StatCard
            label="Por vencer"
            value={stats.porVencer}
            sub="Próximos 30 días"
            accent={stats.porVencer > 0}
          />
          <StatCard label="Vencidas" value={stats.vencidas} sub="Sin cobertura" />
          <StatCard
            label="Cliente desde"
            value={formatDate(customer.created_at.split("T")[0])}
            sub={formatDateTime(customer.created_at)}
          />
        </div>
      </section>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Garantías */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Garantías
            </h2>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              Productos registrados con garantía para este cliente. Abre el detalle para ver
              identificador, fechas y estado.
            </p>
          </div>

          {!warranties.length ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">Sin garantías registradas</p>
              <Link href="/garantias/nueva" className="inline-block mt-3 text-sm link-brand">
                Registrar primera garantía →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {warranties.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => openWarranty(w.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/60"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate dark:text-gray-100">
                        {w.product.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                        {shortWarrantyId(w.id)} · Venta {formatDate(w.sale_date)} ·{" "}
                        {formatDateTime(w.created_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                        {w.identifier}
                      </p>
                      <StatusBadge status={w.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top productos */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden lg:sticky lg:top-20 dark:border-gray-800 dark:bg-gray-900">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Top productos con garantía
            </h2>
          </div>
          {!topProducts.length ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center dark:text-gray-500">
              Sin datos
            </p>
          ) : (
            <ol className="divide-y divide-gray-50 dark:divide-gray-800">
              {topProducts.map(([name, count], index) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span className="text-gray-900 truncate dark:text-gray-100">
                    <span className="text-gray-400 mr-2 dark:text-gray-500">{index + 1}.</span>
                    {name}
                  </span>
                  <span className="text-gray-500 shrink-0 dark:text-gray-400">
                    {count} {count === 1 ? "vez" : "veces"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

    </div>
  );
}
