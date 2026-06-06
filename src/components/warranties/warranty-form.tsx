"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker, todayIso } from "@/components/ui/date-picker";
import { createSaleWithWarranties } from "@/lib/actions/warranties";
import { CustomerFormModal } from "@/components/customers/customer-form-modal";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Customer, Product, ProductCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import {
  calculateWarrantyEndDate,
  calculateWarrantyStatus,
  formatDate,
  getIdentifierLabel,
} from "@/lib/warranty";

interface WarrantyFormProps {
  customers: Customer[];
  products: Product[];
}

type LineItem = {
  key: string;
  productId: string;
  productSearch: string;
  identifier: string;
};

function newLineItem(): LineItem {
  return {
    key: crypto.randomUUID(),
    productId: "",
    productSearch: "",
    identifier: "",
  };
}

const fieldInputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";

const actionLinkClass =
  "flex items-center gap-1 text-xs font-semibold text-brand hover:opacity-80 dark:text-indigo-300 dark:hover:text-indigo-200";

function SectionTitle({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">{children}</label>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-gray-500 shrink-0 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right dark:text-gray-100">{value || "—"}</span>
    </div>
  );
}

function ProductLineEditor({
  line,
  index,
  totalLines,
  products,
  saleDate,
  canRemove,
  onChange,
  onRemove,
  onOpenNewProduct,
}: {
  line: LineItem;
  index: number;
  totalLines: number;
  products: Product[];
  saleDate: string;
  canRemove: boolean;
  onChange: (key: string, patch: Partial<LineItem>) => void;
  onRemove: (key: string) => void;
  onOpenNewProduct: (key: string) => void;
}) {
  const selectedProduct = products.find((p) => p.id === line.productId);
  const identifierLabel = selectedProduct
    ? getIdentifierLabel(selectedProduct.category)
    : "Identificador";

  const trimmedSearch = line.productSearch.trim();
  const filteredProducts = useMemo(() => {
    if (trimmedSearch.length < 2) return [];
    const q = trimmedSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category as ProductCategory].toLowerCase().includes(q)
    );
  }, [products, trimmedSearch]);

  const previewEndDate =
    selectedProduct && saleDate
      ? calculateWarrantyEndDate(saleDate, selectedProduct.warranty_months)
      : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4 dark:border-gray-700 dark:bg-gray-800/40">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Producto {totalLines - index}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(line.key)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Quitar
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel>Producto</FieldLabel>
          <button
            type="button"
            onClick={() => onOpenNewProduct(line.key)}
            className={actionLinkClass}
          >
            <Plus className="h-3 w-3" /> Nuevo
          </button>
        </div>
        {selectedProduct ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-semibold">{selectedProduct.name}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                · {CATEGORY_LABELS[selectedProduct.category as ProductCategory]} ·{" "}
                {selectedProduct.warranty_months} meses
              </span>
            </p>
            <button
              type="button"
              onClick={() =>
                onChange(line.key, { productId: "", productSearch: "", identifier: "" })
              }
              className="text-xs font-semibold text-brand hover:opacity-80 shrink-0 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Ej. iPhone 15, iPad A16..."
              value={line.productSearch}
              onChange={(e) =>
                onChange(line.key, { productSearch: e.target.value, productId: "" })
              }
              className={fieldInputClass}
            />
            {trimmedSearch.length >= 2 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-white divide-y divide-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:divide-gray-800">
                {filteredProducts.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400 text-center dark:text-gray-500">
                    Sin resultados
                  </p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        onChange(line.key, { productId: p.id, productSearch: "" })
                      }
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      {p.name}
                      <span className="text-gray-400 ml-2 font-normal">
                        · {CATEGORY_LABELS[p.category as ProductCategory]}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <FieldLabel>{identifierLabel}</FieldLabel>
        <input
          type="text"
          value={line.identifier}
          onChange={(e) => onChange(line.key, { identifier: e.target.value })}
          disabled={!selectedProduct}
          inputMode={selectedProduct?.category === "telefonia" ? "numeric" : "text"}
          maxLength={selectedProduct?.category === "telefonia" ? 15 : undefined}
          placeholder={
            selectedProduct?.category === "telefonia"
              ? "15 dígitos numéricos"
              : "Referencia del producto"
          }
          className={`${fieldInputClass} disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500`}
        />
      </div>

      {selectedProduct && line.identifier.trim() && previewEndDate && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Vence {formatDate(previewEndDate)} · {selectedProduct.warranty_months} meses
        </p>
      )}
    </div>
  );
}

