import { BrandsManagement } from "@/components/admin/catalog/BrandsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Management - Admin - SamStore",
  description: "Manage product brands and vendor identities.",
};

export default function BrandsPage() {
  return <BrandsManagement />;
}
