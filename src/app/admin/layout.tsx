import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
      <AdminSidebar />
      <div className="grow flex flex-col min-w-0">
        <main className="grow p-8 lg:p-12 overflow-x-hidden overflow-y-auto bg-muted/5">
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
