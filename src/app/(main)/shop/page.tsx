"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import { Search, Grid2X2, List, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/catalog/ProductCard";

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["faceted-search", searchQuery],
    queryFn: () => catalogService.getProducts({ q: searchQuery }),
  });

  const products = data?.data || [];

  return (
    <div className="pt-24 min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <div className="bg-primary/5 py-12 mb-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Snack Collection</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
            Discover the finest artisanal snacks from across the islands
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all",
                showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/50 hover:bg-muted"
              )}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            <div className="h-10 w-px bg-border/50 mx-2 hidden md:block" />

            <div className="bg-muted/30 p-1.5 rounded-2xl flex gap-1">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-xl transition-all", viewMode === "grid" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-background/50")}
              >
                <Grid2X2 size={20} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-xl transition-all", viewMode === "list" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-background/50")}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-3 space-y-10"
              >
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">Categories</h4>
                  <div className="space-y-3">
                    {["All Snacks", "Keripik", "Kue Kering", "Traditional", "Sweet", "Savory"].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-5 h-5 rounded-md border-2 border-border group-hover:border-primary/50 transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">Price Range</h4>
                  <div className="space-y-6">
                     <div className="h-1.5 w-full bg-muted rounded-full relative">
                        <div className="absolute left-[10%] right-[40%] top-0 bottom-0 bg-primary rounded-full" />
                        <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-lg" />
                        <div className="absolute right-[40%] top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-lg" />
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold">
                        <span>Rp 10.000</span>
                        <span>Rp 250.000</span>
                     </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <button className="w-full py-4 bg-muted hover:bg-muted/80 font-bold rounded-2xl transition-all">
                    Reset All Filters
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <main className={cn("transition-all duration-500", showFilters ? "lg:col-span-9" : "lg:col-span-12")}>
            {isLoading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? (showFilters ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4") 
                  : "grid-cols-1"
              )}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-muted/30 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/10 rounded-[4rem] border border-dashed border-border">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                  <Search size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">No snacks found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? (showFilters ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4") 
                  : "grid-cols-1"
              )}>
                 {products.map((p, i) => (
                   <ProductCard key={p.id} product={p} index={i} viewMode={viewMode} />
                 ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
