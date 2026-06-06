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
      <div className="lg:pl-64">
        <Topbar store={store} user={user} />
        <main className="px-4 py-6 lg:px-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
