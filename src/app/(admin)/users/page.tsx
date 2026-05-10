import { UsersManagement } from "@/components/admin/UsersManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management - Admin - SamStore",
  description: "Monitor and manage system users.",
};

export default function UsersPage() {
  return <UsersManagement />;
}
