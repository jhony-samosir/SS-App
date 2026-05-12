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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full space-y-8 text-center"
    >
      {verificationState === "loading" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] border border-primary/20 flex items-center justify-center mx-auto shadow-xl shadow-primary/5">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight font-sans">Verifying Email</h1>
            <p className="text-muted-foreground text-sm font-medium">Please wait while we verify your email address...</p>
          </div>
        </div>
      )}

      {verificationState === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/5">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight font-sans">Email Verified!</h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Your email has been successfully verified. <br /> Redirecting to login...
            </p>
          </div>
          <Button
            asChild
            variant="soft"
            className="w-full py-7 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
          >
            <Link href="/login">Go to Login Now</Link>
          </Button>
        </motion.div>
      )}

      {verificationState === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-[2rem] border border-destructive/20 flex items-center justify-center mx-auto shadow-xl shadow-destructive/5">
            <XCircle size={40} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight font-sans text-destructive">Verification Failed</h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              {errorMessage || "The verification link is invalid or has expired."}
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => alert("Resend Verification - API Integration Pending")}
              className="w-full h-14 rounded-2xl gap-3 font-bold text-[11px] uppercase tracking-widest border-border/60"
            >
              <RefreshCw size={18} />
              Resend Verification Email
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full h-12 rounded-2xl gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <Link href="/login">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
