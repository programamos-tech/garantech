"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw, Eye, Pencil, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ProductFormModal } from "@/components/products/product-form-modal";
import {
  getIdentifierLabel,
  shortProductId,
} from "@/lib/warranty";
import type { ProductCategory, ProductWithStats } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const categoryFilters: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ProductCategory,
    label,
  })),
];

const identifierFilters = [
  { value: "all", label: "Todos" },
  { value: "imei", label: "IMEI" },
  { value: "referencia", label: "Referencia" },
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

function IdentifierBadge({ category }: { category: ProductCategory }) {
  const isImei = category === "telefonia";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isImei
          ? "bg-blue-50 text-blue-700"
          : "bg-violet-50 text-violet-700"
      }`}
    >
      {getIdentifierLabel(category)}
    </span>
  );
}

export function ProductosClient({
  initialProducts,
}: {
  initialProducts: ProductWithStats[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [identifierFilter, setIdentifierFilter] = useState<"all" | "imei" | "referencia">(
    "all"
  );
  const [editingProduct, setEditingProduct] = useState<ProductWithStats | null>(null);

  const filtered = useMemo(() => {
    let result = initialProducts;

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (identifierFilter === "imei") {
      result = result.filter((p) => p.category === "telefonia");
    } else if (identifierFilter === "referencia") {
      result = result.filter((p) => p.category !== "telefonia");
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          shortProductId(p.id).toLowerCase().includes(q) ||
          CATEGORY_LABELS[p.category].toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialProducts, categoryFilter, identifierFilter, search]);

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function handleFormSuccess() {
    setEditingProduct(null);
    router.refresh();
  }

  function goToProduct(id: string) {
    router.push(`/productos/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Catálogo de productos con garantía. Define categoría, plazo de cobertura e
            identificador para registrar ventas.
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
          <Link href="/productos/nuevo">
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 p-4 sm:p-5 border-b border-gray-100">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Nombre o código (ej. iPhone 15, A1B2C3D4)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
            <FilterField label="Identificador">
              <Select
                value={identifierFilter}
                onChange={(e) =>
                  setIdentifierFilter(e.target.value as "all" | "imei" | "referencia")
                }
                options={identifierFilters}
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

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              {search || categoryFilter !== "all" || identifierFilter !== "all"
                ? "No se encontraron productos"
                : "No hay productos registrados"}
            </p>
            {!search && categoryFilter === "all" && identifierFilter === "all" && (
              <Link href="/productos/nuevo" className="inline-block mt-3 text-sm link-brand">
                Registrar primer producto →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Producto
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                    Código
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Garantía
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                    Identificador
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden xl:table-cell">
                    Registradas
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr
                    key={product.id}
                    onClick={() => goToProduct(product.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToProduct(product.id);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    className={`border-b border-gray-50 transition-colors cursor-pointer hover:bg-amber-50/40 focus:outline-none focus:bg-amber-50/60 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs hidden sm:table-cell">
                      {shortProductId(product.id)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                      {CATEGORY_LABELS[product.category]}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {product.warranty_months} meses
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <IdentifierBadge category={product.category} />
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden xl:table-cell">
                      {product.warranty_count}{" "}
                      {product.warranty_count === 1 ? "garantía" : "garantías"}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/productos/${product.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <Link
                          href="/garantias/nueva"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand transition-colors"
                          title="Registrar garantía"
                        >
                          <Plus className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={handleFormSuccess}
        product={editingProduct}
      />
    </div>
  );
}
