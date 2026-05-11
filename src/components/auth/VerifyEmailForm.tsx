"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth-service";
import axios from "axios";

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
          // Optionally, redirect to login after a few seconds
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
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 p-8 bg-card/95 rounded-3xl border border-border shadow-xl text-center"
    >
      {verificationState === "loading" && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-heading">Verifying Email</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        </div>
      )}

      {verificationState === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-heading">Email Verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified. Redirecting to login...
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-2xl font-bold transition-all mt-4"
          >
            Go to Login Now
          </Link>
        </motion.div>
      )}

      {verificationState === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <XCircle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-heading">Verification Failed</h1>
            <p className="text-muted-foreground">
              {errorMessage || "The verification link is invalid or has expired."}
            </p>
          </div>
          
          <div className="space-y-3 mt-6">
            <button
              type="button"
              onClick={() => alert("Resend Verification - API Integration Pending")}
              className="w-full flex items-center justify-center gap-2 bg-muted text-foreground hover:bg-muted/80 py-3 rounded-2xl font-bold transition-all"
            >
              <RefreshCw size={18} />
              Resend Verification Email
            </button>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
