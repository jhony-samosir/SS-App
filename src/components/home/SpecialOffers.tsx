"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";

export function SpecialOffers() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-secondary/10 border border-secondary/20 p-8 md:p-16"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/10 rounded-l-full transform translate-x-20 hidden lg:block" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-foreground text-xs font-bold uppercase tracking-widest mb-6">
                <Gift size={16} />
                Special Offer of the Week
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-sans">
                Weekend Snack <br />
                <span className="text-secondary italic">Bundle Box</span>
              </h2>
              
              <p className="text-muted-foreground text-lg md:text-xl max-w-md mb-10 leading-relaxed font-medium">
                Get a curated bundle of our best-selling keripik and cookies. Perfect for family gatherings or your secret stash.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm line-through decoration-2">Rp 150.000</span>
                  <span className="text-3xl font-bold text-foreground">Rp 99.000</span>
                </div>
                <button className="px-10 py-5 bg-foreground text-white font-bold rounded-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2 shadow-xl shadow-black/10">
                  Claim Offer
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="relative h-[300px] md:h-[400px]">
              <motion.div
                animate={{ rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white"
              >
                <Image
                  src="/images/special-offer.png"
                  alt="Special Snack Bundle"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
