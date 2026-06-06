"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateTime } from "@/lib/warranty";
import type { Customer } from "@/lib/types";
import {
  PageActions,
  PageHeader,
  PageHeaderContent,
  ResponsiveCardItem,
  ResponsiveCardList,
  ResponsiveTable,
} from "@/components/ui/responsive-list";

function formatDocument(doc: string | null): string {
  if (!doc) return "—";
  return doc;
}

export function ClientesClient({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return initialCustomers;
    const q = search.toLowerCase();
    return initialCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.document_number?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [initialCustomers, search]);

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  function goToCustomer(id: string) {
    router.push(`/clientes/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <PageHeaderContent>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Lista de tu tienda. Busca por nombre, documento, correo o teléfono.
          </p>
        </PageHeaderContent>
        <PageActions>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Link href="/clientes/nuevo" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </Link>
        </PageActions>
      </PageHeader>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, documento, correo o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              {search ? "No se encontraron clientes" : "No hay clientes registrados"}
            </p>
            {!search && (
              <Link href="/clientes/nuevo" className="inline-block mt-3 text-sm link-brand">
                Registrar primer cliente →
              </Link>
            )}
          </div>
        ) : (
          <>
            <ResponsiveCardList>
              {filtered.map((customer) => (
                <ResponsiveCardItem
                  key={customer.id}
                  onClick={() => goToCustomer(customer.id)}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      seed={customer.id}
                      name={customer.name}
                      size={40}
                      className="ring-0 shadow-none shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate dark:text-gray-100">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                        {formatDocument(customer.document_number)}
                        {customer.phone ? ` · ${customer.phone}` : ""}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate dark:text-gray-500">
                          {customer.email}
                        </p>
                      )}
                    </div>
                    <Eye className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                </ResponsiveCardItem>
              ))}
            </ResponsiveCardList>

            <ResponsiveTable>
          <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cliente
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                    Documento
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                    Correo
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                    Teléfono
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hidden xl:table-cell">
                    Registrado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, index) => (
                  <tr
                    key={customer.id}
                    onClick={() => goToCustomer(customer.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToCustomer(customer.id);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    className={`border-b border-gray-50 transition-colors cursor-pointer hover:bg-amber-50/40 focus:outline-none focus:bg-amber-50/60 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          seed={customer.id}
                          name={customer.name}
                          size={36}
                          className="ring-0 shadow-none"
                        />
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden sm:table-cell font-mono text-xs">
                      {formatDocument(customer.document_number)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell max-w-[180px] truncate">
                      {customer.email || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden lg:table-cell whitespace-nowrap">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden xl:table-cell whitespace-nowrap">
                      {formatDateTime(customer.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400">
                        <Eye className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </ResponsiveTable>
          </>
        )}
      </div>
    </div>
  );
}
