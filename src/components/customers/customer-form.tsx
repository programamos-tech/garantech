"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerFields } from "@/components/customers/customer-fields";
import { createCustomer } from "@/lib/actions/customers";
import { validateCustomerFields } from "@/lib/customer";

function SectionTitle({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </h2>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-gray-500 shrink-0 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right dark:text-gray-100">{value || "—"}</span>
    </div>
  );
}

export function CustomerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const validationError = validateCustomerFields({
      name,
      document_number: documentNumber,
      phone,
      email,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("name", name.trim());
    formData.set("document_number", documentNumber.trim());
    formData.set("phone", phone.trim());
    formData.set("email", email.trim());

    startTransition(async () => {
      const result = await createCustomer(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/clientes");
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Encabezado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6 flex items-start justify-between gap-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clientes / Nuevo cliente</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 dark:text-gray-100">Nuevo cliente</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl dark:text-gray-400">
            Registra un nuevo cliente en tu tienda para asociar garantías de productos.
          </p>
        </div>
        <Link
          href="/clientes"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Columna izquierda */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5">
              <SectionTitle required>Datos personales</SectionTitle>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <CustomerFields
                name={name}
                documentNumber={documentNumber}
                phone={phone}
                email={email}
                onNameChange={setName}
                onDocumentNumberChange={setDocumentNumber}
                onPhoneChange={setPhone}
                onEmailChange={setEmail}
              />
            </div>
          </section>

          {/* Columna derecha — resumen */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-20 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
              <SectionTitle>Resumen</SectionTitle>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-1 dark:bg-gray-800/50 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {name.trim() || "Cliente nuevo"}
              </p>
              <div className="pt-2 space-y-0.5">
                <SummaryRow
                  label="Documento"
                  value={documentNumber || null}
                />
                <SummaryRow label="Teléfono" value={phone} />
                <SummaryRow label="Correo" value={email} />
              </div>
              <p className="text-xs text-gray-400 pt-3 leading-relaxed dark:text-gray-500">
                Completa al menos el nombre. Documento, teléfono y correo son opcionales pero
                recomendados para buscar al cliente después.
              </p>
            </div>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed dark:text-gray-500">
              Al registrar una garantía podrás seleccionar este cliente desde el listado.
            </p>

            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium dark:text-red-300 dark:bg-red-500/10">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending || !canSubmit}
              className="w-full mt-5"
            >
              {isPending ? "Creando..." : "Crear cliente"}
            </Button>
          </section>
        </div>
      </form>
    </>
  );
}
