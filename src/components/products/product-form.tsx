"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FormLayoutGrid,
  FormMainColumn,
  FormSidebarColumn,
} from "@/components/ui/responsive-list";
import { createProduct } from "@/lib/actions/products";
import { CATEGORY_LABELS } from "@/lib/types";
import type { ProductCategory } from "@/lib/types";
import { getIdentifierLabel } from "@/lib/warranty";

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-gray-500 shrink-0 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right dark:text-gray-100">{value || "—"}</span>
    </div>
  );
}

export function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("telefonia");
  const [warrantyMonths, setWarrantyMonths] = useState("12");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const months = parseInt(warrantyMonths, 10) || 0;
  const identifierLabel = getIdentifierLabel(category);
  const canSubmit = name.trim().length > 0 && months > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("name", name.trim());
    formData.set("category", category);
    formData.set("warranty_months", warrantyMonths);

    startTransition(async () => {
      const result = await createProduct(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/productos");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6 flex items-start justify-between gap-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Productos / Nuevo producto</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100">Nuevo producto</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl dark:text-gray-400">
            Registra un producto en tu catálogo con su categoría y plazo de garantía para
            asociarlo a ventas y postventa.
          </p>
        </div>
        <Link
          href="/productos"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <FormLayoutGrid>
          <FormMainColumn className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5">
                <SectionTitle required>Información básica</SectionTitle>
              </div>

              <div className="space-y-5">
                <Input
                  name="name"
                  label="Nombre del producto *"
                  placeholder="Ej. iPhone 15 Pro Max 256GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Select
                  name="category"
                  label="Categoría *"
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  required
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5">
                <SectionTitle required>Configuración de garantía</SectionTitle>
              </div>

              <div className="space-y-5">
                <Input
                  name="warranty_months"
                  label="Meses de garantía *"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="12"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(e.target.value)}
                  required
                />

                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-indigo-500/25 dark:bg-indigo-500/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-brand dark:border-indigo-500/30 dark:bg-gray-900 dark:text-indigo-300">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Tipo de identificador: {identifierLabel}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        Aquí no ingresas el IMEI ni la referencia de una unidad concreta. Eso
                        se pide al{" "}
                        <Link href="/garantias/nueva" className="link-brand font-medium">
                          registrar una garantía
                        </Link>
                        , porque cada venta tiene su propio identificador.
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {category === "telefonia"
                          ? "Telefonía → se pedirá el IMEI de 15 dígitos del equipo vendido."
                          : "Esta categoría → se pedirá la referencia o número de serie al vender."}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed dark:text-gray-500">
                  El plazo de garantía se calcula desde la fecha de venta al registrar cada
                  garantía. Puedes editar estos valores después desde el listado de productos.
                </p>
              </div>
            </section>
          </FormMainColumn>

          <FormSidebarColumn className="space-y-0">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
              <SectionTitle>Resumen del producto</SectionTitle>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-brand dark:border-gray-600 dark:bg-gray-900 dark:text-indigo-300">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate dark:text-gray-100">
                    {name.trim() || "Producto nuevo"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                    {CATEGORY_LABELS[category]}
                  </p>
                </div>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                <SummaryRow label="Categoría" value={CATEGORY_LABELS[category]} />
                <SummaryRow
                  label="Garantía"
                  value={months > 0 ? `${months} meses` : null}
                />
                <SummaryRow label="Tipo de identificador" value={identifierLabel} />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Cobertura
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100">
                  {months > 0 ? `${months} meses` : "—"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Cuando confirmes, el producto quedará disponible para registrar garantías desde
              el formulario de ventas.
            </p>

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
              {isPending ? "Creando..." : "Crear producto"}
            </Button>
          </section>
          </FormSidebarColumn>
        </FormLayoutGrid>
      </form>
    </>
  );
}
