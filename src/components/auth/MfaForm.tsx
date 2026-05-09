"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import axios from "axios";

const mfaSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type MfaFormValues = z.infer<typeof mfaSchema>;

export function MfaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mfaToken, isMfaRequired, setAuth, clearMfaChallenge, isHydrated } = useAuth();

  useEffect(() => {
    // If no MFA challenge is active after hydration, redirect to login
    if (isHydrated && (!isMfaRequired || !mfaToken)) {
      router.replace("/login");
    }
  }, [isHydrated, isMfaRequired, mfaToken, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
  });

  const onSubmit = async (data: MfaFormValues) => {
    if (!mfaToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyMfa({
        mfaToken,
        code: data.code,
      });

      if (response.user) {
        setAuth(response.user);
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      let message = "Invalid verification code. Please try again.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    clearMfaChallenge();
    router.push("/login");
  };

  if (!isMfaRequired || !mfaToken) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 p-8 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl"
    >
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Two-Step Verification</h1>
        <p className="text-muted-foreground">Please enter the 6-digit code from your authenticator app</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium pl-1" htmlFor="code">Verification Code</label>
          <input
            {...register("code")}
            id="code"
            placeholder="000000"
            maxLength={6}
            className={cn(
              "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-4 text-center text-3xl font-bold tracking-[0.5em] transition-all outline-none ring-primary/10 focus:ring-4",
              errors.code && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
            )}
          />
          {errors.code && <p className="text-xs text-destructive text-center">{errors.code.message}</p>}
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Verify Code
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground py-3 rounded-2xl font-medium transition-all"
          >
            Cancel and Sign In again
          </button>
        </div>
      </form>

      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw size={14} />
        <span>Having trouble? Contact support</span>
      </div>
    </motion.div>
  );
}
