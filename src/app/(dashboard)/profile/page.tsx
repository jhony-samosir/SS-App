"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Shield, ShieldAlert, ChevronRight, User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) return null;
  if (!user) return <div>Please sign in to view your profile.</div>;

  return (
    <div className="container max-w-4xl mx-auto px-6 py-24 space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <UserIcon size={48} strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-heading">{user.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Two-Step Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
              </div>
            </div>
            
            <Link 
              href="/profile/mfa"
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Setup MFA
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Dummy sections for profile look and feel */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary" size={18} />
              Account Security
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password</span>
                <button className="text-primary font-bold hover:underline">Change</button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent Activity</span>
                <span className="font-medium">View All</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={18} />
              Active Sessions
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">You are currently logged in on this Windows device.</p>
              <button className="text-destructive font-bold hover:underline">Sign out of all devices</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
