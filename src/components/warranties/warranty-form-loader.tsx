import { getWarrantyFormCatalog } from "@/lib/actions/warranties";
import { WarrantyForm } from "@/components/warranties/warranty-form";

export async function WarrantyFormLoader() {
  const { customers, products } = await getWarrantyFormCatalog();

  return <WarrantyForm customers={customers} products={products} />;
}
