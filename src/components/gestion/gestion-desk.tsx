"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClaimStatusBadge } from "@/components/gestion/claim-status-badge";
import { searchByDocument, searchByIdentifier } from "@/lib/actions/claims";
import { shortClaimId, isTerminalClaimStatus } from "@/lib/claim";
import type {
  IdentifierSearchResult,
  ManagementWarrantyItem,
  WarrantyClaimStatus,
  WarrantyClaimType,
  WarrantyClaimWithRelations,
} from "@/lib/types";
import { CLAIM_STATUS_LABELS, CLAIM_TYPE_LABELS } from "@/lib/types";
import { formatDateTime, shortWarrantyId } from "@/lib/warranty";

type ViewMode = "claims" | "imei" | "document";
type ScopeFilter = "all" | "open" | "closed";

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

const viewModeFilters: { value: ViewMode; label: string }[] = [
  { value: "claims", label: "Reclamos" },
  { value: "imei", label: "IMEI / Referencia" },
  { value: "document", label: "Cédula" },
];

const scopeFilters: { value: ScopeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "closed", label: "Cerrados" },
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

function InlineAlert({
  title,
  description,
  detail,
}: {
  title: string;
  description: string;
  detail?: React.ReactNode;
}) {
  return (
    <div className="mx-5 my-6 rounded-xl border border-red-100 bg-red-50/60 p-5">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">{title}</p>
          <p className="text-sm text-red-700/90 mt-1">{description}</p>
          {detail && <div className="mt-3 text-sm text-red-800">{detail}</div>}
        </div>
      </div>
    </div>
  );
}

