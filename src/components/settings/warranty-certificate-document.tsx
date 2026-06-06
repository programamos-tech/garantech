import type { Store } from "@/lib/types";
import type { WarrantyWithRelations } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import {
  formatCertificateIssuedAt,
  formatDate,
  getIdentifierLabel,
  shortWarrantyId,
} from "@/lib/warranty";

function CertificateField({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="certificate-document__label mb-1 text-xs">{label}</p>
      <p
        className={`certificate-document__value text-sm font-semibold ${
          mono ? "font-mono text-xs tracking-wide" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function WarrantyCertificateDocument({
  store,
  warranty,
  saleNotes,
}: {
  store: Pick<
    Store,
    | "name"
    | "logo_url"
    | "nit"
    | "phone"
    | "email"
    | "address"
    | "warranty_document_title"
    | "warranty_terms"
    | "warranty_footer"
  >;
  warranty: WarrantyWithRelations;
  saleNotes?: string | null;
}) {
  const title = store.warranty_document_title?.trim() || "Certificado de garantía";
  const warrantyId = shortWarrantyId(warranty.id);
  const identifierLabel = getIdentifierLabel(warranty.product.category);
  const issuedAt = formatCertificateIssuedAt(warranty.created_at);

  return (
    <article className="certificate-document mx-auto w-full max-w-[720px] rounded-2xl border p-8 shadow-sm print:mx-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="certificate-document__header flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {store.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logo_url}
              alt={store.name}
              className="h-14 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <div className="certificate-document__logo-fallback flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="certificate-document__title text-lg font-bold leading-tight">
              {store.name}
            </p>
            <p className="certificate-document__subtitle mt-1 text-sm">NIT {store.nit}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="certificate-document__label text-[11px] font-semibold uppercase tracking-[0.12em]">
            {title}
          </p>
          <p className="certificate-document__value mt-2 text-2xl font-bold tracking-tight">
            {warrantyId}
          </p>
          <p className="certificate-document__meta mt-2 text-xs leading-relaxed">
            Emitido {issuedAt.date}
            <br />
            {issuedAt.time}
          </p>
        </div>
      </header>

      <section className="py-6">
        <h2 className="certificate-document__label text-[11px] font-semibold uppercase tracking-[0.12em]">
          Datos del cliente y producto
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10">
          <div className="space-y-5">
            <CertificateField label="Cliente" value={warranty.customer.name} />
            <CertificateField label="Producto" value={warranty.product.name} />
            <CertificateField
              label="Fecha de venta"
              value={formatDate(warranty.sale_date)}
            />
            <CertificateField
              label="Estado"
              value={STATUS_LABELS[warranty.status]}
            />
          </div>

          <div className="space-y-5">
            <CertificateField
              label="Documento"
              value={warranty.customer.document_number ?? "—"}
            />
            <CertificateField
              label={identifierLabel}
              value={warranty.identifier}
              mono
            />
            <CertificateField
              label="Vigencia hasta"
              value={formatDate(warranty.warranty_end_date)}
            />
            <CertificateField
              label="Cobertura"
              value={`${warranty.product.warranty_months} meses`}
            />
          </div>
        </div>

        {saleNotes?.trim() && (
          <div className="certificate-document__note mt-6 rounded-xl border p-4">
            <p className="certificate-document__label text-[11px] font-semibold uppercase tracking-[0.12em]">
              Observaciones de la venta
            </p>
            <p className="certificate-document__body mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {saleNotes.trim()}
            </p>
          </div>
        )}
      </section>

      {store.warranty_terms?.trim() && (
        <section className="certificate-document__section border-t py-6">
          <h2 className="certificate-document__label text-[11px] font-semibold uppercase tracking-[0.12em]">
            Términos y condiciones
          </h2>
          <p className="certificate-document__body mt-4 text-sm leading-relaxed whitespace-pre-wrap">
            {store.warranty_terms.trim()}
          </p>
        </section>
      )}

      {store.warranty_footer?.trim() && (
        <footer className="certificate-document__section certificate-document__footer border-t pt-5 text-center text-xs leading-relaxed">
          {store.warranty_footer.trim()}
        </footer>
      )}
    </article>
  );
}
