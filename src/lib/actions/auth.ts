"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
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

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "Configuración incompleta en el servidor. Falta SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { data: existingStore } = await admin
    .from("stores")
    .select("id")
    .eq("owner_id", authData.user.id)
    .maybeSingle();

  if (existingStore) {
    if (authData.session) {
      redirect("/garantias");
    }
    return {
      error:
        "La cuenta ya existe. Revisa tu correo para confirmar el registro o inicia sesión.",
    };
  }

  const { error: storeError } = await admin.from("stores").insert({
    owner_id: authData.user.id,
    name: storeName,
    nit,
    phone: phone || null,
  });

  if (storeError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "Error al registrar la tienda: " + storeError.message };
  }

  if (!authData.session) {
    return {
      error:
        "Cuenta creada. Revisa tu correo para confirmar el registro e inicia sesión.",
    };
  }

  redirect("/garantias");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
