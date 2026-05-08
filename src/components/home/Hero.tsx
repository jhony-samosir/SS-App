"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-background">
      {/* Soft Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-secondary/10 rounded-l-[10rem] transform translate-x-20" />
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
          >
            Authentic Local Flavors
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.05] mb-6 font-sans">
            Your Daily <br />
            <span className="text-primary italic">Crunch,</span> <br />
            Delivered.
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
            From crispy keripik to buttery cookies, discover the finest local snacks curated just for you. Freshly made, beautifully packed.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="px-10 py-5 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2 shadow-xl shadow-primary/10">
              Shop All Snacks
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
            <button className="px-10 py-5 bg-white hover:bg-muted text-foreground font-bold rounded-2xl transition-all border border-border">
              Best Sellers
            </button>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold">
                  JS
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[10px] font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Join <span className="text-foreground font-bold">2,000+</span> happy snackers this week!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:h-[600px] h-[400px]"
        >
          <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 border-8 border-white">
            <Image
              src="/images/hero.png"
              alt="Curated Local Snacks"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Floating Card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl z-20 border border-white/50 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-foreground text-sm font-bold">Free Shipping</p>
              <p className="text-muted-foreground text-xs font-medium">On orders over 100k</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

