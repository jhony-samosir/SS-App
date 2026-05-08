"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Rannin",
    quote: "Keripik singkong pedasnya benar-benar juara! Renyah dan bumbunya pas. Nagih banget!",
    rating: 5,
    role: "Verified Snack Lover"
  },
  {
    name: "Bans",
    quote: "Kue kering kacang metenya meleleh di mulut. Teman minum teh yang sempurna di sore hari.",
    rating: 5,
    role: "Artisanal Buyer"
  },
  {
    name: "Arooray",
    quote: "Found exactly the snacks I was missing from home. The Kerupuk Udang is authentic and fresh.",
    rating: 5,
    role: "Happy Customer"
  }
];

export function Reviews() {
  return (
    <section className="py-32 bg-white/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-sans">
            Kind Words
          </h2>
          <p className="text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">
            From our community of snack lovers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-12 bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col items-center text-center"
            >
              <div className="flex items-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "fill-primary text-primary" : "text-slate-200"}
                  />
                ))}
              </div>

              <p className="text-slate-600 text-lg mb-12 leading-relaxed font-medium">
                &quot;{review.quote}&quot;
              </p>

              <div className="flex flex-col items-center gap-4 mt-auto">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg font-sans">{review.name}</h4>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Review Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 max-w-3xl mx-auto p-16 bg-white rounded-[4rem] shadow-2xl shadow-primary/5 border border-slate-100"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 font-sans">Share Your Experience</h3>
            <p className="text-slate-500 font-medium">We love hearing from our community.</p>
          </div>
          
          <div className="space-y-6">
            <textarea 
              placeholder="How was your snack experience?"
              className="w-full p-8 rounded-[2rem] bg-slate-50 border-none focus:outline-none focus:ring-4 focus:ring-primary/10 text-slate-900 min-h-[160px] transition-all text-lg"
            />
            <div className="flex justify-center">
              <button className="px-16 py-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl shadow-primary/20">
                Submit Review
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

