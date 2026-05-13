"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import { cn } from "@/lib/utils";

import { ProductCard } from "@/components/catalog/ProductCard";

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => catalogService.getProducts({ is_featured: true, limit: 8 }),
  });

  const products = data?.data || [];
  const [filter, setFilter] = useState("All");

  const filteredProducts = products.filter(p => {
    if (filter === "All") return true;
    return p.categories?.some(c => c.name === filter);
  });

  return (
    <section id="products" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
              Daily Cravings
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-sans">
              Featured Snacks
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "Snacks", "Drinks"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  filter === item 
                    ? "bg-primary text-foreground shadow-lg shadow-primary/20" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted/30 rounded-[2.5rem] animate-pulse" />
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground">No featured snacks found in this category.</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

