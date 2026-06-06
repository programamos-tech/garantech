import { NextResponse } from "next/server";
import { getCustomerWithWarranties } from "@/lib/actions/customers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getCustomerWithWarranties(id);

  if (!data) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...data.customer,
    warranties: data.warranties,
  });
}
