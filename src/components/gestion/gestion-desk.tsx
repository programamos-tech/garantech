"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, RefreshCw, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ClaimStatusBadge } from "@/components/gestion/claim-status-badge";
import { shortClaimId, isTerminalClaimStatus } from "@/lib/claim";
import type {
  WarrantyClaimStatus,
  WarrantyClaimType,
  WarrantyClaimWithRelations,
} from "@/lib/types";
import { CLAIM_STATUS_LABELS, CLAIM_TYPE_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/warranty";
import {
  FilterBar,
  FilterField,
  FilterGrid,
  FilterSearch,
  PageActions,
  PageHeader,
  PageHeaderContent,
  ResponsiveCardItem,
  ResponsiveCardList,
  ResponsiveTable,
} from "@/components/ui/responsive-list";

const statusFilters: { value: WarrantyClaimStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...Object.entries(CLAIM_STATUS_LABELS).map(([value, label]) => ({
    value: value as WarrantyClaimStatus,
    label,
  })),
];

const typeFilters: { value: WarrantyClaimType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => ({
    value: value as WarrantyClaimType,
    label,
  })),
];

export function GestionDesk({
  claims,
}: {
  claims: WarrantyClaimWithRelations[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyClaimStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<WarrantyClaimType | "all">("all");

  const filteredClaims = useMemo(() => {
    let result = claims;

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((c) => c.claim_type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.warranty.customer.name.toLowerCase().includes(q) ||
          c.warranty.identifier.toLowerCase().includes(q) ||
          c.warranty.product.name.toLowerCase().includes(q) ||
          shortClaimId(c.id).toLowerCase().includes(q)
      );
    }

    return result;
  }, [claims, statusFilter, typeFilter, search]);

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function goToClaim(id: string) {
    router.push(`/gestion/reclamos/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderContent>
          <h1 className="text-2xl font-bold text-gray-900">Reclamos</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Consulta reclamos abiertos y cerrados, valida cobertura y gestiona la postventa.
          </p>
        </PageHeaderContent>
        <PageActions>
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

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <FilterBar className="dark:border-gray-800">
          <FilterSearch>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por ID, cliente, producto o identificador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </FilterSearch>

          <FilterGrid>
            <FilterField label="Estado">
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as WarrantyClaimStatus | "all")
                }
                options={statusFilters.map((f) => ({ value: f.value, label: f.label }))}
                className="py-2.5 border-gray-200"
              />
            </FilterField>

            <FilterField label="Tipo">
              <Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as WarrantyClaimType | "all")
                }
                options={typeFilters.map((f) => ({ value: f.value, label: f.label }))}
                className="py-2.5 border-gray-200"
              />
            </FilterField>
          </FilterGrid>
        </FilterBar>

        {filteredClaims.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">No se encontraron reclamos</p>
          </div>
        ) : (
          <>
            <ResponsiveCardList>
              {filteredClaims.map((claim) => {
                const isClosed = isTerminalClaimStatus(claim.status);
                return (
                  <ResponsiveCardItem
                    key={claim.id}
                    onClick={() => goToClaim(claim.id)}
                    className={isClosed ? "opacity-75" : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {shortClaimId(claim.id)}
                        </p>
                        <p className="font-medium text-gray-900 mt-1 truncate dark:text-gray-100">
                          {claim.warranty.customer.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 truncate dark:text-gray-400">
                          {claim.warranty.product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono dark:text-gray-500">
                          {claim.warranty.identifier}
                        </p>
                      </div>
                      <ClaimStatusBadge status={claim.status} showDot />
                    </div>
                  </ResponsiveCardItem>
                );
              })}
            </ResponsiveCardList>

            <ResponsiveTable>
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reclamo
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Cliente
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Producto
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
                  {filteredClaims.map((claim, index) => {
                    const isClosed = isTerminalClaimStatus(claim.status);

                    return (
                      <tr
                        key={claim.id}
                        onClick={() => goToClaim(claim.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToClaim(claim.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        className={`border-b border-gray-50 transition-colors cursor-pointer hover:bg-amber-50/40 focus:outline-none focus:bg-amber-50/60 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        } ${isClosed ? "opacity-75" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand dark:bg-indigo-500/20 dark:text-indigo-300">
                              <Wrench className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900 font-mono text-xs">
                              {shortClaimId(claim.id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap">
                          {formatDateTime(claim.created_at)}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {claim.warranty.customer.name}
                        </td>
                        <td className="px-5 py-4 max-w-[220px] truncate text-gray-600">
                          {claim.warranty.product.name}
                        </td>
                        <td className="px-5 py-4 text-gray-500 hidden lg:table-cell font-mono text-xs">
                          {claim.warranty.identifier}
                        </td>
                        <td className="px-5 py-4">
                          <ClaimStatusBadge status={claim.status} showDot />
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
            </ResponsiveTable>
          </>
        )}
      </div>
    </div>
  );
}
