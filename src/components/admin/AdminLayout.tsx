"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminGuard } from "@/components/auth/AdminGuard";

export function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="grow pt-24 pb-12 px-6">
        <AdminGuard>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </AdminGuard>
      </main>
      <Footer />
    </div>
  );
}
