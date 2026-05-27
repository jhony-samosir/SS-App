import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Email - SamStore",
  description: "Verify your email address to activate your SamStore account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md h-100 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
