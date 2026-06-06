"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos" };
  }

  redirect("/garantias");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const storeName = formData.get("store_name") as string;
  const nit = formData.get("nit") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!storeName || !nit || !email || !password) {
    return { error: "Todos los campos obligatorios deben completarse" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "No se pudo crear la cuenta" };
  }

  const { error: storeError } = await supabase.from("stores").insert({
    owner_id: authData.user.id,
    name: storeName,
    nit,
    phone: phone || null,
  });

  if (storeError) {
    return { error: "Error al registrar la tienda: " + storeError.message };
  }

  redirect("/garantias");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
