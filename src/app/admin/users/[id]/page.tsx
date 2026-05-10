import { UserDetailView } from "@/components/admin/UserDetailView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Details - Admin - SamStore",
  description: "View detailed user profile information.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <UserDetailView publicId={id} />;
}
