import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - SamStore",
  description: "SamStore Administrative Control Center",
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
