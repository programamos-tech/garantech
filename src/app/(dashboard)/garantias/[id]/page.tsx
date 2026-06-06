import { notFound } from "next/navigation";
import { getWarrantyDetail } from "@/lib/actions/warranties";
import { getOpenClaimIdForWarranty } from "@/lib/actions/claims";
import { getCurrentStore } from "@/lib/store";
import { WarrantyDetailView } from "@/components/warranties/warranty-detail-view";

export default async function GarantiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, store, openClaimId] = await Promise.all([
    getWarrantyDetail(id),
    getCurrentStore(),
    getOpenClaimIdForWarranty(id),
  ]);

  if (!detail) notFound();

  return (
    <div className="max-w-6xl">
      <WarrantyDetailView
        warranty={detail.warranty}
        storeName={store?.name ?? "Tu tienda"}
        openClaimId={openClaimId}
        sale={detail.sale}
        saleItems={detail.saleItems}
      />
    </div>
  );
}
