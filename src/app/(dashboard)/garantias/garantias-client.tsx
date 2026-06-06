"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, shortSaleId, shortWarrantyId } from "@/lib/warranty";
import type { ProductCategory, WarrantyStatus, WarrantyWithRelations } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import {
  FilterBar,
  FilterField,
  FilterGrid,
  FilterSearch,
  PageActions,
  PageHeader,
  PageHeaderContent,
  ResponsiveTable,
} from "@/components/ui/responsive-list";

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

function getGroupLabel(group: WarrantyListGroup): string {
  const primary = group.items[0];
  return group.saleId ? shortSaleId(group.saleId) : shortWarrantyId(primary.id);
}

function getGroupStatus(group: WarrantyListGroup): WarrantyStatus {
  if (group.items.length > 1) return getWorstStatus(group.items);
  return group.items[0].status;
}

function getGroupProductsLabel(group: WarrantyListGroup): string {
  const primary = group.items[0];
  if (group.items.length === 1) return primary.product.name;
  return `${primary.product.name} · +${group.items.length - 1} más`;
}

function getGroupIdentifierLabel(group: WarrantyListGroup): string {
  if (group.items.length > 1) return `${group.items.length} identificadores`;
  return group.items[0].identifier;
}

function WarrantyGroupCard({
  group,
  onOpen,
}: {
  group: WarrantyListGroup;
  onOpen: (id: string) => void;
}) {
  const isMulti = group.items.length > 1;
  const primary = group.items[0];
  const worstStatus = getWorstStatus(group.items);
  const status = isMulti ? worstStatus : primary.status;

  return (
    <button
      type="button"
      onClick={() => onOpen(primary.id)}
      className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-brand/25 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-indigo-500/35 dark:focus:ring-indigo-400/20"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-gray-400 dark:text-gray-500" />
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
              {group.saleId ? shortSaleId(group.saleId) : shortWarrantyId(primary.id)}
            </p>
            {isMulti && (
              <p className="text-[11px] text-gray-400 mt-0.5 dark:text-gray-500">
                {group.items.length} productos
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="font-semibold text-gray-900 truncate dark:text-gray-100">
        {primary.customer.name}
      </p>
      <p
        className="text-sm text-gray-600 mt-1 line-clamp-2 dark:text-gray-300"
        title={isMulti ? getProductNamesTooltip(group.items) : primary.product.name}
      >
        {primary.product.name}
        {isMulti && (
          <span className="text-gray-400 dark:text-gray-500"> · +{group.items.length - 1} más</span>
        )}
      </p>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateTime(group.sortDate)}
        </p>
        <p className="text-xs font-mono text-gray-400 truncate dark:text-gray-500">
          {isMulti ? `${group.items.length} identificadores` : primary.identifier}
        </p>
      </div>
    </button>
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
      <PageHeader>
        <PageHeaderContent>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Garantías de productos
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl dark:text-gray-400">
            Registra ventas, consulta vigencia y gestiona la postventa de tus productos.
          </p>
        </PageHeaderContent>
        <PageActions>
          <Link href="/garantias/nueva" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Nueva garantía
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </PageActions>
      </PageHeader>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <FilterBar>
          <FilterSearch>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Buscar por ID, cliente, producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </FilterSearch>

          <FilterGrid>
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
          </FilterGrid>
        </FilterBar>

        {grouped.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No se encontraron garantías</p>
            <Link href="/garantias/nueva" className="inline-block mt-3 text-sm link-brand">
              Registrar primera garantía →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:hidden">
              {grouped.map((group) => (
                <WarrantyGroupCard
                  key={group.key}
                  group={group}
                  onOpen={goToWarranty}
                />
              ))}
            </div>

            <ResponsiveTable>
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Garantía
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Cliente
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Productos
                    </th>
                    <th className="hidden xl:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Identificador
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((group, index) => {
                    const primary = group.items[0];
                    const isMulti = group.items.length > 1;

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
                        className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-brand-light/40 focus:bg-brand-light/50 focus:outline-none dark:border-gray-800 dark:hover:bg-indigo-500/10 dark:focus:bg-indigo-500/12 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50/30 dark:bg-gray-900/50"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                                {getGroupLabel(group)}
                              </p>
                              {isMulti && (
                                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                                  {group.items.length} productos
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatDateTime(group.sortDate)}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                          {primary.customer.name}
                        </td>
                        <td
                          className="max-w-[240px] truncate px-5 py-4 text-gray-600 dark:text-gray-300"
                          title={isMulti ? getProductNamesTooltip(group.items) : primary.product.name}
                        >
                          {getGroupProductsLabel(group)}
                        </td>
                        <td className="hidden xl:table-cell px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {getGroupIdentifierLabel(group)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={getGroupStatus(group)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ResponsiveTable>
          </>
        )}
      </div>
    </div>
  );
}
