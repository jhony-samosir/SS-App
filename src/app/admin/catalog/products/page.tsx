import { ProductsManagement } from "@/components/admin/catalog/ProductsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Catalog | Admin Console",
  description: "Global product management and inventory overview",
};

export default function AdminProductsPage() {
  return <ProductsManagement />;
}
