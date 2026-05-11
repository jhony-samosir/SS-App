import { MenusManagement } from "@/components/admin/MenusManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Management - Admin - SamStore",
  description: "Define and organize application navigation menus.",
};

export default function MenusPage() {
  return <MenusManagement />;
}
