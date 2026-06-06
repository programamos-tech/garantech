import { listClaims } from "@/lib/actions/claims";
import { GestionDesk } from "@/components/gestion/gestion-desk";

export default async function GestionPage() {
  const claims = await listClaims();

  return <GestionDesk claims={claims} />;
}
