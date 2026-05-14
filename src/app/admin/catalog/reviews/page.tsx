import { ReviewsManagement } from "@/components/admin/catalog/ReviewsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Moderation | Admin Console",
  description: "Manage customer feedback and maintain quality standards",
};

export default function AdminReviewsPage() {
  return <ReviewsManagement />;
}
