"use client";

import { Input } from "@/components/ui/input";
import {
  filterCustomerName,
  filterDocumentNumber,
  filterEmail,
  filterPhone,
} from "@/lib/customer";

interface CustomerFieldsProps {
  name: string;
  documentNumber: string;
  phone: string;
  email: string;
  onNameChange: (value: string) => void;
  onDocumentNumberChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export function CustomerFields({
  name,
  documentNumber,
  phone,
  email,
  onNameChange,
  onDocumentNumberChange,
  onPhoneChange,
  onEmailChange,
}: CustomerFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      <Input
        name="name"
        label="Nombre completo *"
        placeholder="Ej. María López"
        value={name}
        onChange={(e) => onNameChange(filterCustomerName(e.target.value))}
        autoComplete="name"
        required
      />
      <Input
        name="document_number"
        label="Documento de identidad"
        placeholder="Ej. 1234567890"
        value={documentNumber}
        onChange={(e) => onDocumentNumberChange(filterDocumentNumber(e.target.value))}
        inputMode="numeric"
        autoComplete="off"
      />
      <Input
        name="phone"
        label="Teléfono"
        type="tel"
        placeholder="Ej. 312 000 0000"
        value={phone}
        onChange={(e) => onPhoneChange(filterPhone(e.target.value))}
        inputMode="tel"
        autoComplete="tel"
      />
      <Input
        name="email"
        label="Correo electrónico"
        type="email"
        placeholder="Ej. maria@ejemplo.com"
        value={email}
        onChange={(e) => onEmailChange(filterEmail(e.target.value))}
        autoComplete="email"
      />
    </div>
  );
}
