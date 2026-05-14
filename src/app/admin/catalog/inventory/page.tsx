import { InventoryManagement } from "@/components/admin/catalog/InventoryManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Hub | Admin Console",
  description: "Real-time stock monitoring and warehouse logistics",
};

export default function AdminInventoryPage() {
  return <InventoryManagement />;
}
