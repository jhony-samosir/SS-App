"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PermissionCardProps {
  permission: string;
  index: number;
}

export function PermissionCard({ permission, index }: PermissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <ShieldCheck size={24} />
        </div>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
          Active
        </span>
      </div>
      
      <h3 className="text-lg font-bold mb-2 font-heading">{permission}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Grants administrative access to the {permission.replace(/([A-Z])/g, ' $1').trim()} module capabilities.
      </p>

      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter border-t border-border/50 pt-4">
        <Lock size={12} />
        <span>System Immutable Permission</span>
      </div>
    </motion.div>
  );
}
