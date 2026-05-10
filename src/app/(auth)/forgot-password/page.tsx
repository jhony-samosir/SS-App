import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - SamStore",
  description: "Reset your SamStore account password.",
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm />
  );
}
