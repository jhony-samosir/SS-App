import { RolesManagement } from "@/components/admin/RolesManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Management - Admin - SamStore",
  description: "Manage system roles and permissions.",
};

export default function RolesPage() {
  return <RolesManagement />;
}
