import { AccessDenied } from "@/components/auth/AccessDenied";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied - SamStore",
  description: "You do not have permission to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto py-20">
      <AccessDenied />
    </div>
  );
}
