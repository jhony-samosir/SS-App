"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProductAttribute } from "@/types/catalog";
import { Loader2, X } from "lucide-react";
import { SoftInput } from "@/components/ui/SoftInput";
import { SoftSelect } from "@/components/ui/SoftSelect";
import { useEffect } from "react";

const attributeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  input_type: z.enum(["text", "select", "multiselect", "boolean", "number"]),
  is_variant: z.boolean(),
  sort_order: z.number(),
});

type AttributeFormValues = z.infer<typeof attributeSchema>;

interface AttributeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AttributeFormValues) => void;
  initialData?: ProductAttribute | null;
  isLoading?: boolean;
}

const inputTypeOptions = [
  { value: "text", label: "Text" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "boolean", label: "Boolean (Yes/No)" },
  { value: "number", label: "Number" },
];

export function AttributeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: AttributeFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      is_variant: false,
      sort_order: 0,
      input_type: "text"
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentInputType = watch("input_type");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        input_type: initialData.input_type,
        is_variant: initialData.is_variant,
        sort_order: initialData.sort_order,
      });
    } else {
      reset({
        name: "",
        code: "",
        input_type: "text",
        is_variant: false,
        sort_order: 0,
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
            {initialData ? "Edit Attribute" : "Add New Attribute"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SoftInput
              id="attr-name"
              label="Attribute Name"
              placeholder="e.g. Color"
              {...register("name")}
              error={errors.name?.message}
            />

            <SoftInput
              id="attr-code"
              label="Code"
              placeholder="e.g. color"
              {...register("code")}
              error={errors.code?.message}
            />
          </div>

          <SoftSelect
            id="attr-input-type"
            label="Input Type"
            options={inputTypeOptions}
            value={currentInputType}
            onChange={(val) => setValue("input_type", val as AttributeFormValues["input_type"])}
            error={errors.input_type?.message}
          />

          <SoftInput
            id="attr-sort-order"
            label="Sort Order"
            type="number"
            {...register("sort_order", { valueAsNumber: true })}
            error={errors.sort_order?.message}
          />

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="is_variant"
              {...register("is_variant")}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="is_variant" className="text-sm font-medium">
              Enable for Product Variants
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
              {initialData ? "Update Attribute" : "Create Attribute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
