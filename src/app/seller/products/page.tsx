"use client";

import { Package, Plus } from "lucide-react";

export default function SellerProductsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-heading">My Products</h1>
          <p className="text-muted-foreground text-lg">Manage your store&apos;s inventory and listings.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden min-h-100 flex flex-col items-center justify-center text-center p-12">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Package size={40} className="text-muted-foreground opacity-20" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No products found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          You haven&apos;t listed any products yet. Click the button above to start selling!
        </p>
      </div>
    </div>
  );
}