export function WarrantyForm({
  customers: initialCustomers,
  products: initialProducts,
}: WarrantyFormProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [products, setProducts] = useState(initialProducts);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [saleDate, setSaleDate] = useState(todayIso);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeLineKey, setActiveLineKey] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const trimmedCustomerSearch = customerSearch.trim();

  const filteredCustomers = useMemo(() => {
    if (trimmedCustomerSearch.length < 2) return [];
    const q = trimmedCustomerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.document_number?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.includes(trimmedCustomerSearch) ?? false)
    );
  }, [customers, trimmedCustomerSearch]);

  const showCustomerResults = trimmedCustomerSearch.length >= 2;

  function updateLine(key: string, patch: Partial<LineItem>) {
    setLineItems((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function addLine() {
    setLineItems((prev) => [newLineItem(), ...prev]);
  }

  function removeLine(key: string) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  function selectCustomer(id: string) {
    setCustomerId(id);
    setCustomerSearch("");
  }

  function handleCustomerCreated(customer: Customer) {
    setCustomers((prev) =>
      prev.some((c) => c.id === customer.id) ? prev : [customer, ...prev]
    );
    setCustomerId(customer.id);
    setCustomerSearch("");
    setShowCustomerModal(false);
    router.refresh();
  }

  function handleProductCreated(product: Product, productIdentifier?: string) {
    setProducts((prev) =>
      prev.some((p) => p.id === product.id) ? prev : [product, ...prev]
    );
    if (activeLineKey) {
      updateLine(activeLineKey, {
        productId: product.id,
        productSearch: "",
        identifier: productIdentifier ?? "",
      });
    }
    setShowProductModal(false);
    setActiveLineKey(null);
    router.refresh();
  }

  const completedLines = lineItems.filter(
    (line) => line.productId && line.identifier.trim()
  );

  const canSubmit =
    !!customerId &&
    !!saleDate &&
    completedLines.length === lineItems.length &&
    lineItems.length > 0;

  const worstStatus = useMemo(() => {
    if (!saleDate || completedLines.length === 0) return null;
    let status: ReturnType<typeof calculateWarrantyStatus> | null = null;
    for (const line of completedLines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue;
      const end = calculateWarrantyEndDate(saleDate, product.warranty_months);
      const s = calculateWarrantyStatus(end);
      if (!status) status = s;
      else if (s === "vencida") status = "vencida";
      else if (s === "por_vencer" && status === "vigente") status = "por_vencer";
    }
    return status;
  }, [completedLines, products, saleDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Completa el cliente, la fecha y todos los productos con su identificador");
      return;
    }

    startTransition(async () => {
      const result = await createSaleWithWarranties({
        customerId,
        saleDate,
        notes: notes.trim() || null,
        items: lineItems.map((line) => ({
          productId: line.productId,
          identifier: line.identifier.trim(),
        })),
      });

      if (result.error) {
        setError(result.error);
      } else if (result.warrantyIds?.length === 1) {
        router.push(`/garantias/${result.warrantyIds[0]}`);
        router.refresh();
      } else {
        router.push("/garantias");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6 flex items-start justify-between gap-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Garantías / Nueva garantía</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100">Nueva garantía</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl dark:text-gray-400">
            Puedes registrar varios productos a la vez. Cada uno queda con su propia
            garantía e identificador (IMEI o referencia).
          </p>
        </div>
        <Link
          href="/garantias"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <form id="warranty-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle required>Cliente</SectionTitle>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className={actionLinkClass}
                >
                  <Plus className="h-3 w-3" /> Nuevo cliente
                </button>
              </div>
              {selectedCustomer ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">{selectedCustomer.name}</span>
                    {selectedCustomer.document_number && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {" "}
                        · {selectedCustomer.document_number}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId("");
                      setCustomerSearch("");
                    }}
                    className="text-xs font-semibold text-brand hover:opacity-80 shrink-0 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <FieldLabel>Buscar por nombre o documento</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez, 1234567890..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      if (customerId) setCustomerId("");
                    }}
                    className={fieldInputClass}
                  />
                  {showCustomerResults && (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white divide-y divide-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:divide-gray-800">
                      {filteredCustomers.length === 0 ? (
                        <p className="px-4 py-8 text-sm text-gray-400 text-center dark:text-gray-500">
                          Sin resultados para &ldquo;{trimmedCustomerSearch}&rdquo;
                        </p>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCustomer(c.id)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            {c.name}
                            {c.document_number && (
                              <span className="text-gray-400 ml-2 font-normal">
                                · {c.document_number}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {!showCustomerResults && (
                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      Escribe al menos 2 caracteres para buscar un cliente.
                    </p>
                  )}
                </>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4">
                <SectionTitle required>Fecha de registro</SectionTitle>
              </div>
              <DatePicker
                name="sale_date"
                label="Fecha de venta"
                value={saleDate}
                onChange={setSaleDate}
                required
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle required>Productos</SectionTitle>
                <button
                  type="button"
                  onClick={addLine}
                  className={actionLinkClass}
                >
                  <Plus className="h-3 w-3" /> Agregar producto
                </button>
              </div>

              {lineItems.map((line, index) => (
                <ProductLineEditor
                  key={line.key}
                  line={line}
                  index={index}
                  totalLines={lineItems.length}
                  products={products}
                  saleDate={saleDate}
                  canRemove={lineItems.length > 1}
                  onChange={updateLine}
                  onRemove={removeLine}
                  onOpenNewProduct={(key) => {
                    setActiveLineKey(key);
                    setShowProductModal(true);
                  }}
                />
              ))}
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4">
                <SectionTitle>Notas</SectionTitle>
              </div>
              <FieldLabel>Observaciones (opcional)</FieldLabel>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Combo iPad + iPhone. Cliente solicitó factura a nombre de la empresa."
                className={`${fieldInputClass} resize-none`}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3">
                <SectionTitle>Resumen</SectionTitle>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <SummaryRow label="Cliente" value={selectedCustomer?.name} />
                <SummaryRow
                  label="Fecha de venta"
                  value={saleDate ? formatDate(saleDate) : null}
                />
                <SummaryRow
                  label="Productos"
                  value={
                    completedLines.length > 0
                      ? `${completedLines.length} de ${lineItems.length} listos`
                      : `${lineItems.length} producto${lineItems.length !== 1 ? "s" : ""}`
                  }
                />
              </div>

              {completedLines.length > 0 && (
                <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  {completedLines.map((line) => {
                    const product = products.find((p) => p.id === line.productId);
                    if (!product) return null;
                    const end = calculateWarrantyEndDate(
                      saleDate,
                      product.warranty_months
                    );
                    return (
                      <li
                        key={line.key}
                        className="text-xs text-gray-600 flex justify-between gap-2 dark:text-gray-400"
                      >
                        <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                          {product.name}
                        </span>
                        <span className="shrink-0 text-gray-400 dark:text-gray-500">
                          vence {formatDate(end)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {worstStatus && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Estado estimado</span>
                  <StatusBadge status={worstStatus} />
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium dark:text-red-300 dark:bg-red-500/10">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending || !canSubmit}
                className="w-full mt-5"
              >
                {isPending
                  ? "Registrando..."
                  : lineItems.length === 1
                    ? "Confirmar garantía"
                    : `Confirmar garantías (${lineItems.length} productos)`}
              </Button>
            </section>
          </div>
        </div>
      </form>

      <CustomerFormModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={handleCustomerCreated}
      />
      <ProductFormModal
        open={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setActiveLineKey(null);
        }}
        onSuccess={handleProductCreated}
        forWarranty
      />
    </>
  );
}
