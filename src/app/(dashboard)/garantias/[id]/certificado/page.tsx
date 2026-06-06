import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getWarrantyDetail } from "@/lib/actions/warranties";
import { getCurrentStore } from "@/lib/store";
import { WarrantyCertificateDocument } from "@/components/settings/warranty-certificate-document";
import { PrintButton } from "@/components/settings/print-button";

export default async function GarantiaCertificadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, store] = await Promise.all([getWarrantyDetail(id), getCurrentStore()]);

  if (!detail || !store) notFound();

  const saleNotes = detail.sale?.notes ?? detail.warranty.notes;

  return (
    <div className="space-y-6 max-w-4xl print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/garantias/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la garantía
        </Link>
        <PrintButton />
      </div>

      <WarrantyCertificateDocument
        store={store}
        warranty={detail.warranty}
        saleNotes={saleNotes}
      />
    </div>
  );
}
