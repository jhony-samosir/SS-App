"use client";

import { motion } from "framer-motion";

export function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, -20, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-secondary/10 blur-[120px]" 
      />
    </div>
  );
}
