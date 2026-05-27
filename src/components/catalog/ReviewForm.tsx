"use client";

import React, { useState } from "react";
import { Star, Send, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onClose: () => void;
}

export function ReviewForm({ productId, onSubmit, onClose }: Readonly<ReviewFormProps>) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Write a Review</h3>
        <p className="text-muted-foreground text-sm">How was your experience with this product?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95 outline-none"
              >
                <Star
                  size={40}
                  className={cn(
                    "transition-colors",
                    star <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/20"
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary h-4">
            {rating === 5 && "Excellent!"}
            {rating === 4 && "Good"}
            {rating === 3 && "Average"}
            {rating === 2 && "Poor"}
            {rating === 1 && "Terrible"}
          </span>
        </div>

        {/* Comment Input */}
        <div className="space-y-2">
          <label htmlFor="review-comment" className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-2">Your Experience</label>
          <div className="relative">
            <textarea
              id="review-comment"
              aria-label="Your experience"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the taste?"
              className="w-full bg-muted/50 border border-border/50 focus:border-primary/20 rounded-[1.5rem] p-6 text-sm focus:ring-8 focus:ring-primary/5 transition-all outline-none min-h-40 resize-none"
              disabled={isSubmitting}
            />
            <div className="absolute bottom-4 right-6 text-[10px] font-bold text-muted-foreground uppercase">
              {comment.length} / 1000
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-destructive text-xs font-bold bg-destructive/10 p-3 rounded-xl border border-destructive/20"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-muted text-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
