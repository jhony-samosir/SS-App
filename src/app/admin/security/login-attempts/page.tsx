import { LoginAttemptsAudit } from "@/components/admin/LoginAttemptsAudit";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Audit | Security | SamStore Admin",
  description: "Monitor and investigate authentication attempts and security events.",
};

export default function LoginAttemptsPage() {
  return <LoginAttemptsAudit />;
}
