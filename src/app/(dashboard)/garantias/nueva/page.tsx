import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { FormPage } from "@/components/ui/responsive-list";
import { WarrantyForm } from "@/components/warranties/warranty-form";

export default async function NuevaGarantiaPage() {
  const [customers, products] = await Promise.all([getCustomers(), getProducts()]);

  return (
    <FormPage>
      <WarrantyForm customers={customers} products={products} />
    </FormPage>
  );
}
