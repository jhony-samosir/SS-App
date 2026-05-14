"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Brand } from "@/types/catalog";
import { Loader2, X } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { useEffect } from "react";

const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BrandFormValues) => void;
  initialData?: Brand | null;
  isLoading?: boolean;
}

export function BrandFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: BrandFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      is_active: true
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        logo_url: initialData.logo_url || "",
        website_url: initialData.website_url || "",
        description: initialData.description || "",
        is_active: initialData.is_active,
      });
    } else {
      reset({
        name: "",
        slug: "",
        logo_url: "",
        website_url: "",
        description: "",
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
            {initialData ? "Edit Brand" : "Add New Brand"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <SoftInput
            id="brand-name"
            label="Brand Name"
            placeholder="e.g. Samsung"
            {...register("name")}
            error={errors.name?.message}
          />

          <SoftInput
            id="brand-slug"
            label="Slug"
            placeholder="e.g. samsung"
            {...register("slug")}
            error={errors.slug?.message}
          />

          <SoftInput
            id="brand-logo"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            {...register("logo_url")}
            error={errors.logo_url?.message}
          />

          <SoftInput
            id="brand-website"
            label="Website URL"
            placeholder="https://samsung.com"
            {...register("website_url")}
            error={errors.website_url?.message}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground ml-1">Description</label>
            <textarea
              {...register("description")}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none h-24"
              placeholder="Tell us about this brand..."
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
              {initialData ? "Update Brand" : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
