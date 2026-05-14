"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types/product";
import { Brand, Category } from "@/types/catalog";
import { Loader2, X, Image as ImageIcon, Tag, Hash, DollarSign } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { SoftSelect } from "@/components/ui/SoftSelect";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog-service";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  price: z.number().min(0, "Price must be positive"),
  image_url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  brand_id: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "out_of_stock"]),
  category_ids: z.array(z.string()),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  initialData?: Product | null;
  isLoading?: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: ProductFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "draft",
      price: 0,
      category_ids: []
    }
  });

  // Fetch Brands and Categories for dropdowns
  const { data: brandsData } = useQuery({
    queryKey: ["admin-brands-lookup"],
    queryFn: () => catalogService.getBrands({ limit: 100 }),
    enabled: isOpen
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories-lookup"],
    queryFn: () => catalogService.getCategories({ limit: 100 }),
    enabled: isOpen
  });

  const brands = brandsData?.data?.items || [];
  const categories = categoriesData?.data?.items || [];

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        price: initialData.price,
        image_url: initialData.image_url,
        description: initialData.description || "",
        brand_id: initialData.brand_id?.toString() || null,
        status: initialData.status as any,
        category_ids: initialData.categories?.map(c => c.id) || [],
      });
    } else {
      reset({
        name: "",
        slug: "",
        price: 0,
        image_url: "",
        description: "",
        brand_id: null,
        status: "draft",
        category_ids: [],
      });
    }
  }, [initialData, reset, isOpen]);

  const currentStatus = watch("status");
  const currentBrandId = watch("brand_id");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold font-heading">
              {initialData ? "Edit Product" : "Create New Product"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure global product visibility and pricing</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput
                id="prod-name"
                label="Product Name"
                placeholder="e.g. Galaxy S24 Ultra"
                {...register("name")}
                error={errors.name?.message}
              />

              <SoftInput
                id="prod-slug"
                label="Slug"
                placeholder="e.g. galaxy-s24-ultra"
                {...register("slug")}
                error={errors.slug?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput
                id="prod-price"
                label="Price"
                type="number"
                icon={DollarSign}
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
                error={errors.price?.message}
              />

              <SoftSelect
                id="prod-status"
                label="Status"
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "out_of_stock", label: "Out of Stock" },
                ]}
                value={currentStatus}
                onChange={(val) => setValue("status", val as any)}
                error={errors.status?.message}
              />
            </div>

            <SoftInput
              id="prod-image"
              label="Image URL"
              icon={ImageIcon}
              placeholder="https://example.com/image.jpg"
              {...register("image_url")}
              error={errors.image_url?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftSelect
                id="prod-brand"
                label="Brand"
                icon={<Tag size={16} />}
                options={[
                  { value: "", label: "No Brand" },
                  ...brands.map(b => ({ value: b.id.toString(), label: b.name }))
                ]}
                value={currentBrandId || ""}
                onChange={(val) => setValue("brand_id", val === "" ? null : val)}
                error={errors.brand_id?.message}
              />
              
              {/* Note: Multi-category selection is simplified here for standard SoftSelect */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Primary Category</label>
                <SoftSelect
                  id="prod-category"
                  label="Category"
                  icon={<Hash size={16} />}
                  options={[
                    { value: "", label: "No Category" },
                    ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
                  ]}
                  value={watch("category_ids")?.[0] || ""}
                  onChange={(val) => setValue("category_ids", val === "" ? [] : [val])}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Description</label>
              <textarea
                {...register("description")}
                className="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 text-sm min-h-[120px] focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                placeholder="Describe your product features and specifications..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border flex gap-3 bg-card sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold border border-border hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {initialData ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
