import { getDashboardStats } from "@/lib/actions/warranties";
import { getCurrentStore } from "@/lib/store";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/warranty";
import { ShieldCheck, AlertTriangle, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [store, stats] = await Promise.all([
    getCurrentStore(),
    getDashboardStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500">Panel de tienda</p>
        <h1 className="text-2xl font-bold text-brand mt-1">
          Hola, {store?.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Garantías vigentes"
          value={stats.vigentes}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Por vencer este mes"
          value={stats.porVencer}
          color="amber"
        />
        <StatCard
          icon={Users}
          label="Clientes registrados"
          value={stats.totalClientes}
          color="blue"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Garantías recientes</h2>
          <Link
            href="/garantias"
            className="text-sm link-brand"
          >
            Ver todas
          </Link>
        </div>

        <div className="rounded-2xl border border-brand/8 bg-white overflow-hidden shadow-sm">
          {stats.recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">No hay garantías registradas aún</p>
              <Link
                href="/garantias/nueva"
                className="inline-block mt-3 text-sm link-brand"
              >
                Registrar primera garantía →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Cliente</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Producto</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 hidden sm:table-cell">
                      Identificador
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Vencimiento
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((w) => (
                    <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        <Link href={`/garantias/${w.id}`} className="hover:text-brand">
                          {w.customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <Link href={`/garantias/${w.id}`} className="hover:text-brand">
                          {w.product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-500 hidden sm:table-cell font-mono text-xs">
                        {w.identifier}
                      </td>
                      <td className="px-6 py-3 text-gray-500 hidden md:table-cell">
                        {formatDate(w.warranty_end_date)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={w.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "green" | "amber" | "blue";
}) {
  const colors = {
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-brand-light text-brand",
  };

  return (
    <div className="rounded-2xl border border-brand/8 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
