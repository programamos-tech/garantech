"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/warranty";
import type { WarrantyWithRelations } from "@/lib/types";

export function BuscarClient({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: WarrantyWithRelations[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(() => {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    });
  }

  useEffect(() => {
    setResults(initialResults);
  }, [initialResults, initialQuery]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-brand">Buscar garantías</h1>
        <p className="text-sm text-gray-500 mt-2">
          Busca por nombre del cliente, documento, IMEI o referencia
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar en GaranTech..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full rounded-2xl border border-brand/10 bg-white py-4 pl-12 pr-4 text-base shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 transition-all"
        />
      </form>

      {isPending && (
        <p className="text-center text-sm text-gray-400">Buscando...</p>
      )}

      {initialQuery && !isPending && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para &ldquo;{initialQuery}&rdquo;
          </p>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-brand/8 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-gray-500 text-sm">No se encontraron garantías</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((w) => (
                <button
                  key={w.id}
                  onClick={() => router.push(`/garantias/${w.id}`)}
                  className="w-full rounded-xl border border-brand/8 bg-white p-5 text-left hover:border-brand/25 hover:shadow-md hover:shadow-brand/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{w.customer.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{w.product.name}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{w.identifier}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Venta: {formatDate(w.sale_date)}</span>
                    <span>Vence: {formatDate(w.warranty_end_date)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
