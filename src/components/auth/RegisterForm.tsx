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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md space-y-8 p-10 bg-card/95 rounded-[2.5rem] border border-border/50 shadow-xl"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-sans">Join SamStore</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          Create an account to explore the <br /> best local Indonesian snacks
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Registration form">
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

        <div className="space-y-5">
          <SoftInput
            {...register("fullName")}
            id="fullName"
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            error={errors.fullName?.message}
            aria-invalid={!!errors.fullName}
          />

          <SoftInput
            {...register("email")}
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            aria-invalid={!!errors.email}
          />

          <SoftInput
            {...register("password")}
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            aria-invalid={!!errors.password}
          />

          <SoftInput
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            aria-invalid={!!errors.confirmPassword}
          />
        </div>

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
              Create Account
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground font-medium pt-2">
        Already have an account?{" "}
        <Link 
          href="/login" 
          className="text-primary font-bold hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
