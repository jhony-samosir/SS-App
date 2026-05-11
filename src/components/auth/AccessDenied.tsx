"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showHome?: boolean;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You don't have the necessary permissions to access this resource. Please contact your administrator if you believe this is a mistake.",
  showHome = true,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-background selection:bg-primary/20">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center text-destructive relative z-10">
          <ShieldAlert size={48} strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 bg-destructive/5 rounded-[2.5rem] scale-125 blur-xl -z-0 animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-4"
      >
        <h1 className="text-4xl font-black tracking-tighter font-heading uppercase italic">
          {title}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 transition-all font-bold text-sm"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          {showHome && (
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm"
            >
              <Home size={18} />
              Return Home
            </Link>
          )}
        </div>
      </motion.div>

      <div className="mt-16 flex items-center gap-3 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
        <Lock size={12} />
        <span>Secure Identity Propagation Active</span>
      </div>
    </div>
  );
}
