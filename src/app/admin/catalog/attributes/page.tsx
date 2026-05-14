import { AttributesManagement } from "@/components/admin/catalog/AttributesManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attributes & Tags - Admin - SamStore",
  description: "Define global product characteristics and discovery labels.",
};

export default function AttributesPage() {
  return <AttributesManagement />;
}
