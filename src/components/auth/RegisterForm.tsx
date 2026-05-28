"use client";

import { authService } from "@/services/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SoftInput } from "@/components/ui/SoftInput";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
    acceptTos: z
      .boolean()
      .refine((val) => val === true, "You must accept the Terms of Service"),
    acceptPrivacyPolicy: z
      .boolean()
      .refine((val) => val === true, "You must accept the Privacy Policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        acceptTos: data.acceptTos,
        acceptPrivacyPolicy: data.acceptPrivacyPolicy,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      let message = "Registration failed. Please try again.";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        // default API message
        message = data?.message || message;

        // validation errors
        if (data?.errors) {
          message = Object.entries(data.errors)
            .map(([field, msgs]) => {
              return `${field}: ${(msgs as string[]).join(", ")}`;
            })
            .join("\n");
        }
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
            Your journey to authentic snacks starts now. <br /> Redirecting to
            login...
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
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-6"
    >
      <div className="space-y-2 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary mb-1 block">
          New Customer
        </span>
        <h1 className="text-4xl font-medium tracking-tight text-foreground font-heading italic">
          Create Account
        </h1>
        <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.2em]">
          Start your premium snack journey today
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label="Registration form"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-center gap-3 text-destructive text-[10px] font-black"
            role="alert"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <SoftInput
            {...register("fullName")}
            id="fullName"
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            error={errors.fullName?.message}
            className="py-3 bg-white/40 border-border/40 focus:bg-white transition-all duration-500"
          />

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

          <div className="grid grid-cols-2 gap-4">
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

            <SoftInput
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              label="Confirm"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              className="py-3 bg-white/40 border-border/40 focus:bg-white transition-all duration-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 px-1 pt-2">
            {/* TOS Checkbox */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    {...register("acceptTos")}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded-md border border-border/40 bg-white/40 peer-checked:bg-primary peer-checked:border-primary transition-all duration-500 shadow-sm group-hover:border-primary/50" />
                  <svg
                    className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-black leading-tight group-hover:text-muted-foreground transition-colors uppercase tracking-[0.15em]">
                  Accept{" "}
                  <Link
                    href="/tos"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    TOS
                  </Link>
                </span>
              </label>
              {errors.acceptTos && (
                <motion.p
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[7px] text-destructive font-black leading-none pl-7"
                >
                  {errors.acceptTos.message}
                </motion.p>
              )}
            </div>

            {/* Privacy Checkbox */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    {...register("acceptPrivacyPolicy")}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded-md border border-border/40 bg-white/40 peer-checked:bg-primary peer-checked:border-primary transition-all duration-500 shadow-sm group-hover:border-primary/50" />
                  <svg
                    className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-black leading-tight group-hover:text-muted-foreground transition-colors uppercase tracking-[0.15em]">
                  Accept{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Privacy
                  </Link>
                </span>
              </label>
              {errors.acceptPrivacyPolicy && (
                <motion.p
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[7px] text-destructive font-black leading-none pl-7"
                >
                  {errors.acceptPrivacyPolicy.message}
                </motion.p>
              )}
            </div>
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
              <span>Creating Account...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center justify-center">
              Register Account
              <ArrowRight
                size={14}
                className="ml-2 transition-transform duration-500 group-hover:translate-x-1"
              />
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-[8px] text-muted-foreground/40 font-black pt-2 uppercase tracking-[0.4em]">
        ALREADY HAVE AN ACCOUNT?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all duration-500"
        >
          SIGN IN HERE
        </Link>
      </div>
    </motion.div>
  );
}
