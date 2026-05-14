"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  MessageSquare,
  User,
  ExternalLink,
  Loader2,
  Trash2
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { ProductReview } from "@/types/product";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReviewsManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Queries
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ["admin-reviews", page, limit],
    queryFn: () => catalogService.getAllReviews({ page, limit }),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ProductReview["Status"] }) => 
      catalogService.updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(`Review ${variables.status} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update review status");
    }
  });

  const reviews = (reviewData?.data?.items as ProductReview[]) || [];
  const totalCount = reviewData?.data?.total_count || 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={12} 
            className={cn(
              s <= rating ? "fill-amber-400 text-amber-400" : "text-muted border-muted"
            )} 
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: "Reviewer",
      render: (rev: ProductReview) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{rev.UserName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">User ID: {rev.UserID.slice(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      header: "Review Details",
      className: "max-w-[300px]",
      render: (rev: ProductReview) => (
        <div className="flex flex-col gap-1 py-1">
          {renderStars(rev.Rating)}
          <p className="text-sm text-foreground line-clamp-2 italic">"{rev.Comment}"</p>
          <span className="text-[10px] text-muted-foreground">Product ID: {rev.ProductID}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (rev: ProductReview) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          rev.Status === "approved" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
            : rev.Status === "rejected"
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-amber-50 text-amber-600 border-amber-200"
        )}>
          {rev.Status === "approved" && <CheckCircle2 size={12} />}
          {rev.Status === "rejected" && <XCircle size={12} />}
          {rev.Status === "pending" && <Clock size={12} />}
          {rev.Status}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (rev: ProductReview) => (
        <div className="flex justify-end gap-2">
          {rev.Status !== "approved" && (
            <button 
              onClick={() => updateStatusMutation.mutate({ id: rev.ID.toString(), status: "approved" })}
              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all"
              title="Approve Review"
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 size={18} />
            </button>
          )}
          {rev.Status !== "rejected" && (
            <button 
              onClick={() => updateStatusMutation.mutate({ id: rev.ID.toString(), status: "rejected" })}
              className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
              title="Reject Review"
              disabled={updateStatusMutation.isPending}
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Review Moderation</h1>
          <p className="text-muted-foreground mt-1">Manage customer feedback and maintain quality standards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
        </div>

        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              {reviews.filter((r: any) => r.Status === "pending").length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search by username or comment..."
              className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          pageSize={limit}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
