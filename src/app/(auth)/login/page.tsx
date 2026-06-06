"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await signIn(formData)) ?? null;
    },
    null
  );

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white shadow-xl shadow-brand/10 p-8 ring-1 ring-white/20">
        <h2 className="text-xl font-bold text-brand mb-1">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mb-6">
          Accede a tu tienda con tu correo y contraseña
        </p>

        <form action={formAction} className="space-y-4">
          <Input
            name="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
          />
          <Input
            name="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="current-password"
          />

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="link-brand">
            Registra tu tienda
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/40 font-medium">
        Plan anual · $799.000 COP
      </p>
    </div>
  );
}
