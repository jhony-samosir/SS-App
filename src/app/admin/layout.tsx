import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
      <AdminSidebar />
      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-grow p-8 lg:p-12 overflow-y-auto bg-muted/5">
          <AdminGuard>
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </AdminGuard>
        </main>
      </div>
    </div>
  );
}
