"use client";

import { motion } from "framer-motion";
import { Package, Plus, ArrowRight, ShoppingCart, Percent } from "lucide-react";

interface BundleItem {
  id: number;
  name: string;
  quantity: number;
  imageUrl: string;
}

interface BundleProps {
  id: number;
  name: string;
  description: string;
  items: BundleItem[];
  originalPrice: number;
  bundlePrice: number;
}

export function BundleCard({ name, description, items, originalPrice, bundlePrice }: Readonly<BundleProps>) {
  const savings = originalPrice - bundlePrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="group relative bg-card rounded-[3rem] p-8 border border-border/50 shadow-xl overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Percent size={10} />
                Bundle & Save {savingsPercent}%
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-2">{name}</h3>
            <p className="text-muted-foreground text-sm max-w-md">{description}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-2xl">
            <Package size={24} className="text-primary" />
          </div>
        </div>

        {/* Bundle Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {items.map((item, index) => (
            <div key={item.id} className="relative">
              <div className="aspect-square rounded-2xl bg-muted/30 border border-border/10 overflow-hidden mb-2 group-hover:border-primary/20 transition-all relative">
                {/* Image Rendering */}
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                     <Package size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-lg border border-border/50">
                  x{item.quantity}
                </div>
              </div>
              <p className="text-[10px] font-bold text-center truncate px-2">{item.name}</p>
              
              {index < items.length - 1 && (
                <div className="absolute -right-3 top-1/3 z-20 text-muted-foreground/30 hidden md:block">
                  <Plus size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-muted/20 rounded-[2rem] border border-border/30 gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Bundle Deal</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                Rp {bundlePrice.toLocaleString('id-ID')}
              </span>
              <span className="text-lg text-muted-foreground line-through decoration-primary/40 opacity-50">
                Rp {originalPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-xs text-emerald-500 font-bold mt-1">You save Rp {savings.toLocaleString('id-ID')}</span>
          </div>
          
          <button className="flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all group/btn">
            <ShoppingCart size={20} />
            Buy This Bundle
            <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
