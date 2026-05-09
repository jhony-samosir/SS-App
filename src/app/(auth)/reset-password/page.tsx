import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password - SamStore",
  description: "Create a new password for your SamStore account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-md h-[400px] bg-card/50 backdrop-blur-xl rounded-3xl animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
