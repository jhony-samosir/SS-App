"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Warehouse } from "@/types/catalog";
import { Loader2, X } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { useEffect } from "react";

const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().optional(),
  country_code: z.string().length(2, "Country code must be 2 characters (e.g. ID)"),
  postal_code: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => void;
  initialData?: Warehouse | null;
  isLoading?: boolean;
}

export function WarehouseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: WarehouseFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      is_active: true,
      country_code: "ID"
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        city: initialData.city,
        province: initialData.province || "",
        country_code: initialData.country_code || "ID",
        postal_code: initialData.postal_code || "",
        address: initialData.address || "",
        is_active: initialData.is_active,
      });
    } else {
      reset({
        name: "",
        code: "",
        city: "",
        province: "",
        country_code: "ID",
        postal_code: "",
        address: "",
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
            {initialData ? "Edit Warehouse" : "Add New Warehouse"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SoftInput
              id="wh-name"
              label="Warehouse Name"
              placeholder="e.g. Jakarta Hub"
              {...register("name")}
              error={errors.name?.message}
            />

            <SoftInput
              id="wh-code"
              label="Code"
              placeholder="e.g. WH-JKT-01"
              {...register("code")}
              error={errors.code?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SoftInput
              id="wh-city"
              label="City"
              placeholder="e.g. Jakarta"
              {...register("city")}
              error={errors.city?.message}
            />
            <SoftInput
              id="wh-province"
              label="Province"
              placeholder="e.g. DKI Jakarta"
              {...register("province")}
              error={errors.province?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SoftInput
              id="wh-country"
              label="Country Code"
              placeholder="e.g. ID"
              {...register("country_code")}
              error={errors.country_code?.message}
            />
            <SoftInput
              id="wh-postal"
              label="Postal Code"
              placeholder="e.g. 12345"
              {...register("postal_code")}
              error={errors.postal_code?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground ml-1">Full Address</label>
            <textarea
              {...register("address")}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm resize-none h-24"
              placeholder="Enter complete warehouse address..."
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
              {initialData ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
