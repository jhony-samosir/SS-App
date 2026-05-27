"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth-service";
import axios from "axios";
import { Button } from "@/components/ui/button";

type VerificationState = "loading" | "success" | "error";

export function VerifyEmailForm() {
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        setVerificationState("error");
        setErrorMessage("Missing verification token.");
        return;
      }

      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setVerificationState("success");
          setTimeout(() => {
            if (isMounted) router.push("/login");
          }, 3000);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setVerificationState("error");
          let message = "Verification failed. The link may be invalid or expired.";
          if (axios.isAxiosError(err)) {
            message = err.response?.data?.message || message;
          }
          setErrorMessage(message);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-8 text-center"
    >
      {verificationState === "loading" && (
        <div className="space-y-6 py-12">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-pulse blur-xl" />
            <div className="relative w-full h-full bg-primary/5 text-primary rounded-[2.5rem] border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
              <Loader2 size={40} className="animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary mb-1 block">
              Security Check
            </span>
            <h1 className="text-4xl font-medium tracking-tight text-foreground font-heading italic">Verifying Email</h1>
            <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.2em]">Please wait while we secure your account</p>
          </div>
        </div>
      )}

      {verificationState === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 py-8"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-[2.5rem] blur-xl" />
            <div className="relative w-full h-full bg-emerald-500/5 text-emerald-500 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-emerald-500 mb-1 block">
              Activation Success
            </span>
            <h1 className="text-4xl font-medium tracking-tight text-foreground font-heading italic">Verified!</h1>
            <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-60 mx-auto">
              Your account is now fully active. <br /> Redirecting to your portal...
            </p>
          </div>
          <Button
            asChild
            variant="soft"
            className="w-full h-14 text-[10px] font-black uppercase tracking-[0.4em] group shadow-2xl shadow-primary/10 rounded-2xl relative overflow-hidden"
          >
            <Link href="/login" className="relative z-10 flex items-center justify-center">
              Enter Portal
            </Link>
          </Button>
        </motion.div>
      )}

      {verificationState === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 py-8"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-destructive/20 rounded-[2.5rem] blur-xl" />
            <div className="relative w-full h-full bg-destructive/5 text-destructive rounded-[2.5rem] border border-destructive/20 flex items-center justify-center shadow-2xl shadow-destructive/10">
              <XCircle size={40} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-destructive mb-1 block">
              Access Interrupted
            </span>
            <h1 className="text-4xl font-medium tracking-tight text-foreground font-heading italic">Verification Failed</h1>
            <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-60 mx-auto">
              {errorMessage || "The verification link is invalid or has expired."}
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => alert("Resend Verification - API Integration Pending")}
              className="w-full h-14 rounded-2xl gap-3 font-black text-[9px] uppercase tracking-[0.3em] border-border/40 hover:bg-muted/30 transition-all duration-500 shadow-xl shadow-black/5"
            >
              <RefreshCw size={14} />
              Resend Email
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full h-12 rounded-2xl gap-2 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 hover:text-foreground transition-all duration-500"
            >
              <Link href="/login" className="flex items-center justify-center">
                <ArrowLeft size={12} className="mr-2" />
                Return to Login
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
