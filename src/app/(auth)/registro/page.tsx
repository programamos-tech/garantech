"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import { AuthCard, AuthError } from "@/components/auth/auth-card";
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
    <div className="w-full max-w-lg">
    <AuthCard
      title="Registrar tienda"
      description="Crea tu cuenta y comienza a gestionar garantías hoy mismo"
      footer={{
        text: "¿Ya tienes cuenta?",
        linkText: "Iniciar sesión",
        href: "/login",
      }}
    >
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input name="store_name" label="Nombre de la tienda" required className="sm:col-span-2" />
          <Input name="nit" label="NIT" required />
          <Input name="phone" label="Teléfono" type="tel" />
        </div>
        <Input name="email" label="Correo del propietario" type="email" required autoComplete="email" />
        <Input
          name="password"
          label="Contraseña"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {state?.error && <AuthError message={state.error} />}

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </AuthCard>
    </div>
  );
}
