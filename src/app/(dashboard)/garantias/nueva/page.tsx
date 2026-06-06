import { Suspense } from "react";
import { FormPage } from "@/components/ui/responsive-list";
import { WarrantyFormLoader } from "@/components/warranties/warranty-form-loader";
import { WarrantyFormSkeleton } from "@/components/warranties/warranty-form-skeleton";

export default function NuevaGarantiaPage() {
  return (
    <FormPage>
      <Suspense fallback={<WarrantyFormSkeleton />}>
        <WarrantyFormLoader />
      </Suspense>
    </FormPage>
  );
}
