"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCcw, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReviewList } from "@/components/catalog/ReviewList";
import { BundleCard } from "@/components/catalog/BundleCard";
import { useCartStore, AuthRequiredError } from "@/store/use-cart-store";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => catalogService.getProductById(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => catalogService.getReviews(id),
    enabled: !!id,
  });

  const { data: ratingSummary } = useQuery({
    queryKey: ["rating-summary", id],
    queryFn: () => catalogService.getRatingSummary(id),
    enabled: !!id,
  });

  const { addItem } = useCartStore();
  const { isAuthenticated, isHydrated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleAddToCart = async () => {
    if (!isHydrated || !isAuthenticated) {
      toast.info("Please log in to add items to your cart.", {
        action: {
          label: "Log In",
          onClick: () => router.push(`/login?redirect=${encodeURIComponent(pathname)}`),
        },
      });
      return;
    }

    if (!product) return;
    setIsAdding(true);
    try {
      await addItem({
        productId: 0,
        productPublicId: product.id,
        productName: product.name,
        unitPrice: product.price || 25000,
        quantity: 1,
        imageUrl: product.image_url || undefined,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (productLoading) {
    return (
      <div className="pt-32 max-w-7xl mx-auto px-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="aspect-square bg-muted rounded-[3rem]" />
          <div className="space-y-8">
            <div className="h-10 bg-muted rounded-xl w-3/4" />
            <div className="h-6 bg-muted rounded-xl w-1/2" />
            <div className="h-32 bg-muted rounded-3xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
           <span>Home</span>
           <ChevronRight size={12} />
           <span>Shop</span>
           <ChevronRight size={12} />
           <span className="text-primary">{product?.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          {/* Product Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[3.5rem] bg-muted/30 border border-border/50 overflow-hidden relative group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/10">
                <Package size={120} />
              </div>
              <div className="absolute top-8 left-8 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Top Rated
              </div>
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted/20 border border-border/20 cursor-pointer hover:border-primary/50 transition-all" />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">In Stock</span>
                <div className="flex items-center gap-1 text-secondary">
                  <Star size={14} className="fill-secondary" />
                  <span className="text-sm font-bold text-foreground">
                    {ratingSummary?.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({ratingSummary?.total_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-4">{product?.name}</h1>
              <p className="text-3xl font-bold text-primary mb-8">Rp 25.000</p>
              <p className="text-muted-foreground leading-relaxed text-lg mb-10">
                A perfect blend of tradition and taste. Our {product?.name} is crafted using locally sourced ingredients, bringing the authentic flavors of the islands to your doorstep.
              </p>
            </div>

            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-4 p-6 bg-muted/20 rounded-3xl border border-border/40">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rich Flavor Profile</h4>
                  <p className="text-xs text-muted-foreground">Artisanally crafted with premium spices.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-[3] py-5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={22} />
                    Add to Cart
                  </>
                )}
              </button>
              <button className="flex-1 py-5 bg-card border border-border/50 text-muted-foreground hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all group">
                <Heart size={22} className="group-hover:fill-rose-500" />
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-border/50">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Certified Safe</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCcw size={20} className="text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bundles Section */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Bought Together</h2>
            <p className="text-primary font-bold text-sm cursor-pointer hover:underline">View All Bundles</p>
          </div>
          <BundleCard 
             id={1}
             name="Weekend Snacker Kit"
             description="A selection of our best-selling spicy and savory chips for your perfect weekend."
             originalPrice={120000}
             bundlePrice={95000}
             items={[
               { id: 1, name: "Spicy Cassava", quantity: 2, imageUrl: "" },
               { id: 2, name: "Prawn Crackers", quantity: 1, imageUrl: "" },
               { id: 3, name: "Astor Rolls", quantity: 1, imageUrl: "" },
             ]}
          />
        </div>

        {/* Reviews Section */}
        <div className="mb-32 pt-32 border-t border-border/50">
          <ReviewList 
            productId={id}
            reviews={reviewsData?.data?.items || []}
            summary={{
              averageRating: ratingSummary?.average_rating || 0,
              totalReviews: ratingSummary?.total_reviews || 0,
              distribution: { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 } // Mock distribution
            }}
          />
        </div>
      </div>
    </div>
  );
}
