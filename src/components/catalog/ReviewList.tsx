"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, CheckCircle2, MoreVertical, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReviewForm } from "./ReviewForm";
import { catalogService } from "@/services/catalog-service";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
}

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  summary: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  };
}

export function ReviewList({ productId, reviews, summary }: ReviewListProps) {
  const [filter, setFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      await catalogService.submitReview({
        product_id: productId,
        rating: data.rating,
        comment: data.comment,
        user_name: "Guest User", // In real app, get from auth store
      });
      toast.success("Review submitted successfully! It will appear after moderation.");
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
      throw error;
    }
  };

  const filteredReviews = filter 
    ? reviews.filter(r => r.rating === filter)
    : reviews;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Summary Section */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-6xl font-bold leading-none tracking-tighter">
              {summary.averageRating.toFixed(1)}
            </span>
            <div className="pb-1">
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={cn(
                      s <= Math.round(summary.averageRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Based on {summary.totalReviews} reviews
              </p>
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              
              return (
                <button
                  key={star}
                  onClick={() => setFilter(filter === star ? null : star)}
                  className={cn(
                    "w-full flex items-center gap-4 group transition-opacity",
                    filter && filter !== star ? "opacity-40" : "opacity-100"
                  )}
                >
                  <span className="text-xs font-bold w-4">{star}</span>
                  <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium w-8 text-right">
                    {Math.round(percentage)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            Write a Review
          </h4>
          <p className="text-sm text-muted-foreground mb-6">
            Share your experience with this product and help others make a better choice.
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            Post Review
          </button>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border/50 rounded-[3rem] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <ReviewForm 
                productId={productId} 
                onSubmit={handleReviewSubmit}
                onClose={() => setShowForm(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Top Reviews</h3>
            {filter && (
              <button 
                onClick={() => setFilter(null)}
                className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                Clear Filter ({filter} Stars)
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort by: <span className="font-bold text-foreground cursor-pointer flex items-center gap-1">Newest <ChevronDown size={14} /></span>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-border">
            <p className="text-muted-foreground">No reviews found for this selection.</p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-[2rem] p-8 border border-border/40 hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-none mb-1.5">{review.userName}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={cn(
                              s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                    <CheckCircle2 size={10} />
                    Verified Purchase
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {review.comment}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Helpful?</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                      <ThumbsUp size={14} className="text-muted-foreground" />
                      {review.helpfulCount || 0}
                    </button>
                    <button className="p-1.5 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                      <ThumbsDown size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function ChevronDown({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
