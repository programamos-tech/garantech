"use client";

import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canManageWarrantyClaim } from "@/lib/claim";
import type { WarrantyStatus } from "@/lib/types";

export function WarrantyManageHeaderButton({
  warrantyId,
  status,
  openClaimId,
}: {
  warrantyId: string;
  status: WarrantyStatus;
  openClaimId: string | null;
}) {
  const router = useRouter();

  if (!canManageWarrantyClaim(status)) return null;

  function handleClick() {
    if (openClaimId) {
      router.push(`/gestion/reclamos/${openClaimId}`);
      return;
    }
    router.push(`/garantias/${warrantyId}/gestionar`);
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleClick}
      className="whitespace-nowrap"
    >
      <Wrench className="h-4 w-4" />
      {openClaimId ? "Reanudar reclamo" : "Gestionar"}
    </Button>
  );
}
