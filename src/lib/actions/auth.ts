"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function isDuplicateUserError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  );
}

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

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "Configuración incompleta en el servidor. Falta SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { data: userData, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError) {
    if (isDuplicateUserError(createUserError.message)) {
      return { error: "Ya existe una cuenta con ese correo. Inicia sesión." };
    }
    return { error: createUserError.message };
  }

  if (!userData.user) {
    return { error: "No se pudo crear la cuenta" };
  }

  const { error: storeError } = await admin.from("stores").insert({
    owner_id: userData.user.id,
    name: storeName,
    nit,
    phone: phone || null,
  });

  if (storeError) {
    await admin.auth.admin.deleteUser(userData.user.id);
    return { error: "Error al registrar la tienda: " + storeError.message };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error: "Cuenta creada. Inicia sesión con tu correo y contraseña.",
    };
  }

  redirect("/garantias");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
