"use client";

import { Truck, ShieldCheck, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export function TrustSignals() {
  const signals = [
    {
      icon: <Truck size={32} />,
      title: "Fast Shipping",
      desc: "Same-day delivery for local orders within 24 hours.",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Secure Payment",
      desc: "100% encrypted transactions for your peace of mind.",
    },
    {
      icon: <HeartPulse size={32} />,
      title: "Authentic Local Taste",
      desc: "Carefully sourced from local artisans across Indonesia.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-6 group"
            >
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {signal.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{signal.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {signal.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
