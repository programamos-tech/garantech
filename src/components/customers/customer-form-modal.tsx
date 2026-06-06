"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCustomer } from "@/lib/actions/customers";
import type { Customer } from "@/lib/types";

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (customer: Customer) => void;
}

export function CustomerFormModal({
  open,
  onClose,
  onSuccess,
}: CustomerFormModalProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCustomer(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.customer) {
        onSuccess?.(result.customer);
        onClose();
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <Input name="name" label="Nombre completo *" required />
          <Input name="document_number" label="Documento de identidad" />
          <Input name="phone" label="Teléfono" type="tel" />
          <Input name="email" label="Correo electrónico" type="email" />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Guardando..." : "Guardar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
