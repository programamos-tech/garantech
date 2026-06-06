import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { WarrantyForm } from "@/components/warranties/warranty-form";

export default async function NuevaGarantiaPage() {
  const [customers, products] = await Promise.all([getCustomers(), getProducts()]);

  return (
    <div className="max-w-6xl">
      <WarrantyForm customers={customers} products={products} />
    </div>
  );
}
