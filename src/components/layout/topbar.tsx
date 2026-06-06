"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  HelpCircle,
  Zap,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOut } from "@/lib/actions/auth";
import type { Store } from "@/lib/types";
import type { SessionUser } from "@/lib/store";

interface TopbarProps {
  store: Store;
  user: SessionUser;
}

export function Topbar({ store, user }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-[60px] items-center gap-3 px-4 lg:px-6">
        {/* Logo móvil */}
        <div className="flex shrink-0 items-center lg:hidden">
          <Image
            src="/logo.png"
            alt="GaranTech"
            width={100}
            height={28}
            className="h-6 w-auto object-contain"
          />
        </div>

        {/* Búsqueda pill */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
            <input
              type="search"
              placeholder="Buscar en GaranTech..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-brand/40 dark:focus:ring-brand/20"
            />
          </div>
        </form>

        {/* Acciones desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Panel
          </Link>

          <Link
            href="/garantias/nueva"
            title="Registrar garantía"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-sm hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </Link>

          <div className="flex items-center gap-0.5 ml-1">
            <ThemeToggle />
            <IconButton icon={HelpCircle} label="Ayuda" />
            <IconButton icon={Zap} label="Acciones" />
            <IconButton icon={Settings} label="Configuración" />
            <IconButton icon={Bell} label="Notificaciones" badge />
          </div>

          {/* Perfil */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <UserAvatar seed={user.id} name={store.name} size={32} />
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-gray-900 leading-tight max-w-[120px] truncate">
                  {store.name}
                </p>
                <p className="text-xs text-gray-400 leading-tight">Propietario</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform hidden lg:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-brand/5 z-50 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-bold text-gray-900 truncate">{store.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Acciones móvil */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <ThemeToggle />
          <Link
            href="/garantias/nueva"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <UserAvatar seed={user.id} name={store.name} size={32} />
        </div>
      </div>
    </header>
  );
}

function IconButton({
  icon: Icon,
  label,
  badge,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {badge && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
      )}
    </button>
  );
}
