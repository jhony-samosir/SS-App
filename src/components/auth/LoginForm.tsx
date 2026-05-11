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
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Suspense } from "react";

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-[400px] bg-card/40 animate-pulse rounded-[2.5rem]" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth, setAccessToken, setMfaChallenge } = useAuth();
  const { handlePostLoginRedirect } = useAuthRedirect();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Attempt login
      const response = await authService.login(data);
      
      // Capture token from response (could be accessToken or access_token)
      const token = response.accessToken || response.access_token;

      // 2. Handle MFA requirement
      if (response.isMfaRequired && response.mfaToken) {
        setMfaChallenge(response.mfaToken);
        router.push("/mfa");
        return;
      }

      // 3. Fetch User Profile & Apply Role-Based Routing
      if (token) {
        // We set the token in memory first so the Axios Interceptor can attach it
        setAccessToken(token);
        
        try {
          // Hit the /api/user/me endpoint via Gateway
          const userResponse = await authService.getCurrentUser();
          if (userResponse?.user) {
            // Hydrate store with user profile and token
            setAuth(userResponse.user, token);
            // Route based on role
            handlePostLoginRedirect(userResponse.user);
            return;
          }
        } catch (fetchErr) {
          console.error("Failed to fetch user profile after successful login:", fetchErr);
        }
      }

      setError("Authentication successful, but could not retrieve user profile. Please try again.");
      
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md space-y-8 p-10 bg-card/95 rounded-[2.5rem] border border-border/50 shadow-xl"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-sans">Welcome Back</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          Enter your credentials to continue your <br /> snack journey
        </p>
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

        <div className="space-y-5">
          <SoftInput
            {...register("email")}
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-end pr-1">
              <Link href="/forgot-password" title="Reset your password" className="text-xs text-primary font-bold hover:underline underline-offset-4">
                Forgot password?
              </Link>
            </div>
            <SoftInput
              {...register("password")}
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="soft"
          disabled={isLoading}
          className="w-full py-7 text-base group"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              Sign In
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground font-medium pt-2">
        Don't have an account?{" "}
        <Link 
          href="/register" 
          className="text-primary font-bold hover:underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </motion.div>
  );
}
