import { getWarranties } from "@/lib/actions/warranties";
import { GarantiasClient } from "./garantias-client";

export default async function GarantiasPage() {
  const warranties = await getWarranties();

  return <GarantiasClient initialWarranties={warranties} />;
}
