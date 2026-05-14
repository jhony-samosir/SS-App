import { BundlesManagement } from "@/components/admin/catalog/BundlesManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Bundles | Admin Console",
  description: "Manage product packages and curated sets",
};

export default function AdminBundlesPage() {
  return <BundlesManagement />;
}
