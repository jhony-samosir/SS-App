import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-grow p-8 overflow-y-auto">
        <AdminGuard>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </AdminGuard>
      </main>
    </div>
  );
}
