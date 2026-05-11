import { PermissionsManagement } from "@/components/admin/PermissionsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permission Registry - Admin - SamStore",
  description: "View and manage system permissions.",
};

export default function PermissionsPage() {
  return <PermissionsManagement />;
}
