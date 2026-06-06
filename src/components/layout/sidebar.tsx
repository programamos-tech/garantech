"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShieldCheck,
  ClipboardList,
  Search,
  LogOut,
} from "lucide-react";
import type { Store } from "@/lib/types";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/garantias", label: "Garantías", icon: ShieldCheck },
  { href: "/gestion", label: "Reclamos", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/buscar", label: "Buscar", icon: Search },
];

export function Sidebar({ store }: { store: Store }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-brand text-white">
      <div className="flex flex-col h-full">
        <div className="px-3 py-3 border-b border-white/10">
          <Image
            src="/garantech Logo.png"
            alt="GaranTech"
            width={379}
            height={93}
            className="w-[82%] h-auto mx-auto block"
            priority
          />
        </div>

        <div className="px-4 py-4">
          <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <p className="text-sm font-semibold truncate">{store.name}</p>
            <p className="text-xs text-white/50 mt-0.5 font-medium">Tienda activa</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
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
        </nav>

        <div className="p-4 border-t border-white/10">
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
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-brand/10 bg-white lg:hidden shadow-[0_-4px_20px_rgba(33,35,85,0.08)] dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 6).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold transition-colors ${
                active ? "text-brand dark:text-indigo-300" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
