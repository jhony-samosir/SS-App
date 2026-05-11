"use client";

import { useAuth } from "@/hooks/use-auth";

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.name || "Seller"}. Here is an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder metric cards */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card">
          <h3 className="font-semibold text-muted-foreground text-sm">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">Rp 0</p>
        </div>
        <div className="p-6 rounded-2xl border border-border/50 bg-card">
          <h3 className="font-semibold text-muted-foreground text-sm">Active Orders</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 rounded-2xl border border-border/50 bg-card">
          <h3 className="font-semibold text-muted-foreground text-sm">Products</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 rounded-2xl border border-border/50 bg-card">
          <h3 className="font-semibold text-muted-foreground text-sm">Store Rating</h3>
          <p className="text-3xl font-bold mt-2">-</p>
        </div>
      </div>
    </div>
  );
}
