"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import { cn } from "@/lib/utils";

export function FeaturedProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => catalogService.getProducts({ is_featured: true, limit: 8 }),
  });

  const baseProducts = data?.data || [];
  
  // Fill with premium mock products to make the grid look rich
  const products = [
    {
      id: "p1",
      name: "Keripik Singkong Pedas",
      flavor: "Spicy",
      price: 25000,
      image_url: "/images/cat-keripik.png",
      rating: 4.9,
    },
    {
      id: "p2",
      name: "Astor Chocolate Rolls",
      flavor: "Sweet",
      price: 32000,
      image_url: "/images/cat-astor.png",
      rating: 5.0,
    },
    {
      id: "p3",
      name: "Kerupuk Udang Jumbo",
      flavor: "Savory",
      price: 18000,
      image_url: "/images/cat-kerupuk.png",
      rating: 4.8,
    },
    {
      id: "p4",
      name: "Kue Semprit Mentega",
      flavor: "Sweet",
      price: 45000,
      image_url: "/images/cat-kue-kering.png",
      rating: 4.7,
    },
    {
      id: "p5",
      name: "Aneka Kacang Atom",
      flavor: "Savory",
      price: 15000,
      image_url: "/images/prod-kacang-atom.png",
      rating: 4.9,
    },
  ];

  const [filter, setFilter] = useState("All");

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
            {["All", "Sweet", "Spicy", "Savory"].map((item) => (
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
            <div className="h-6 w-px bg-border mx-2 hidden md:block" />
            <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              Sort by Price
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.filter(p => filter === "All" || p.flavor === filter).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-[2.5rem] p-4 transition-all hover:shadow-2xl hover:shadow-primary/5 border border-border/50 relative overflow-hidden active:scale-[0.98]"
            >
              <div className="relative aspect-square mb-5 overflow-hidden rounded-[2rem] bg-muted/30 border border-border/10">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Hover Add to Cart */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 shadow-primary/10">
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>

                <button className="absolute top-4 right-4 p-2.5 bg-card/80 backdrop-blur-md rounded-2xl text-muted-foreground hover:text-rose-500 transition-all shadow-sm border border-border/50 group/heart">
                  <Heart size={18} className="transition-transform group-hover/heart:scale-110" />
                </button>
              </div>

              <div className="px-2 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{product.flavor}</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10">
                    <Star size={12} className="fill-secondary text-secondary" />
                    <span className="text-xs font-bold text-secondary-foreground">{product.rating}</span>
                  </div>
                </div>

                <h3 className="text-foreground font-bold text-lg mb-4 line-clamp-1 group-hover:text-primary transition-colors font-sans">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Price</span>
                    <span className="text-xl font-bold text-foreground">
                      Rp {product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ShoppingCart size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

