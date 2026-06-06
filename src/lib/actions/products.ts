"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStoreId } from "@/lib/store";
import type { ProductCategory, Product } from "@/lib/types";

type MutationOptions = {
  revalidate?: boolean;
};

export async function createProduct(
  formData: FormData,
  options?: MutationOptions
) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: formData.get("name") as string,
      category: formData.get("category") as ProductCategory,
      warranty_months: parseInt(formData.get("warranty_months") as string, 10),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (options?.revalidate !== false) {
    revalidatePath("/productos");
  }

  return { success: true as const, product: data as Product };
}

export async function updateProduct(productId: string, formData: FormData) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      category: formData.get("category") as ProductCategory,
      warranty_months: parseInt(formData.get("warranty_months") as string, 10),
    })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  revalidatePath("/productos");
  revalidatePath(`/productos/${productId}`);
  revalidatePath("/garantias");
  revalidatePath("/garantias/nueva");
  return { success: true };
}

export async function getProductWithWarranties(productId: string) {
  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("store_id", storeId)
    .single();

  if (!product) return null;

  const { data: warranties } = await supabase
    .from("warranties")
    .select("*, customer:customers(*)")
    .eq("product_id", productId)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return { product, warranties: warranties ?? [] };
}

export async function getProducts(search?: string) {
  const storeId = await getStoreId();
  if (!storeId) return [];

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, warranties(count)")
    .eq("store_id", storeId)
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data } = await query;

  return (data ?? []).map(({ warranties, ...product }) => ({
    ...product,
    warranty_count:
      (warranties as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}
