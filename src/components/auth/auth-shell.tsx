"use client";

import Image from "next/image";
import { ClipboardList, ShieldCheck, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Garantías digitales",
    description: "Registra ventas y emite certificados listos para imprimir.",
  },
  {
    icon: ClipboardList,
    title: "Reclamos centralizados",
    description: "Da seguimiento a cada caso desde un solo panel.",
  },
  {
    icon: Users,
    title: "Clientes y productos",
    description: "Toda la información de tu tienda, siempre a mano.",
  },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col bg-brand text-white">
        <div className="flex flex-1 flex-col justify-center px-10 py-12 xl:px-14">
          <div className="max-w-md">
            <Image
              src="/garantech Logo.png"
              alt="GaranTech"
              width={379}
              height={93}
              className="h-auto w-full max-w-[300px] xl:max-w-[340px] object-contain object-left"
              priority
            />
            <p className="mt-6 max-w-sm text-base font-medium leading-relaxed text-white/75 xl:text-lg">
              Gestión de garantías y postventa para tu tienda de tecnología.
            </p>
          </div>

          <ul className="mt-10 max-w-md space-y-5 xl:mt-12">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white/70" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/55">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <Image
            src="/garantech Logo.png"
            alt="GaranTech"
            width={379}
            height={93}
            className="h-8 w-auto object-contain lg:hidden"
            priority
          />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