function WarrantySearchTable({
  items,
  onManage,
}: {
  items: ManagementWarrantyItem[];
  onManage: (warrantyId: string, openClaimId: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
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
              Cobertura
            </th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const { warranty, coverage, openClaimId } = item;
            const canManage = coverage === "cubierta";

            return (
              <tr
                key={warranty.id}
                className={`border-b border-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className="px-5 py-4 font-medium text-gray-900">
                  {warranty.customer.name}
                </td>
                <td className="px-5 py-4 text-gray-600 max-w-[220px] truncate">
                  {warranty.product.name}
                </td>
                <td className="px-5 py-4 text-gray-500 hidden lg:table-cell font-mono text-xs">
                  {warranty.identifier}
                </td>
                <td className="px-5 py-4">
                  {coverage === "sin_cobertura" ? (
                    <span className="text-xs font-medium text-red-600">Sin cobertura</span>
                  ) : (
                    <StatusBadge status={warranty.status} />
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {canManage ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onManage(warranty.id, openClaimId)}
                    >
                      {openClaimId ? "Reanudar" : "Gestionar"}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function GestionDesk({
  claims,
}: {
  claims: WarrantyClaimWithRelations[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [isSearching, startSearch] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("claims");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyClaimStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<WarrantyClaimType | "all">("all");
  const [documentResults, setDocumentResults] = useState<ManagementWarrantyItem[] | null>(
    null
  );
  const [identifierResult, setIdentifierResult] = useState<IdentifierSearchResult | null>(
    null
  );
  const [searchError, setSearchError] = useState("");

  const filteredClaims = useMemo(() => {
    let result = claims;

    if (scopeFilter === "open") {
      result = result.filter((c) => !isTerminalClaimStatus(c.status));
    } else if (scopeFilter === "closed") {
      result = result.filter((c) => isTerminalClaimStatus(c.status));
    }

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
  }, [claims, scopeFilter, statusFilter, typeFilter, search]);

  const identifierSearchItems = useMemo((): ManagementWarrantyItem[] | null => {
    if (!identifierResult || identifierResult.coverage === "sin_registro") return null;
    if (!identifierResult.warranty) return null;
    return [
      {
        warranty: identifierResult.warranty,
        coverage: identifierResult.coverage,
        openClaimId: identifierResult.openClaimId,
      },
    ];
  }, [identifierResult]);

  const warrantySearchItems =
    documentResults ??
    (identifierSearchItems && identifierResult?.coverage !== "sin_cobertura"
      ? identifierSearchItems
      : null);

  const showIdentifierRejection =
    identifierResult?.coverage === "sin_cobertura" && identifierResult.warranty;

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function handleManage(warrantyId: string, openClaimId: string | null) {
    if (openClaimId) {
      router.push(`/gestion/reclamos/${openClaimId}`);
      return;
    }
    router.push(`/garantias/${warrantyId}/gestionar`);
  }

  function goToClaim(id: string) {
    router.push(`/gestion/reclamos/${id}`);
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    setSearch("");
    setSearchError("");
    setDocumentResults(null);
    setIdentifierResult(null);
  }

  function runWarrantySearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!search.trim()) return;

    setSearchError("");
    setDocumentResults(null);
    setIdentifierResult(null);

    startSearch(async () => {
      if (viewMode === "document") {
        const results = await searchByDocument(search.trim());
        setDocumentResults(results);
        if (results.length === 0) {
          setSearchError("No hay garantías registradas para esta cédula");
        }
        return;
      }

      const result = await searchByIdentifier(search.trim());
      setIdentifierResult(result);
      if (result.coverage === "sin_registro") {
        setSearchError("No hay garantía registrada para este IMEI o referencia");
      }
    });
  }

  const searchPlaceholder =
    viewMode === "claims"
      ? "Buscar por ID, cliente, producto o identificador..."
      : viewMode === "imei"
        ? "IMEI o referencia del producto..."
        : "Número de documento del cliente...";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reclamos</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Consulta reclamos abiertos y cerrados, valida cobertura y gestiona la postventa.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <form
          onSubmit={(e) => {
            if (viewMode === "claims") {
              e.preventDefault();
              return;
            }
            runWarrantySearch(e);
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 p-4 sm:p-5 border-b border-gray-100">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              <FilterField label="Buscar en">
                <Select
                  value={viewMode}
                  onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
                  options={viewModeFilters.map((f) => ({ value: f.value, label: f.label }))}
                  className="py-2.5 border-gray-200"
                />
              </FilterField>

              {viewMode === "claims" && (
                <>
                  <FilterField label="Ámbito">
                    <Select
                      value={scopeFilter}
                      onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
                      options={scopeFilters.map((f) => ({ value: f.value, label: f.label }))}
                      className="py-2.5 border-gray-200"
                    />
                  </FilterField>

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
                </>
              )}

              {viewMode !== "claims" && (
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={isSearching || !search.trim()}
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    <Search className="h-4 w-4" />
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>

        {viewMode === "claims" ? (
          filteredClaims.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-500">No se encontraron reclamos</p>
              {scopeFilter === "open" && (
                <p className="text-xs text-gray-400 mt-2">
                  Prueba cambiar el ámbito a <strong>Todos</strong> o{" "}
                  <strong>Cerrados</strong> para ver reclamos finalizados.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
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
            </div>
          )
        ) : (
          <>
            {searchError && (
              <InlineAlert title="Sin resultados" description={searchError} />
            )}

            {showIdentifierRejection && identifierResult?.warranty && (
              <InlineAlert
                title="No se recibe en garantía"
                description="La cobertura está vencida o fue anulada. No es posible abrir un reclamo."
                detail={
                  <div className="rounded-xl border border-red-100 bg-white/80 p-4 space-y-1">
                    <p>
                      <span className="text-red-600/70">Cliente:</span>{" "}
                      {identifierResult.warranty.customer.name}
                    </p>
                    <p>
                      <span className="text-red-600/70">Producto:</span>{" "}
                      {identifierResult.warranty.product.name}
                    </p>
                    <p>
                      <span className="text-red-600/70">Garantía:</span>{" "}
                      {shortWarrantyId(identifierResult.warranty.id)}
                    </p>
                  </div>
                }
              />
            )}

            {!searchError &&
              !showIdentifierRejection &&
              !warrantySearchItems &&
              !isSearching && (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm text-gray-500">
                    {viewMode === "imei"
                      ? "Ingresa un IMEI o referencia y pulsa Buscar"
                      : "Ingresa la cédula del cliente y pulsa Buscar"}
                  </p>
                </div>
              )}

            {warrantySearchItems && warrantySearchItems.length > 0 && !isSearching && (
              <WarrantySearchTable items={warrantySearchItems} onManage={handleManage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
