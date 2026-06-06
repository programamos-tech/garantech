"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { AuthCard, AuthError } from "@/components/auth/auth-card";
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
    <AuthCard
      title="Iniciar sesión"
      description="Accede a tu tienda con tu correo y contraseña"
      footer={{
        text: "¿No tienes cuenta?",
        linkText: "Registra tu tienda",
        href: "/registro",
      }}
    >
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

        {state?.error && <AuthError message={state.error} />}

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </AuthCard>
    </div>
  );
}
