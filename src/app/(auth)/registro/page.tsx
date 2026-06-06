"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegistroPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await signUp(formData)) ?? null;
    },
    null
  );

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white shadow-xl shadow-brand/10 p-8 ring-1 ring-white/20">
        <h2 className="text-xl font-bold text-brand mb-1">Registrar tienda</h2>
        <p className="text-sm text-gray-500 mb-6">
          Crea tu cuenta y comienza a gestionar garantías hoy mismo
        </p>

        <form action={formAction} className="space-y-4">
          <Input name="store_name" label="Nombre de la tienda" required />
          <Input name="nit" label="NIT" required />
          <Input name="phone" label="Teléfono" type="tel" />
          <Input name="email" label="Correo del propietario" type="email" required />
          <Input name="password" label="Contraseña" type="password" required minLength={6} />

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="link-brand">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
