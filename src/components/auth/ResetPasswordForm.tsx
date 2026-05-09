"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth-service";
import { cn } from "@/lib/utils";
import axios from "axios";

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.push('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      let message = "Failed to reset password. The link might be expired.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Password Reset Successful!</h1>
          <p className="text-muted-foreground text-sm">
            Your password has been securely updated. Redirecting you to the login page...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 p-8 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Create New Password</h1>
        <p className="text-muted-foreground">Please enter your new strong password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm"
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium pl-1" htmlFor="newPassword">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                {...register("newPassword")}
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className={cn(
                  "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none ring-primary/10 focus:ring-4",
                  errors.newPassword && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.newPassword && <p className="text-xs text-destructive pl-1">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium pl-1" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={cn(
                  "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none ring-primary/10 focus:ring-4",
                  errors.confirmPassword && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive pl-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Reset Password
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-4"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </form>
    </motion.div>
  );
}
