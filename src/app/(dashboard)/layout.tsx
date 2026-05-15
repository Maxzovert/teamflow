import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DashboardMain } from "@/components/layout/dashboard-main";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/70 via-[#f5f3ff] to-[#f5f3ff] pointer-events-none" />
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <DashboardMain>{children}</DashboardMain>
        <MobileNav />
      </main>
    </div>
  );
}
