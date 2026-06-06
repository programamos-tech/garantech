"use client";

import { Modal } from "@/components/ui/modal";
import { CATEGORY_LABELS } from "@/lib/types";
import type { ProductWithStats } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  getIdentifierLabel,
  shortProductId,
} from "@/lib/warranty";

interface ProductDetailModalProps {
  product: ProductWithStats | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle del producto">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Producto
          </dt>
          <dd className="mt-1 font-semibold text-gray-900">{product.name}</dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Código
            </dt>
            <dd className="mt-1 font-mono text-gray-700">{shortProductId(product.id)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categoría
            </dt>
            <dd className="mt-1 text-gray-700">{CATEGORY_LABELS[product.category]}</dd>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Garantía
            </dt>
            <dd className="mt-1 text-gray-700">{product.warranty_months} meses</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Identificador
            </dt>
            <dd className="mt-1 text-gray-700">{getIdentifierLabel(product.category)}</dd>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Garantías registradas
            </dt>
            <dd className="mt-1 text-gray-700">{product.warranty_count}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Registrado
            </dt>
            <dd className="mt-1 text-gray-700">
              {formatDate(product.created_at.split("T")[0])}
              <span className="block text-xs text-gray-400 mt-0.5">
                {formatDateTime(product.created_at)}
              </span>
            </dd>
          </div>
        </div>
      </dl>
    </Modal>
  );
}
