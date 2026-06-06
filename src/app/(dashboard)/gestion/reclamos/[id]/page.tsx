import { notFound } from "next/navigation";
import { getClaimById } from "@/lib/actions/claims";
import { getWarrantyDetail } from "@/lib/actions/warranties";
import { getCurrentStore } from "@/lib/store";
import { ClaimDetailView } from "@/components/gestion/claim-detail-view";

export default async function ReclamoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const claim = await getClaimById(id);

  if (!claim) notFound();

  const [store, detail] = await Promise.all([
    getCurrentStore(),
    getWarrantyDetail(claim.warranty_id),
  ]);

  return (
    <div className="max-w-6xl">
      <ClaimDetailView
        claim={claim}
        storeName={store?.name ?? "Tu tienda"}
        sale={detail?.sale ?? null}
      />
    </div>
  );
}
