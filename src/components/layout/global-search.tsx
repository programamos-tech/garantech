"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Package,
  Search,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { GlobalSearchResults } from "@/lib/actions/search";
import { CATEGORY_LABELS } from "@/lib/types";
import { shortClaimId } from "@/lib/claim";
import { shortProductId } from "@/lib/warranty";

type SearchHitKind = "garantia" | "reclamo" | "cliente" | "producto";

type SearchHit = {
  id: string;
  href: string;
  kind: SearchHitKind;
  title: string;
  subtitle: string;
};

const TYPE_STYLES: Record<
  SearchHitKind,
  {
    label: string;
    icon: typeof ShieldCheck;
    iconClass: string;
    badgeClass: string;
    rowActiveClass: string;
    rowHoverClass: string;
  }
> = {
  garantia: {
    label: "Garantía",
    icon: ShieldCheck,
    iconClass: "text-emerald-400",
    badgeClass:
      "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30",
    rowActiveClass: "bg-emerald-500/12",
    rowHoverClass: "hover:bg-emerald-500/8",
  },
  reclamo: {
    label: "Reclamo",
    icon: Wrench,
    iconClass: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30",
    rowActiveClass: "bg-amber-500/12",
    rowHoverClass: "hover:bg-amber-500/8",
  },
  cliente: {
    label: "Cliente",
    icon: Users,
    iconClass: "text-sky-400",
    badgeClass: "bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30",
    rowActiveClass: "bg-sky-500/12",
    rowHoverClass: "hover:bg-sky-500/8",
  },
  producto: {
    label: "Producto",
    icon: Package,
    iconClass: "text-violet-400",
    badgeClass: "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/30",
    rowActiveClass: "bg-violet-500/12",
    rowHoverClass: "hover:bg-violet-500/8",
  },
};

const emptyResults: GlobalSearchResults = {
  warranties: [],
  claims: [],
  customers: [],
  products: [],
};

function flattenResults(results: GlobalSearchResults): SearchHit[] {
  const hits: SearchHit[] = [];

  for (const warranty of results.warranties) {
    hits.push({
      id: `w-${warranty.id}`,
      href: `/garantias/${warranty.id}`,
      kind: "garantia",
      title: warranty.customer.name,
      subtitle: `${warranty.product.name} · ${warranty.identifier}`,
    });
  }

  for (const claim of results.claims) {
    hits.push({
      id: `c-${claim.id}`,
      href: `/gestion/reclamos/${claim.id}`,
      kind: "reclamo",
      title: shortClaimId(claim.id),
      subtitle: `${claim.warranty.customer.name} · ${claim.warranty.product.name}`,
    });
  }

  for (const customer of results.customers) {
    hits.push({
      id: `u-${customer.id}`,
      href: `/clientes/${customer.id}`,
      kind: "cliente",
      title: customer.name,
      subtitle: [customer.document_number, customer.phone, customer.email]
        .filter(Boolean)
        .join(" · "),
    });
  }

  for (const product of results.products) {
    hits.push({
      id: `p-${product.id}`,
      href: `/productos/${product.id}`,
      kind: "producto",
      title: product.name,
      subtitle: `${CATEGORY_LABELS[product.category]} · ${shortProductId(product.id)}`,
    });
  }

  return hits;
}

export function GlobalSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults>(emptyResults);
  const [activeIndex, setActiveIndex] = useState(0);

  const hits = useMemo(() => flattenResults(results), [results]);

  const fetchResults = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults(emptyResults);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as GlobalSearchResults;
      setResults(data);
      setActiveIndex(0);
    } catch {
      setResults(emptyResults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      void fetchResults(query.trim());
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query, open, fetchResults]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function goTo(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hits[activeIndex]) {
      goTo(hits[activeIndex]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || hits.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative min-w-0 w-full flex-1">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 lg:text-gray-400 lg:dark:text-slate-400" />
          <input
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="global-search-results"
            aria-autocomplete="list"
            placeholder="Buscar garantías, reclamos, clientes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-full border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all lg:border-gray-200 lg:bg-white lg:text-gray-900 lg:placeholder:text-gray-400 lg:focus:border-brand/30 lg:focus:ring-brand/10 lg:dark:border-gray-700 lg:dark:bg-gray-900 lg:dark:text-gray-100 lg:dark:placeholder:text-gray-500 lg:dark:focus:border-brand/40 lg:dark:focus:ring-brand/20"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/60 lg:text-gray-400" />
          )}
        </div>
      </form>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="glass-panel-search absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl"
        >
          <div className="max-h-[min(60vh,22rem)] overflow-y-auto overscroll-contain py-1.5">
            {loading && hits.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Buscando...
              </p>
            ) : hits.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Sin resultados para &ldquo;{query.trim()}&rdquo;
              </p>
            ) : (
              <ul className="divide-y divide-white/8">
                {hits.map((hit, index) => {
                  const styles = TYPE_STYLES[hit.kind];
                  const Icon = styles.icon;
                  const active = index === activeIndex;

                  return (
                    <li key={hit.id} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => goTo(hit)}
                        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                          active ? styles.rowActiveClass : styles.rowHoverClass
                        }`}
                      >
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${styles.iconClass}`} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-100">
                              {hit.title}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badgeClass}`}
                            >
                              {styles.label}
                            </span>
                          </span>
                          {hit.subtitle && (
                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {hit.subtitle}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
