"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  removeStoreLogo,
  updateStoreSettings,
  uploadStoreLogo,
} from "@/lib/actions/store-settings";
import { getDefaultWarrantyTerms } from "@/lib/store-settings";
import type { Store } from "@/lib/types";
import { WarrantyCertificateDocument } from "@/components/settings/warranty-certificate-document";

const sampleWarranty = {
  id: "00000000-0000-4000-8000-000000000001",
  store_id: "sample",
  sale_id: null,
  customer_id: "sample",
  product_id: "sample",
  sale_date: new Date().toISOString().slice(0, 10),
  warranty_end_date: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
  identifier: "123456789012345",
  identifier_type: "imei" as const,
  status: "vigente" as const,
  notes: null,
  void_reason: null,
  voided_at: null,
  created_at: new Date().toISOString(),
  customer: {
    id: "sample",
    store_id: "sample",
    name: "Cliente de ejemplo",
    phone: "300 123 4567",
    email: "cliente@ejemplo.com",
    document_number: "1234567890",
    created_at: new Date().toISOString(),
  },
  product: {
    id: "sample",
    store_id: "sample",
    name: "Producto de ejemplo",
    category: "telefonia" as const,
    warranty_months: 12,
    created_at: new Date().toISOString(),
  },
};

export function StoreSettingsForm({ store }: { store: Store }) {
  const [isSaving, startSave] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [isRemovingLogo, startRemoveLogo] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(store.logo_url);

  const [form, setForm] = useState({
    name: store.name,
    nit: store.nit,
    phone: store.phone ?? "",
    email: store.email ?? "",
    address: store.address ?? "",
    warranty_document_title: store.warranty_document_title ?? "Certificado de garantía",
    warranty_terms:
      store.warranty_terms?.trim() || getDefaultWarrantyTerms(store.name),
    warranty_footer: store.warranty_footer ?? "",
  });

  const previewStore = useMemo(
    () => ({
      name: form.name || store.name,
      logo_url: logoUrl,
      nit: form.nit || store.nit,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      warranty_document_title: form.warranty_document_title,
      warranty_terms: form.warranty_terms,
      warranty_footer: form.warranty_footer || null,
    }),
    [form, logoUrl, store.name, store.nit]
  );

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.set(key, value));

    startSave(async () => {
      const result = await updateStoreSettings(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("Configuración guardada");
    });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    const payload = new FormData();
    payload.set("logo", file);

    startUpload(async () => {
      const result = await uploadStoreLogo(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.logoUrl) setLogoUrl(result.logoUrl);
      setMessage("Logo actualizado");
      e.target.value = "";
    });
  }

  function handleRemoveLogo() {
    setMessage(null);
    setError(null);

    startRemoveLogo(async () => {
      const result = await removeStoreLogo();
      if (result.error) {
        setError(result.error);
        return;
      }
      setLogoUrl(null);
      setMessage("Logo eliminado");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Datos del negocio
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aparecen en el certificado de garantía y documentos entregados al cliente.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Logo
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={form.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xl font-bold text-brand dark:text-indigo-300">
                      {form.name.charAt(0).toUpperCase() || "G"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                    />
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Subir logo
                    </span>
                  </label>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRemoveLogo}
                      disabled={isRemovingLogo}
                    >
                      <Trash2 className="h-4 w-4" />
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, WebP o GIF. Máximo 2 MB.
              </p>
            </div>

            <Input
              label="Nombre del negocio"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            <Input
              label="NIT"
              value={form.nit}
              onChange={(e) => handleChange("nit", e.target.value)}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <Input
                label="Correo del negocio"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <Input
              label="Dirección"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Documento de garantía
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Texto legal y pie de página que verá el cliente en cada certificado.
          </p>

          <div className="mt-6 space-y-4">
            <Input
              label="Título del documento"
              value={form.warranty_document_title}
              onChange={(e) => handleChange("warranty_document_title", e.target.value)}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="warranty_terms"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Términos y condiciones
              </label>
              <textarea
                id="warranty_terms"
                rows={8}
                value={form.warranty_terms}
                onChange={(e) => handleChange("warranty_terms", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="warranty_footer"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Pie de página (opcional)
              </label>
              <textarea
                id="warranty_footer"
                rows={3}
                value={form.warranty_footer}
                onChange={(e) => handleChange("warranty_footer", e.target.value)}
                placeholder="Ej. Gracias por confiar en nosotros. Para reclamar la garantía presente este documento."
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </section>

        {(message || error) && (
          <p
            className={`text-sm font-medium ${error ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
          >
            {error ?? message}
          </p>
        )}

        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar configuración
        </Button>
      </form>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Vista previa del certificado
        </p>
        <div className="rounded-2xl border border-gray-200 bg-gray-100/80 p-4 dark:border-gray-700 dark:bg-gray-950/50">
          <WarrantyCertificateDocument store={previewStore} warranty={sampleWarranty} />
        </div>
      </aside>
    </div>
  );
}
