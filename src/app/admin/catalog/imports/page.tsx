import { ImportManagement } from "@/components/admin/catalog/ImportManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Imports | Admin Console",
  description: "Bulk data management and synchronization logs",
};

export default function AdminImportsPage() {
  return <ImportManagement />;
}
