"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  Package,
  ShieldCheck,
  ClipboardList,
  LogOut,
  Settings,
} from "lucide-react";
import type { Store } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/garantias", label: "Garantías", icon: ShieldCheck },
  { href: "/gestion", label: "Reclamos", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Productos", icon: Package },
];

export function Sidebar({ store }: { store: Store }) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar hidden md:flex md:w-64 md:flex-col md:sticky md:top-0 md:h-dvh md:max-h-dvh md:shrink-0 md:self-start bg-brand text-white z-40 print:hidden">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 px-3 py-3 border-b border-white/10">
          <Image
            src="/garantech Logo.png"
            alt="GaranTech"
            width={379}
            height={93}
            className="w-[82%] h-auto mx-auto block"
            priority
          />
          <p className="mt-3 px-2 text-center text-xs font-medium leading-relaxed text-white/55">
            Gestiona la postventa de tu tienda
          </p>
        </div>

        <div className="shrink-0 px-4 py-4">
          <div className="rounded-xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {store.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{store.name}</p>
                <p className="text-xs text-white/50 mt-0.5 font-medium">Tienda activa</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-white text-brand shadow-sm dark:bg-white dark:text-brand"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/configuracion"
            prefetch
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
              pathname.startsWith("/configuracion")
                ? "bg-white text-brand shadow-sm dark:bg-white dark:text-brand"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5 shrink-0" />
            Configuración
          </Link>
        </nav>

        <div className="shrink-0 p-4 border-t border-white/10">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-brand md:hidden min-h-[var(--mobile-nav-height)] pb-[env(safe-area-inset-bottom,0px)] print:hidden"
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around py-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold transition-colors ${
                active ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="truncate max-w-[4.5rem]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
