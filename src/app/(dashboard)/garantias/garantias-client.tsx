"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw, ShieldCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, shortSaleId, shortWarrantyId } from "@/lib/warranty";
import type { ProductCategory, WarrantyStatus, WarrantyWithRelations } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

type WarrantyListGroup = {
  key: string;
  saleId: string | null;
  items: WarrantyWithRelations[];
  sortDate: string;
};

const STATUS_PRIORITY: Record<WarrantyStatus, number> = {
  vencida: 4,
  anulada: 3,
  por_vencer: 2,
  vigente: 1,
};

function getWorstStatus(items: WarrantyWithRelations[]): WarrantyStatus {
  return items.reduce(
    (worst, item) =>
      STATUS_PRIORITY[item.status] > STATUS_PRIORITY[worst] ? item.status : worst,
    items[0].status
  );
}

function getProductNamesTooltip(items: WarrantyWithRelations[]): string {
  return items.map((item) => item.product.name).join(" · ");
}

function groupWarrantiesForList(
  warranties: WarrantyWithRelations[]
): WarrantyListGroup[] {
  const saleGroups = new Map<string, WarrantyWithRelations[]>();
  const singles: WarrantyWithRelations[] = [];

  for (const warranty of warranties) {
    if (warranty.sale_id) {
      const group = saleGroups.get(warranty.sale_id) ?? [];
      group.push(warranty);
      saleGroups.set(warranty.sale_id, group);
    } else {
      singles.push(warranty);
    }
  }

  const groups: WarrantyListGroup[] = [];

  for (const [saleId, items] of saleGroups) {
    const sorted = [...items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    groups.push({
      key: saleId,
      saleId,
      items: sorted,
      sortDate: sorted[sorted.length - 1]?.created_at ?? sorted[0].created_at,
    });
  }

  for (const warranty of singles) {
    groups.push({
      key: warranty.id,
      saleId: null,
      items: [warranty],
      sortDate: warranty.created_at,
    });
  }

  return groups.sort(
    (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
  );
}

const statusFilters: { value: WarrantyStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "vigente", label: "Vigentes" },
  { value: "por_vencer", label: "Por vencer" },
  { value: "vencida", label: "Vencidas" },
  { value: "anulada", label: "Anuladas" },
];

const categoryFilters: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ProductCategory,
    label,
  })),
];

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 shrink-0 w-full sm:w-40">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </div>
  );
}

export function GarantiasClient({
  initialWarranties,
}: {
  initialWarranties: WarrantyWithRelations[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = initialWarranties;

    if (statusFilter !== "all") {
      result = result.filter((w) => w.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((w) => w.product.category === categoryFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.customer.name.toLowerCase().includes(q) ||
          w.identifier.toLowerCase().includes(q) ||
          w.product.name.toLowerCase().includes(q) ||
          shortWarrantyId(w.id).toLowerCase().includes(q) ||
          (w.sale_id && shortSaleId(w.sale_id).toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialWarranties, statusFilter, categoryFilter, search]);

  const grouped = useMemo(
    () => groupWarrantiesForList(filtered),
    [filtered]
  );

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function goToWarranty(id: string) {
    router.push(`/garantias/${id}`);
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garantías de productos</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Registra ventas, consulta vigencia y gestiona la postventa de tus productos.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/garantias/nueva">
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Nueva garantía
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Card principal */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 p-4 sm:p-5 border-b border-gray-100">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por ID, cliente, producto o identificador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
            <FilterField label="Estado">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WarrantyStatus | "all")}
                options={statusFilters.map((f) => ({ value: f.value, label: f.label }))}
                className="py-2.5 border-gray-200"
              />
            </FilterField>

            <FilterField label="Categoría">
              <Select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as ProductCategory | "all")
                }
                options={categoryFilters.map((f) => ({ value: f.value, label: f.label }))}
                className="py-2.5 border-gray-200"
              />
            </FilterField>
          </div>
        </div>

        {/* Tabla */}
        {grouped.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No se encontraron garantías</p>
            <Link href="/garantias/nueva" className="inline-block mt-3 text-sm link-brand">
              Registrar primera garantía →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Garantía
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cliente
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Productos
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                    Identificador
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((group, index) => {
                  const isMulti = group.items.length > 1;
                  const primary = group.items[0];
                  const worstStatus = getWorstStatus(group.items);

                  return (
                    <tr
                      key={group.key}
                      onClick={() => goToWarranty(primary.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToWarranty(primary.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className={`border-b border-gray-50 transition-colors cursor-pointer hover:bg-amber-50/40 focus:outline-none focus:bg-amber-50/60 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand dark:bg-indigo-500/20 dark:text-indigo-300">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 font-mono text-xs block">
                              {group.saleId
                                ? shortSaleId(group.saleId)
                                : shortWarrantyId(primary.id)}
                            </span>
                            {isMulti && (
                              <span className="text-[11px] text-gray-400">
                                {group.items.length} productos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {formatDateTime(group.sortDate)}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {primary.customer.name}
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        <div
                          className="flex items-center gap-2 min-w-0"
                          title={isMulti ? getProductNamesTooltip(group.items) : undefined}
                        >
                          <span className="truncate text-sm text-gray-600">
                            {primary.product.name}
                          </span>
                          {isMulti && (
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                              +{group.items.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                        {isMulti ? (
                          <span className="text-xs">
                            {group.items.length} identificadores
                          </span>
                        ) : (
                          <span className="font-mono text-xs">{primary.identifier}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={isMulti ? worstStatus : primary.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-400">
                          <Eye className="h-4 w-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
