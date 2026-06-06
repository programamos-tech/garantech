export function filterCustomerName(value: string): string {
  return value
    .replace(/[^\p{L}\s'-]/gu, "")
    .replace(/\s{2,}/g, " ");
}

export function filterDocumentNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 20);
}

export function filterPhone(value: string): string {
  return value.replace(/[^\d+\s()-]/g, "").slice(0, 20);
}

export function filterEmail(value: string): string {
  return value.replace(/[^\w.@+-]/g, "").slice(0, 254);
}

export function validateCustomerFields(fields: {
  name: string;
  document_number?: string | null;
  phone?: string | null;
  email?: string | null;
}): string | null {
  const name = fields.name.trim();

  if (!name) return "El nombre es obligatorio";
  if (name.length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (!/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    return "El nombre solo puede contener letras";
  }

  const documentNumber = fields.document_number?.trim();
  if (documentNumber && !/^\d{5,20}$/.test(documentNumber)) {
    return "El documento debe tener entre 5 y 20 dígitos";
  }

  const phone = fields.phone?.trim();
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return "El teléfono debe tener entre 7 y 15 dígitos";
    }
  }

  const email = fields.email?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Ingresa un correo electrónico válido";
  }

  return null;
}

export function normalizeCustomerFields(fields: {
  name: string;
  document_number?: string;
  phone?: string;
  email?: string;
}) {
  const name = filterCustomerName(fields.name).trim();
  const documentNumber = filterDocumentNumber(fields.document_number ?? "");
  const phoneDigits = filterPhone(fields.phone ?? "").replace(/\D/g, "");
  const email = filterEmail(fields.email ?? "").trim().toLowerCase();

  return {
    name,
    document_number: documentNumber || null,
    phone: phoneDigits || null,
    email: email || null,
  };
}
