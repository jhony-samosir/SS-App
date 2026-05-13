"use client";

import { ShoppingCart, PackageCheck } from "lucide-react";

export default function SellerOrdersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">Orders</h1>
        <p className="text-muted-foreground text-lg">Track and process your customer orders.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={40} className="text-muted-foreground opacity-20" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground max-w-md">
          Orders will appear here once customers start purchasing your products.
        </p>
      </div>
    </div>
  );
}
