"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth-service";

const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

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
      console.error("Forgot password API error:", err);
    } finally {
      setIsLoading(false);
      setIsSuccess(true);
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
          <h1 className="text-3xl font-black tracking-tight font-sans">Check your email</h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            If an account exists for that email, we have sent <br /> password reset instructions.
          </p>
        </div>
        <Button
          onClick={() => router.push("/login")}
          variant="outline"
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]"
        >
          Return to Login
        </Button>
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
        <h1 className="text-4xl font-black tracking-tight font-sans text-foreground">Reset Password</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">Enter your email and we&apos;ll send a link to reset your password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <SoftInput
          {...register("email")}
          id="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          icon={Mail}
          error={errors.email?.message}
        />

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
                <span>Sending...</span>
              </div>
            ) : (
              <>
                Send Reset Link
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
