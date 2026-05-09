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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
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
      await authService.register(data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Registration Successful!</h1>
          <p className="text-muted-foreground">Your account has been created. Redirecting to login...</p>
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
        <h1 className="text-3xl font-bold tracking-tight font-heading">Create Account</h1>
        <p className="text-muted-foreground">Join SamStore to start exploring local snacks</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium pl-1" htmlFor="name">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                {...register("name")}
                id="name"
                placeholder="John Doe"
                className={cn(
                  "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none ring-primary/10 focus:ring-4",
                  errors.name && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.name && <p className="text-xs text-destructive pl-1">{errors.name.message}</p>}
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium pl-1" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-muted/50 border border-transparent focus:border-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none ring-primary/10 focus:ring-4",
                    errors.password && "border-destructive/50 ring-destructive/10 focus:ring-destructive/10"
                  )}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive pl-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium pl-1" htmlFor="confirmPassword">Confirm</label>
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button 
          onClick={() => router.push("/login")} 
          className="text-primary font-bold hover:underline"
        >
          Sign In
        </button>
      </div>
    </motion.div>
  );
}
