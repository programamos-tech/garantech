import { redirect } from "next/navigation";
import { getCurrentStore, getSessionUser } from "@/lib/store";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, user] = await Promise.all([getCurrentStore(), getSessionUser()]);

  if (!store || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar store={store} />
      <div className="lg:pl-64 min-w-0">
        <Topbar store={store} user={user} />
        <main className="w-full min-w-0 max-w-none px-3 pt-4 sm:px-4 sm:pt-6 lg:px-8 pb-[calc(var(--mobile-nav-height)+1rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
