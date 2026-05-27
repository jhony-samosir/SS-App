"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { useMutation } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  Smartphone,
  Key,
  ShieldAlert
} from "lucide-react";
import { authService } from "@/services/auth-service";
import { PinInput, type PinInputHandle } from "./PinInput";
import { MfaSetupResponse } from "@/types/auth";
import axios from "axios";

const mfaEnableSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type MfaEnableValues = z.infer<typeof mfaEnableSchema>;

export function MfaSetupForm() {
  const [step, setStep] = useState<"intro" | "setup" | "success">("intro");
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pinRef = useRef<PinInputHandle>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<MfaEnableValues>({
    resolver: zodResolver(mfaEnableSchema),
    defaultValues: {
      code: "",
    },
  });

  const verificationCode = watch("code");

  // Mutation for MFA Setup (Initiation)
  const setupMutation = useMutation({
    mutationFn: () => authService.mfaSetup(),
    onSuccess: (data) => {
      setSetupData(data);
      setStep("setup");
    },
    onError: (err: unknown) => {
      let message = "Failed to initialize MFA setup.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    }
  });

  // Mutation for MFA Enable (Verification)
  const enableMutation = useMutation({
    mutationFn: (code: string) => authService.mfaEnable({ code }),
    onSuccess: () => {
      setStep("success");
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    },
    onError: (err: unknown) => {
      let message = "Invalid verification code.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
      setValue("code", "");
      setTimeout(() => pinRef.current?.focus(), 100);
    }
  });

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnableMfa = (data: MfaEnableValues) => {
    enableMutation.mutate(data.code);
  };

  if (step === "intro") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto p-12 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl text-center space-y-8"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Enable Two-Step Verification</h1>
          <p className="text-muted-foreground leading-relaxed">
            Protect your account with an extra layer of security. After enabling, you'll need to enter a code from your authenticator app each time you sign in.
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm text-left">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={() => setupMutation.mutate()}
          disabled={setupMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {setupMutation.isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Get Started
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.div>
    );
  }

  if (step === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center space-y-6 p-12 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-heading">Security Enhanced!</h2>
          <p className="text-muted-foreground">
            Two-Step Verification is now active on your account.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} />
          <span>Redirecting to profile...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Setup Authenticator</h1>
        <p className="text-muted-foreground">Follow these steps to link your authenticator app</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Step 1: Scan QR */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold">Scan QR Code</h2>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-white">
              {setupData?.provisioningUri && (
                <QRCodeCanvas 
                  value={setupData.provisioningUri} 
                  size={180}
                  level="H"
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone size={16} />
              <span>Google Authenticator / Authy</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Manual Secret</p>
              <ShieldAlert size={14} className="text-amber-500" />
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-2xl group border border-transparent hover:border-primary/20 transition-all">
              <Key size={16} className="text-muted-foreground" />
              <code className="grow text-xs font-mono truncate">{setupData?.secret}</code>
              <button 
                onClick={handleCopySecret}
                className="p-2 hover:bg-background rounded-xl transition-all"
                title="Copy secret"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Step 2: Verify Code */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl space-y-6 flex flex-col"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-bold">Verify Code</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter the 6-digit code displayed in your app to confirm the setup.
          </p>

          <form onSubmit={handleSubmit(handleEnableMfa)} className="grow flex flex-col justify-center space-y-8">
            <div className="flex flex-col items-center space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm">
                      <AlertCircle size={18} />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <PinInput 
                    ref={pinRef}
                    value={field.value}
                    onChange={field.onChange}
                    onComplete={() => handleSubmit(handleEnableMfa)()}
                    disabled={enableMutation.isPending}
                    error={!!error}
                  />
                )}
              />
            </div>

            <button
              type="submit"
              disabled={enableMutation.isPending || verificationCode.length < 6}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mt-auto"
            >
              {enableMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Complete Setup
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
