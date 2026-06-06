import { getCustomers } from "@/lib/actions/customers";
import { ClientesClient } from "./clientes-client";

export default async function ClientesPage() {
  const customers = await getCustomers();
  return <ClientesClient initialCustomers={customers} />;
}
