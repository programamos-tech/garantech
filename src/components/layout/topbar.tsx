"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  Plus,
  HelpCircle,
  Zap,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { GlobalSearch } from "@/components/layout/global-search";
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-brand lg:border-gray-200/80 lg:bg-white lg:dark:border-gray-800 lg:dark:bg-gray-950">
      <div className="flex h-14 sm:h-[60px] w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6">
        <Link href="/garantias" className="shrink-0 lg:hidden">
          <Image
            src="/garantech Logo.png"
            alt="GaranTech"
            width={379}
            height={93}
            className="h-7 sm:h-8 w-auto object-contain"
            priority
          />
        </Link>

        <GlobalSearch />

        <div className="hidden lg:flex items-center gap-1.5 sm:gap-2 shrink-0 lg:ml-3">
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
            <Link
              href="/configuracion"
              title="Configuración"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <IconButton icon={Bell} label="Notificaciones" badge />
          </div>

          <ProfileMenu
            store={store}
            user={user}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
            showDetails={true}
          />
        </div>

        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          <ThemeToggle variant="on-brand" />
          <Link
            href="/garantias/nueva"
            title="Registrar garantía"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand shadow-sm hover:bg-white/90 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <ProfileMenu
            store={store}
            user={user}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuRef={menuRef}
            showDetails={false}
            variant="on-brand"
          />
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({
  store,
  user,
  menuOpen,
  setMenuOpen,
  menuRef,
  showDetails,
  variant = "default",
}: {
  store: Store;
  user: SessionUser;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  showDetails: boolean;
  variant?: "default" | "on-brand";
}) {
  const onBrand = variant === "on-brand";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className={
          onBrand
            ? "flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-2 hover:bg-white/20 transition-colors"
            : "flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2 sm:pr-3 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        }
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <UserAvatar seed={user.id} name={store.name} size={32} />
        {showDetails && (
          <>
            <div className="text-left hidden xl:block">
              <p className="text-sm font-bold text-gray-900 leading-tight max-w-[120px] truncate dark:text-gray-100">
                {store.name}
              </p>
              <p className="text-xs text-gray-400 leading-tight">Propietario</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform hidden xl:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-brand/5 z-50 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-900 truncate dark:text-gray-100">
              {store.name}
            </p>
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
