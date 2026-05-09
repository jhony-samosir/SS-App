"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { PinInput, type PinInputHandle } from "./PinInput";
import axios from "axios";

const mfaSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type MfaFormValues = z.infer<typeof mfaSchema>;

export function MfaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const router = useRouter();
  const pinRef = useRef<PinInputHandle>(null);
  
  const { mfaToken, isMfaRequired, setAuth, clearMfaChallenge, isHydrated } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  });

  const code = watch("code");

  useEffect(() => {
    // If no MFA challenge is active after hydration, redirect to login
    // Security: mfaToken is ephemeral, so refresh = redirect
    if (isHydrated && (!isMfaRequired || !mfaToken)) {
      router.replace("/login");
    }
  }, [isHydrated, isMfaRequired, mfaToken, router]);

  const onSubmit = async (data: MfaFormValues) => {
    if (!mfaToken) return;

    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

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
        if (err.response?.status === 429) {
          message = "Too many attempts. Please try again in a few minutes.";
          setIsRateLimited(true);
        } else {
          message = err.response?.data?.message || message;
        }
      }
      
      setError(message);
      
      // UX Best Practice: Reset code and autofocus on error
      setValue("code", "");
      setTimeout(() => {
        pinRef.current?.focus();
      }, 100);
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
      animate={{ 
        opacity: 1, 
        y: 0,
        x: error ? [0, -10, 10, -10, 10, 0] : 0 
      }}
      transition={{ 
        duration: 0.5,
        x: { duration: 0.4, ease: "easeInOut" }
      }}
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
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <PinInput
                  ref={pinRef}
                  length={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading || isRateLimited}
                  error={!!error}
                  onComplete={() => handleSubmit(onSubmit)()}
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-2">
              The code will be verified automatically
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || isRateLimited || code.length < 6}
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
        </div>
      </form>

      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        <span>Having trouble? Contact support</span>
      </div>
    </motion.div>
  );
}
