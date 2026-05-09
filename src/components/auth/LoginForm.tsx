"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth, setMfaChallenge } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);

      if (response.isMfaRequired && response.mfaToken) {
        setMfaChallenge(response.mfaToken);
        router.push("/mfa");
      } else if (response.user) {
        setAuth(response.user);
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      let message = "Invalid email or password. Please try again.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 p-8 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-heading">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
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

        <div className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
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
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button 
          onClick={() => router.push("/register")} 
          className="text-primary font-bold hover:underline"
        >
          Create an account
        </button>
      </div>
    </motion.div>
  );
}
