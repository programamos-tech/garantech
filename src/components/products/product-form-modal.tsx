"use client";

import { useState, useTransition, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { CATEGORY_LABELS } from "@/lib/types";
import type { Product, ProductCategory } from "@/lib/types";
import { getIdentifierLabel, validateIdentifier } from "@/lib/warranty";

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (product: Product, identifier?: string) => void;
  product?: Product | null;
  forWarranty?: boolean;
}

export function ProductFormModal({
  open,
  onClose,
  onSuccess,
  product,
  forWarranty = false,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "telefonia"
  );
  const [identifier, setIdentifier] = useState("");

  const identifierLabel = getIdentifierLabel(category);
  const isTelefonia = category === "telefonia";

  useEffect(() => {
    if (open) {
      setCategory(product?.category ?? "telefonia");
      setIdentifier("");
      setError("");
    }
  }, [open, product]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    if (forWarranty && !isEditing) {
      const identifierError = validateIdentifier(identifier, category);
      if (identifierError) {
        setError(identifierError);
        return;
      }
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.error) {
        setError(result.error);
      } else if (isEditing && product) {
        onSuccess?.(product);
        onClose();
      } else if ("product" in result && result.product) {
        const created = result.product as Product;
        onSuccess?.(
          created,
          forWarranty && !isEditing ? identifier.trim() : undefined
        );
        setIdentifier("");
        onClose();
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        forWarranty && !isEditing
          ? "Nuevo producto para esta garantía"
          : isEditing
            ? "Editar producto"
            : "Nuevo producto"
      }
      wide={forWarranty}
    >
      <form onSubmit={handleSubmit} className="space-y-4" key={product?.id ?? "new"}>
        {forWarranty && !isEditing && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registra el producto con su plazo de garantía y el identificador de esta venta. Al
            guardar quedará seleccionado en el formulario.
          </p>
        )}

        <Input
          name="name"
          label="Nombre del producto *"
          defaultValue={product?.name}
          placeholder="Ej. iPhone 15 Pro Max 256GB"
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
        <Input
          name="warranty_months"
          label="Meses de garantía *"
          type="number"
          min={1}
          defaultValue={product?.warranty_months ?? 12}
          required
        />

        {forWarranty && !isEditing && (
          <Input
            name="identifier"
            label={`${identifierLabel} *`}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            inputMode={isTelefonia ? "numeric" : "text"}
            maxLength={isTelefonia ? 15 : undefined}
            placeholder={
              isTelefonia ? "15 dígitos numéricos" : "Referencia o número de serie"
            }
            required
          />
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-500/10">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending
              ? "Guardando..."
              : forWarranty && !isEditing
                ? "Guardar y usar en garantía"
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar producto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
