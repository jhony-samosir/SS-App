"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import axios from "axios";

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-100 bg-card/40 animate-pulse rounded-[2.5rem]" />}>
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-6"
    >
      <div className="space-y-2 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary mb-1 block">
          Secure Access
        </span>
        <h1 className="text-4xl font-medium tracking-tight text-foreground font-heading italic">Welcome Back</h1>
        <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.2em]">
          Enter your credentials to access your portal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-center gap-3 text-destructive text-[10px] font-black"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <SoftInput
            {...register("email")}
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            className="py-3 bg-white/40 border-border/40 focus:bg-white transition-all duration-500"
          />

          <div className="space-y-1">
            <div className="flex items-center justify-end pr-1">
              <Link href="/forgot-password" title="Reset" className="text-[8px] text-muted-foreground/40 font-black hover:text-primary transition-colors uppercase tracking-[0.2em]">
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
              className="py-3 bg-white/40 border-border/40 focus:bg-white transition-all duration-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="soft"
          disabled={isLoading}
          className="w-full h-14 text-[10px] font-black uppercase tracking-[0.4em] group shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          {isLoading ? (
            <div className="flex items-center gap-2 relative z-10">
              <Loader2 className="animate-spin" size={14} />
              <span>Authenticating...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center justify-center">
              Sign In
              <ArrowRight size={14} className="ml-2 transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      {/* Social Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/20" />
        </div>
        <div className="relative flex justify-center text-[7px] uppercase tracking-[0.6em] font-black">
          <span className="bg-white dark:bg-slate-950 px-6 text-muted-foreground/30">
            Rapid Access
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full h-12 rounded-2xl gap-3 font-black text-[9px] uppercase tracking-[0.2em] border-border/30 hover:bg-muted/30 hover:border-primary/20 transition-all duration-500">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button variant="outline" className="w-full h-12 rounded-2xl gap-3 font-black text-[9px] uppercase tracking-[0.2em] border-border/30 hover:bg-muted/30 hover:border-primary/20 transition-all duration-500">
          <svg className="w-3.5 h-3.5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>

      <div className="text-center text-[8px] text-muted-foreground/40 font-black pt-2 uppercase tracking-[0.4em]">
        NO ACCOUNT?{" "}
        <Link 
          href="/register" 
          className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all duration-500"
        >
          CREATE ONE NOW
        </Link>
      </div>
    </motion.div>
  );
}
