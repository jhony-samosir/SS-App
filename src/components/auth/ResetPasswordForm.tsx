"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth-service";
import axios from "axios";

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        setError("Invalid or missing reset token. Please request a new password reset.");
      }, 0);
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
        className="w-full text-center space-y-8"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] border border-primary/20 flex items-center justify-center mx-auto shadow-xl shadow-primary/5">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight font-sans">Password Updated!</h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Your password has been securely updated. <br /> Redirecting you to login...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full space-y-8"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-black tracking-tight font-sans text-foreground">New Password</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">Please enter your new strong password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-5">
          <SoftInput
            {...register("newPassword")}
            id="newPassword"
            type="password"
            label="New Password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.newPassword?.message}
          />

          <SoftInput
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            variant="soft"
            disabled={isLoading || !token}
            className="w-full py-7 text-sm font-black uppercase tracking-[0.2em] group shadow-2xl shadow-primary/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Updating...</span>
              </div>
            ) : (
              <>
                Update Password
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/login")}
            className="w-full h-12 rounded-2xl gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
