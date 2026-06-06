"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStoreId } from "@/lib/store";
import type {
  SaleWarrantyItem,
  WarrantyDetailData,
  WarrantyStatus,
  WarrantyWithRelations,
} from "@/lib/types";
import {
  calculateWarrantyEndDate,
  calculateWarrantyStatus,
  shortSaleId,
  shortWarrantyId,
  validateIdentifier,
  withRecalculatedStatus,
} from "@/lib/warranty";

function enrichWarranty(w: Record<string, unknown>): WarrantyWithRelations {
  const warranty = withRecalculatedStatus(
    w as unknown as WarrantyWithRelations
  );
  return warranty;
}

export async function createSaleWithWarranties(input: {
  customerId: string;
  saleDate: string;
  notes: string | null;
  items: SaleWarrantyItem[];
}) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const { customerId, saleDate, notes, items } = input;

  if (!customerId) return { error: "Selecciona un cliente" };
  if (!saleDate) return { error: "Indica la fecha de venta" };
  if (!items.length) return { error: "Agrega al menos un producto" };

  const identifiers = items.map((i) => i.identifier.trim());
  const duplicateIdentifier = identifiers.find(
    (id, index) => identifiers.indexOf(id) !== index
  );
  if (duplicateIdentifier) {
    return {
      error: `El identificador ${duplicateIdentifier} está repetido en esta venta`,
    };
  }

  const supabase = await createClient();

  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .in("id", productIds);

  if (!products || products.length !== productIds.length) {
    return { error: "Uno o más productos no fueron encontrados" };
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  const warrantyRows: Record<string, unknown>[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) return { error: "Producto no encontrado" };

    const identifierError = validateIdentifier(item.identifier, product.category);
    if (identifierError) {
      return { error: `${product.name}: ${identifierError}` };
    }

    const warrantyEndDate = calculateWarrantyEndDate(
      saleDate,
      product.warranty_months
    );
    const status = calculateWarrantyStatus(warrantyEndDate);
    const identifierType =
      product.category === "telefonia" ? "imei" : "referencia";

    warrantyRows.push({
      store_id: storeId,
      customer_id: customerId,
      product_id: item.productId,
      sale_date: saleDate,
      warranty_end_date: warrantyEndDate,
      identifier: item.identifier.trim(),
      identifier_type: identifierType,
      status,
      notes: null,
    });
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      store_id: storeId,
      customer_id: customerId,
      sale_date: saleDate,
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return { error: saleError?.message ?? "No se pudo registrar la venta" };
  }

  const { data: createdWarranties, error: warrantyError } = await supabase
    .from("warranties")
    .insert(warrantyRows.map((row) => ({ ...row, sale_id: sale.id })))
    .select("id");

  if (warrantyError || !createdWarranties?.length) {
    await supabase.from("sales").delete().eq("id", sale.id);
    return { error: warrantyError?.message ?? "No se pudieron registrar las garantías" };
  }

  revalidatePath("/garantias");
  revalidatePath("/garantias/nueva");
  revalidatePath("/clientes");
  revalidatePath("/gestion");

  return {
    success: true,
    saleId: sale.id,
    warrantyIds: createdWarranties.map((w) => w.id),
  };
}

export async function createWarranty(formData: FormData) {
  const customerId = formData.get("customer_id") as string;
  const productId = formData.get("product_id") as string;
  const saleDate = formData.get("sale_date") as string;
  const identifier = formData.get("identifier") as string;
  const notes = (formData.get("notes") as string) || null;

  return createSaleWithWarranties({
    customerId,
    saleDate,
    notes,
    items: [{ productId, identifier }],
  });
}

export async function voidWarranty(warrantyId: string, reason: string) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: "Indica el motivo de la anulación" };

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("warranties")
    .select("id, voided_at")
    .eq("id", warrantyId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }

  if (!existing) return { error: "Garantía no encontrada" };
  if (existing.voided_at) return { error: "Esta garantía ya fue anulada" };

  const { error } = await supabase
    .from("warranties")
    .update({
      status: "anulada",
      void_reason: trimmedReason,
      voided_at: new Date().toISOString(),
    })
    .eq("id", warrantyId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  revalidatePath("/garantias");
  revalidatePath(`/garantias/${warrantyId}`);
  revalidatePath("/clientes");
  revalidatePath("/productos");
  return { success: true };
}

export async function getWarranties(
  filter?: WarrantyStatus | "all",
  search?: string
) {
  const storeId = await getStoreId();
  if (!storeId) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("warranties")
    .select("*, customer:customers(*), product:products(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  let warranties = data.map(enrichWarranty);

  if (filter && filter !== "all") {
    warranties = warranties.filter((w) => w.status === filter);
  }

  if (search) {
    const q = search.toLowerCase();
    warranties = warranties.filter(
      (w) =>
        w.customer.name.toLowerCase().includes(q) ||
        w.identifier.toLowerCase().includes(q) ||
        w.product.name.toLowerCase().includes(q) ||
        shortWarrantyId(w.id).toLowerCase().includes(q) ||
        (w.sale_id && shortSaleId(w.sale_id).toLowerCase().includes(q)) ||
        (w.customer.document_number?.toLowerCase().includes(q) ?? false)
    );
  }

  return warranties;
}

export async function searchWarranties(query: string) {
  if (!query.trim()) return [];
  return getWarranties("all", query.trim());
}

export async function getWarrantyById(id: string) {
  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("warranties")
    .select("*, customer:customers(*), product:products(*)")
    .eq("id", id)
    .eq("store_id", storeId)
    .single();

  if (!data) return null;
  return enrichWarranty(data);
}

export async function getWarrantyDetail(
  id: string
): Promise<WarrantyDetailData | null> {
  const warranty = await getWarrantyById(id);
  if (!warranty) return null;

  if (!warranty.sale_id) {
    return { warranty, sale: null, saleItems: [warranty] };
  }

  const storeId = await getStoreId();
  if (!storeId) return { warranty, sale: null, saleItems: [warranty] };

  const supabase = await createClient();

  const [{ data: sale }, { data: items }] = await Promise.all([
    supabase
      .from("sales")
      .select("*")
      .eq("id", warranty.sale_id)
      .eq("store_id", storeId)
      .maybeSingle(),
    supabase
      .from("warranties")
      .select("*, customer:customers(*), product:products(*)")
      .eq("sale_id", warranty.sale_id)
      .eq("store_id", storeId)
      .order("created_at", { ascending: true }),
  ]);

  const saleItems = (items ?? []).map(enrichWarranty);

  return {
    warranty,
    sale: sale ?? null,
    saleItems: saleItems.length > 0 ? saleItems : [warranty],
  };
}
