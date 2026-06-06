import { searchWarranties } from "@/lib/actions/warranties";
import { BuscarClient } from "./buscar-client";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await searchWarranties(q) : [];

  return <BuscarClient initialQuery={q ?? ""} initialResults={results} />;
}
