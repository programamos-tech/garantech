import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/store";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardPageSkeleton } from "@/components/layout/dashboard-page-skeleton";
import { DashboardNavProgress } from "@/components/layout/dashboard-nav-progress";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getDashboardContext();

  if (!context) {
    redirect("/login");
  }

  const { store, user } = context;

  return (
    <div className="min-h-dvh bg-background">
      <DashboardNavProgress />
      <Sidebar store={store} />
      <div className="min-w-0 md:pl-64">
        <Topbar store={store} user={user} />
        <main className="w-full min-w-0 max-w-none px-3 pt-4 sm:px-4 sm:pt-6 md:px-8 pb-[calc(var(--mobile-nav-height)+1rem+env(safe-area-inset-bottom,0px))] md:pb-8">
          <Suspense fallback={<DashboardPageSkeleton />}>{children}</Suspense>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
