import { WarehousesManagement } from "@/components/admin/catalog/WarehousesManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warehouse Management - Admin - SamStore",
  description: "Manage physical distribution centers and logistics nodes.",
};

export default function WarehousesPage() {
  return <WarehousesManagement />;
}
