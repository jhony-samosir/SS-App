"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth-service";
import { cn } from "@/lib/utils";
import axios from "axios";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(data);
    } catch (err: unknown) {
      // Log silently. We must not reveal if an email exists or not (Anti-enumeration)
      console.error("Forgot password API error:", err);
    } finally {
      setIsLoading(false);
      // Always show success state regardless of the outcome
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-card/95 rounded-3xl border border-border shadow-xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            If an account exists for that email, we have sent password reset instructions.
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-muted/50 text-foreground hover:bg-muted py-3 rounded-2xl font-bold transition-all mt-4"
        >
          Return to Login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 p-8 bg-card/95 rounded-3xl border border-border shadow-xl"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Reset Password</h1>
        <p className="text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
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
          <label className="text-sm font-medium pl-1" htmlFor="email">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn(
                "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none ring-primary/10 focus:ring-4",
                errors.email && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
              )}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive pl-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Send Reset Link
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}
