import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { StoreSettingsForm } from "@/components/settings/store-settings-form";
import {
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/responsive-list";

export default async function ConfiguracionPage() {
  const store = await getCurrentStore();
  if (!store) redirect("/login");

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader>
        <PageHeaderContent>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Configuración del negocio
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl dark:text-gray-400">
            Logo, datos fiscales y textos del certificado de garantía que entregas a tus
            clientes.
          </p>
        </PageHeaderContent>
      </PageHeader>

      <StoreSettingsForm store={store} />
    </div>
  );
}
