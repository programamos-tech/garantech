import { notFound } from "next/navigation";
import { getCustomerWithWarranties } from "@/lib/actions/customers";
import { CustomerDetailView } from "@/components/customers/customer-detail-view";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerWithWarranties(id);

  if (!data) notFound();

  return (
    <div className="max-w-6xl">
      <CustomerDetailView customer={data.customer} warranties={data.warranties} />
    </div>
  );
}
