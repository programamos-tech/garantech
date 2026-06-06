import type { Store } from "@/lib/types";
import type { WarrantyWithRelations } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import {
  formatDate,
  formatDateTimeDetail,
  getIdentifierLabel,
  shortWarrantyId,
} from "@/lib/warranty";

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

  return (
    <article className="certificate-document mx-auto max-w-[720px] rounded-2xl border p-8 shadow-sm print:shadow-none">
      <header className="certificate-document__header flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
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
            <p className="certificate-document__title text-lg font-bold">{store.name}</p>
            <p className="certificate-document__subtitle text-sm">NIT {store.nit}</p>
            {[store.phone, store.email, store.address].filter(Boolean).length > 0 && (
              <p className="certificate-document__meta mt-1 text-xs">
                {[store.phone, store.email, store.address].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="certificate-document__label text-xs font-semibold uppercase tracking-wide">
            {title}
          </p>
          <p className="certificate-document__value mt-1 font-mono text-sm font-semibold">
            {warrantyId}
          </p>
          <p className="certificate-document__meta mt-1 text-xs">
            Emitido {formatDateTimeDetail(warranty.created_at)}
          </p>
        </div>
      </header>

      <section className="py-6">
        <h2 className="certificate-document__label text-sm font-semibold uppercase tracking-wide">
          Datos del cliente y producto
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="certificate-document__label">Cliente</dt>
            <dd className="certificate-document__value font-semibold">
              {warranty.customer.name}
            </dd>
          </div>
          {warranty.customer.document_number && (
            <div>
              <dt className="certificate-document__label">Documento</dt>
              <dd className="certificate-document__value font-semibold">
                {warranty.customer.document_number}
              </dd>
            </div>
          )}
          <div>
            <dt className="certificate-document__label">Producto</dt>
            <dd className="certificate-document__value font-semibold">
              {warranty.product.name}
            </dd>
          </div>
          <div>
            <dt className="certificate-document__label">{identifierLabel}</dt>
            <dd className="certificate-document__value font-mono text-xs font-semibold">
              {warranty.identifier}
            </dd>
          </div>
          <div>
            <dt className="certificate-document__label">Fecha de venta</dt>
            <dd className="certificate-document__value font-semibold">
              {formatDate(warranty.sale_date)}
            </dd>
          </div>
          <div>
            <dt className="certificate-document__label">Vigencia hasta</dt>
            <dd className="certificate-document__value font-semibold">
              {formatDate(warranty.warranty_end_date)}
            </dd>
          </div>
          <div>
            <dt className="certificate-document__label">Estado</dt>
            <dd className="certificate-document__value font-semibold">
              {STATUS_LABELS[warranty.status]}
            </dd>
          </div>
          <div>
            <dt className="certificate-document__label">Cobertura</dt>
            <dd className="certificate-document__value font-semibold">
              {warranty.product.warranty_months} meses
            </dd>
          </div>
        </dl>

        {saleNotes && (
          <div className="certificate-document__note mt-5 rounded-xl border p-4">
            <p className="certificate-document__label text-xs font-semibold uppercase tracking-wide">
              Observaciones de la venta
            </p>
            <p className="certificate-document__body mt-2 text-sm whitespace-pre-wrap">
              {saleNotes}
            </p>
          </div>
        )}
      </section>

      {store.warranty_terms?.trim() && (
        <section className="certificate-document__section border-t py-6">
          <h2 className="certificate-document__label text-sm font-semibold uppercase tracking-wide">
            Términos y condiciones
          </h2>
          <p className="certificate-document__body mt-3 text-sm leading-relaxed whitespace-pre-wrap">
            {store.warranty_terms.trim()}
          </p>
        </section>
      )}

      {store.warranty_footer?.trim() && (
        <footer className="certificate-document__section certificate-document__footer border-t pt-5 text-center text-xs">
          {store.warranty_footer.trim()}
        </footer>
      )}
    </article>
  );
}
