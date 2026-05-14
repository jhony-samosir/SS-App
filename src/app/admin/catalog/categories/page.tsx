import { CategoriesManagement } from "@/components/admin/catalog/CategoriesManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category Management - Admin - SamStore",
  description: "Manage product categorization and SEO taxonomy.",
};

export default function CategoriesPage() {
  return <CategoriesManagement />;
}
