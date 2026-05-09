import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - SamStore",
  description: "Join SamStore to explore and buy the best local snacks.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
