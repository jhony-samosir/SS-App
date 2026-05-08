"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";


export function Categories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => catalogService.getCategories(),
  });

  const categories = data?.data || [];

  const premiumCategories = [
    { name: "Keripik", label: "Chips", image: "/images/cat-keripik.png" },
    { name: "Kerupuk", label: "Crackers", image: "/images/cat-kerupuk.png" },
    { name: "Kue Kering", label: "Cookies", image: "/images/cat-kue-kering.png" },
    { name: "Astor & Wafer", label: "Rolls", image: "/images/cat-astor.png" },
  ];

  return (
    <section id="categories" className="py-24 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
              Explore Our Market
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-sans">
              Snack Categories
            </h2>
          </div>
          <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
            View All Categories
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {premiumCategories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl shadow-black/5 border-4 border-white transition-all group-hover:shadow-2xl group-hover:shadow-primary/10">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="text-center">
                <h3 className="text-foreground font-bold tracking-tight text-2xl mb-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-muted-foreground text-sm font-medium">{cat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

