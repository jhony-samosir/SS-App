import { MfaForm } from "@/components/auth/MfaForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-Step Verification - SamStore",
  description: "Secure your account with two-step verification.",
};

export default function MfaPage() {
  return (
    <AuthLayout>
      <MfaForm />
    </AuthLayout>
  );
}
