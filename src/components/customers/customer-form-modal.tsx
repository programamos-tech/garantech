"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CustomerFields } from "@/components/customers/customer-fields";
import { createCustomer } from "@/lib/actions/customers";
import { validateCustomerFields } from "@/lib/customer";
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
  const [name, setName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setDocumentNumber("");
    setPhone("");
    setEmail("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

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
      } else if (result.customer) {
        resetForm();
        onSuccess?.(result.customer);
        onClose();
      }
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-500/10">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !name.trim()} className="flex-1">
            {isPending ? "Guardando..." : "Guardar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
