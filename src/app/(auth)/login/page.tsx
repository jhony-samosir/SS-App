import { LoginForm } from "@/components/auth/LoginForm";
import { GuestGuard } from "@/components/auth/GuestGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - SamStore",
  description: "Sign in to your SamStore account to start shopping local snacks.",
};

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
