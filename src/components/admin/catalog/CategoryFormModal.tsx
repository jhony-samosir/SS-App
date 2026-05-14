"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category } from "@/types/catalog";
import { Loader2, X } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { useEffect } from "react";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  icon_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  parent_id: z.number().optional().nullable(),
  sort_order: z.number(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  initialData?: Category | null;
  isLoading?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      is_active: true,
      sort_order: 0
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        icon_url: initialData.icon_url || "",
        description: initialData.description || "",
        parent_id: initialData.parent_id,
        sort_order: initialData.sort_order,
        is_active: initialData.is_active,
      });
    } else {
      reset({
        name: "",
        slug: "",
        icon_url: "",
        description: "",
        parent_id: null,
        sort_order: 0,
        is_active: true,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading">
            {initialData ? "Edit Category" : "Add New Category"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <SoftInput
            id="cat-name"
            label="Category Name"
            placeholder="e.g. Electronics"
            {...register("name")}
            error={errors.name?.message}
          />

          <SoftInput
            id="cat-slug"
            label="Slug"
            placeholder="e.g. electronics"
            {...register("slug")}
            error={errors.slug?.message}
          />

          <SoftInput
            id="cat-icon"
            label="Icon URL"
            placeholder="https://example.com/icon.png"
            {...register("icon_url")}
            error={errors.icon_url?.message}
          />

          <div className="grid grid-cols-2 gap-4">
             <SoftInput
              id="cat-sort-order"
              label="Sort Order"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              error={errors.sort_order?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground ml-1">Description</label>
            <textarea
              {...register("description")}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none h-24"
              placeholder="Describe this category..."
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Mark as Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold border border-border hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
