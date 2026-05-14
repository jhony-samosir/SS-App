"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag } from "@/types/catalog";
import { Loader2, X } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { useEffect } from "react";

const tagSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TagFormValues) => void;
  initialData?: Tag | null;
  isLoading?: boolean;
}

export function TagFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: TagFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: ""
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
      });
    } else {
      reset({
        name: "",
        slug: "",
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading">
            {initialData ? "Edit Tag" : "Create New Tag"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <SoftInput
            id="tag-name"
            label="Tag Name"
            placeholder="e.g. Organic"
            {...register("name")}
            error={errors.name?.message}
          />

          <SoftInput
            id="tag-slug"
            label="Slug"
            placeholder="e.g. organic"
            {...register("slug")}
            error={errors.slug?.message}
          />

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
              {initialData ? "Update Tag" : "Create Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
