"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Loader2, 
  Globe, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { Brand } from "@/types/catalog";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BrandFormModal } from "./BrandFormModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

type BrandListCache = {
  data?: {
    items: Brand[];
    total_count: number;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
};

export function BrandsManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["admin-brands", page, limit],
    queryFn: () => catalogService.getBrands({ page, limit }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newBrand: Partial<Brand>) => catalogService.createBrand(newBrand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand created successfully");
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create brand"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Brand> }) => 
      catalogService.updateBrand(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ["admin-brands"] });
      const previousData = queryClient.getQueryData(["admin-brands", page, limit]);
      
      queryClient.setQueryData(["admin-brands", page, limit], (old: BrandListCache | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin-brands", page, limit], context?.previousData);
      toast.error("Failed to update brand");
    },
    onSuccess: () => {
      toast.success("Brand updated successfully");
      setIsModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteBrand(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-brands"] });
      const previousData = queryClient.getQueryData(["admin-brands", page, limit]);

      queryClient.setQueryData(["admin-brands", page, limit], (old: BrandListCache | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item) => item.id !== id),
            total_count: old.data.total_count - 1
          }
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["admin-brands", page, limit], context?.previousData);
      toast.error("Failed to delete brand");
    },
    onSuccess: () => {
      toast.success("Brand deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    }
  });

  const handleFormSubmit = (values: Partial<Brand>) => {
    if (selectedBrand) {
      updateMutation.mutate({ id: selectedBrand.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const brands = data?.data?.items || [];
  const totalCount = data?.data?.total_count || 0;

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(search.toLowerCase()) ||
    brand.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Brand",
      render: (brand: Brand) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center border border-secondary/20 overflow-hidden">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
            ) : (
              <Tag size={20} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate-max" title={brand.name}>{brand.name}</span>
            <span className="text-xs text-dimmed truncate-max" title={brand.slug}>{brand.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Website",
      render: (brand: Brand) => (
        brand.website_url ? (
          <a 
            href={brand.website_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
          >
            <Globe size={14} />
            Visit Site
          </a>
        ) : (
          <span className="text-xs text-muted-foreground italic">None</span>
        )
      ),
    },
    {
      header: "Status",
      render: (brand: Brand) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          brand.is_active 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        )}>
          {brand.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {brand.is_active ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (brand: Brand) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedBrand(brand);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
            title="Edit Brand"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              setBrandToDelete(brand);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
            title="Delete Brand"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Brands Management</h1>
          <p className="text-muted-foreground">Manage product brands and vendor identities</p>
        </div>

        <button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add New Brand
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="filter-bar">
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          
          {(isLoading || updateMutation.isPending || deleteMutation.isPending) && (
            <Loader2 className="animate-spin text-primary ml-auto" size={20} />
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredBrands}
          isLoading={isLoading}
          emptyMessage="No brands found"
          page={page}
          onPageChange={setPage}
          totalCount={totalCount}
          pageSize={limit}
        />
      </div>

      <BrandFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedBrand}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => brandToDelete && deleteMutation.mutate(brandToDelete.id)}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? All products associated with this brand will lose their brand reference."
        itemName={brandToDelete?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
