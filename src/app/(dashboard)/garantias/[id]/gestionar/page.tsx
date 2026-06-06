import { notFound, redirect } from "next/navigation";
import { getManageContext } from "@/lib/actions/claims";
import { WarrantyManageForm } from "@/components/warranties/warranty-manage-form";
import { canManageWarrantyClaim } from "@/lib/claim";

export default async function GestionarGarantiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await getManageContext(id);

  if (!context) notFound();

  const defaultItem = context.items.find(
    (item) => item.warranty.id === context.defaultWarrantyId
  );

  if (
    defaultItem?.openClaimId &&
    context.items.filter((i) => i.openClaimId).length === 1 &&
    context.items.length === 1
  ) {
    redirect(`/gestion/reclamos/${defaultItem.openClaimId}`);
  }

  const hasManageable = context.items.some((item) =>
    canManageWarrantyClaim(item.warranty.status)
  );

  if (!hasManageable) {
    redirect(`/garantias/${id}`);
  }

  return <WarrantyManageForm context={context} />;
}
