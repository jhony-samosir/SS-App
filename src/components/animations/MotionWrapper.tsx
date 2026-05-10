"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function FadeIn({ children, className, ...props }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, ...props }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ children, className, direction = "left", ...props }: MotionProps & { direction?: "left" | "right" | "up" | "down" }) {
  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
    },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Float({ children, className, ...props }: MotionProps) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
