"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart, Package } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, index = 0, viewMode = "grid" }: ProductCardProps) {
  const price = product.price || 25000; // Fallback if price missing
  const rating = 4.8; // Placeholder as backend rating might be separate

  if (viewMode === "list") {
    return (
      <Link href={`/shop/${product.id}`}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group bg-card rounded-[2rem] p-6 border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex gap-8 items-center"
        >
          <div className="w-40 h-40 rounded-2xl bg-muted/30 overflow-hidden relative flex-shrink-0">
             {product.image_url ? (
               <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                 <Package size={40} />
               </div>
             )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Snack
              </span>
              <div className="flex items-center gap-1">
                <Star size={10} className="fill-secondary text-secondary" />
                <span className="text-[10px] font-bold">{rating}</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
            <div className="flex items-center justify-between">
               <span className="text-2xl font-black text-foreground">Rp {price.toLocaleString('id-ID')}</span>
               <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                 <ShoppingCart size={16} />
                 Add to Cart
               </button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/shop/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group bg-card rounded-[2.5rem] p-5 border border-border/40 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
      >
        <div className="aspect-square rounded-[2rem] bg-muted/30 mb-6 overflow-hidden relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
              <Package size={48} />
            </div>
          )}
          
          <button className="absolute top-4 right-4 p-2.5 bg-card/80 backdrop-blur-md rounded-2xl text-muted-foreground hover:text-rose-500 transition-all border border-border/50 shadow-sm z-10">
            <Heart size={18} />
          </button>

          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
             <div className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                Quick Add
             </div>
          </div>
        </div>

        <div className="px-1">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Snack
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10">
              <Star size={10} className="fill-secondary text-secondary" />
              <span className="text-[10px] font-bold text-secondary-foreground">{rating}</span>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Price</span>
              <span className="text-xl font-black text-foreground">Rp {price.toLocaleString('id-ID')}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
