"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth-service";
import { cn } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      let message = "Registration failed. Please try again.";
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-border/50 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-sans">Account Created!</h2>
          <p className="text-muted-foreground font-medium">
            Your journey to authentic snacks starts now. <br /> Redirecting to login...
          </p>
        </div>
        <div className="pt-4">
          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-4"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Create Account</h1>
        <p className="text-muted-foreground text-[11px] font-medium">
          Start your premium snack journey today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" aria-label="Registration form">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2.5 bg-destructive/5 border border-destructive/10 rounded-xl flex items-center gap-2.5 text-destructive text-[10px] font-black"
            role="alert"
          >
            <AlertCircle size={14} />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-3">
          <SoftInput
            {...register("fullName")}
            id="fullName"
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            error={errors.fullName?.message}
            className="py-2.5"
          />

          <SoftInput
            {...register("email")}
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            className="py-2.5"
          />

          <div className="grid grid-cols-2 gap-3">
            <SoftInput
              {...register("password")}
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              className="py-2.5"
            />

            <SoftInput
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              label="Confirm"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              className="py-2.5"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="soft"
          disabled={isLoading}
          className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] group shadow-xl shadow-primary/10"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              <span>Creating...</span>
            </div>
          ) : (
            <>
              Register Account
              <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-[9px] text-muted-foreground/50 font-black pt-1">
        ALREADY HAVE AN ACCOUNT?{" "}
        <Link 
          href="/login" 
          className="text-primary hover:underline underline-offset-2 transition-all"
        >
          SIGN IN HERE
        </Link>
      </div>
    </motion.div>
  );
}
