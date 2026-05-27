"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { PinInput, type PinInputHandle } from "./PinInput";
import { Button } from "@/components/ui/button";
import axios from "axios";

const mfaSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type MfaFormValues = z.infer<typeof mfaSchema>;

export function MfaForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-100 bg-card/40 animate-pulse rounded-[2.5rem]" />}>
      <MfaContent />
    </Suspense>
  );
}

function MfaContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pinRef = useRef<PinInputHandle>(null);

  const { mfaToken, isMfaRequired, setAuth, clearMfaChallenge, isHydrated } = useAuth();
  const { handlePostLoginRedirect } = useAuthRedirect();

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (isHydrated && (!isMfaRequired || !mfaToken)) {
      router.replace("/login");
    }
  }, [isHydrated, isMfaRequired, mfaToken, router]);

  const onSubmit = async (data: MfaFormValues) => {
    if (!mfaToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyMfa({
        mfaToken,
        code: data.code,
      });

      // Capture token from response
      const token = response.access_token || response.accessToken;

      if (response.user) {
        setAuth(response.user, token);
        handlePostLoginRedirect(response.user);
      } else if (token) {
        // Fallback for JWT strategies where user is missing in body
        setAuth({ id: "", name: "", email: "", roleName: "", permissions: [] }, token);
        try {
          const userResponse = await authService.getCurrentUser();
          if (userResponse?.user) {
            setAuth(userResponse.user, token);
            handlePostLoginRedirect(userResponse.user);
            return;
          }
        } catch (fetchErr) {
          console.error("Failed to fetch user profile after MFA:", fetchErr);
        }
      }
    } catch (err: unknown) {
      let message = "Invalid verification code. Please try again.";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }

      setError(message);
      setValue("code", "");
      
      requestAnimationFrame(() => {
        pinRef.current?.focus();
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full space-y-8"
    >
      <div className="space-y-3 text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/5">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight font-sans text-foreground">Verify Login</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          Please enter the 6-digit code from your <br /> authenticator app
        </p>
      </div>

      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" aria-label="MFA verification form">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium"
            role="alert"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <motion.div
                animate={{ x: error ? [0, -10, 10, -10, 10, 0] : 0 }}
                transition={{ duration: 0.4 }}
              >
                <PinInput
                  ref={pinRef}
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={() => handleSubmit(onSubmit)()}
                  disabled={isLoading}
                  error={!!error}
                />
              </motion.div>
            )}
          />
          <p className="text-center text-[11px] text-muted-foreground font-medium uppercase tracking-widest pt-2">
            Having trouble? <button type="button" className="text-primary font-black hover:underline underline-offset-4">Use recovery code</button>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            variant="soft"
            disabled={isLoading}
            className="w-full py-7 text-sm font-black uppercase tracking-[0.2em] group shadow-2xl shadow-primary/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                Verify Identity
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              clearMfaChallenge();
              router.push("/login");
            }}
            className="w-full h-12 rounded-2xl gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Cancel and Return
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
