"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStoreId } from "@/lib/store";

export async function createCustomer(formData: FormData) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      store_id: storeId,
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      document_number: (formData.get("document_number") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  revalidatePath("/clientes/nuevo");
  revalidatePath("/clientes", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/garantias");
  revalidatePath("/garantias/nueva");
  return { success: true, customer: data };
}

export async function getCustomers(search?: string) {
  const storeId = await getStoreId();
  if (!storeId) return [];

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .eq("store_id", storeId)
    .order("name");

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,document_number.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data } = await query;
  return data ?? [];
}

export async function getCustomerWithWarranties(customerId: string) {
  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("store_id", storeId)
    .single();

  if (!customer) return null;

  const { data: warranties } = await supabase
    .from("warranties")
    .select("*, product:products(*)")
    .eq("customer_id", customerId)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return { customer, warranties: warranties ?? [] };
}
