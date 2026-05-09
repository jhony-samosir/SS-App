import { MfaSetupForm } from "@/components/auth/MfaSetupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Two-Step Verification - SamStore",
  description: "Secure your account by enabling two-step verification.",
};

export default function MfaSetupPage() {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-24">
      <MfaSetupForm />
    </div>
  );
}
