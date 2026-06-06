"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStoreId } from "@/lib/store";
import type { Store } from "@/lib/types";

const LOGO_BUCKET = "store-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function revalidateStorePaths() {
  revalidatePath("/configuracion");
  revalidatePath("/garantias", "layout");
}

export async function updateStoreSettings(formData: FormData) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const name = (formData.get("name") as string)?.trim();
  const nit = (formData.get("nit") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const warrantyDocumentTitle =
    (formData.get("warranty_document_title") as string)?.trim() ||
    "Certificado de garantía";
  const warrantyTerms = (formData.get("warranty_terms") as string)?.trim() || null;
  const warrantyFooter = (formData.get("warranty_footer") as string)?.trim() || null;

  if (!name) return { error: "El nombre del negocio es obligatorio" };
  if (!nit) return { error: "El NIT es obligatorio" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("stores")
    .update({
      name,
      nit,
      phone,
      email,
      address,
      warranty_document_title: warrantyDocumentTitle,
      warranty_terms: warrantyTerms,
      warranty_footer: warrantyFooter,
    })
    .eq("id", storeId);

  if (error) return { error: error.message };

  revalidateStorePaths();
  return { success: true as const };
}

export async function uploadStoreLogo(formData: FormData) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen" };
  }

  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return { error: "Formato no válido. Usa JPG, PNG, WebP o GIF." };
  }

  if (file.size > MAX_LOGO_BYTES) {
    return { error: "La imagen no puede superar 2 MB" };
  }

  const extension =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";

  const objectPath = `${storeId}/logo.${extension}`;
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(objectPath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "No se pudo subir el logo: " + uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(objectPath);

  const logoUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("stores")
    .update({ logo_url: logoUrl })
    .eq("id", storeId);

  if (updateError) return { error: updateError.message };

  revalidateStorePaths();
  return { success: true as const, logoUrl };
}

export async function removeStoreLogo() {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const supabase = await createClient();

  const extensions = ["jpg", "png", "webp", "gif"];
  await Promise.all(
    extensions.map((ext) =>
      supabase.storage.from(LOGO_BUCKET).remove([`${storeId}/logo.${ext}`])
    )
  );

  const { error } = await supabase
    .from("stores")
    .update({ logo_url: null })
    .eq("id", storeId);

  if (error) return { error: error.message };

  revalidateStorePaths();
  return { success: true as const };
}
