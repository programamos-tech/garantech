import { notFound } from "next/navigation";
import { getProductWithWarranties } from "@/lib/actions/products";
import { ProductDetailView } from "@/components/products/product-detail-view";

export default async function ProductoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductWithWarranties(id);

  if (!data) notFound();

  return (
    <div className="max-w-6xl">
      <ProductDetailView product={data.product} warranties={data.warranties} />
    </div>
  );
}
