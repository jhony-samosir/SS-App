"use client";

import { useState, useEffect, useRef } from "react";
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
import { Suspense } from "react";

const mfaSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type MfaFormValues = z.infer<typeof mfaSchema>;

export function MfaForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[400px] bg-card/40 animate-pulse rounded-[2.5rem]" />}>
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
    formState: { errors },
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
      const token = (response as any).access_token || (response as any).accessToken;

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
      className="w-full max-w-md space-y-8 p-10 bg-card/95 rounded-[2.5rem] border border-border/50 shadow-xl"
    >
      <div className="space-y-3 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-sans">Verification Required</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          Please enter the 6-digit code from your <br /> authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-label="MFA verification form">
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
          <p className="text-center text-xs text-muted-foreground font-medium">
            Having trouble? <button type="button" className="text-primary font-bold hover:underline">Use recovery code</button>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            variant="soft"
            disabled={isLoading}
            className="w-full py-7 text-base group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Verify & Continue
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
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
            className="w-full py-6 rounded-2xl font-bold text-muted-foreground hover:text-foreground"
          >
            Cancel and Return
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
