"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Loader2, 
  Search, 
  Filter,
  Trash2, 
  Edit3,
  Package,
  Eye,
  MoreVertical,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { Product } from "@/types/product";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProductFormModal } from "./ProductFormModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import Image from "next/image";

type ProductListCache = {
  data?: {
    items: Product[];
    total_count: number;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
};

export function ProductsManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Queries
  const { data: prodData, isLoading } = useQuery({
    queryKey: ["admin-products", page, limit],
    queryFn: () => catalogService.getAdminProducts({ page, limit }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => catalogService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create product"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Product> }) => 
      catalogService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-products"] });
      const previousData = queryClient.getQueryData(["admin-products", page, limit]);
      
      queryClient.setQueryData(["admin-products", page, limit], (old: ProductListCache | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item: Product) => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin-products", page, limit], context?.previousData);
      toast.error("Failed to update product");
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      setIsModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-products"] });
      const previousData = queryClient.getQueryData(["admin-products", page, limit]);

      queryClient.setQueryData(["admin-products", page, limit], (old: ProductListCache | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item: Product) => item.id !== id),
            total_count: old.data.total_count - 1
          }
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });

  const handleSubmit = (values: Partial<Product>) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const products = prodData?.data?.items || [];
  const totalCount = prodData?.data?.total_count || 0;

  const columns = [
    {
      header: "Product",
      render: (prod: Product) => (
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
            {prod.image_url ? (
              <Image 
                src={prod.image_url} 
                alt={prod.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate-max" title={prod.name}>{prod.name}</span>
            <span className="text-[10px] text-dimmed font-mono truncate uppercase tracking-tighter">{prod.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Brand",
      render: (prod: Product) => (
        prod.brand ? (
          <div className="flex items-center gap-2">
            {prod.brand.logo_url && (
              <div className="relative w-5 h-5 rounded-md overflow-hidden bg-muted border border-border/50 shrink-0">
                <Image src={prod.brand.logo_url} alt={prod.brand.name} fill className="object-cover" />
              </div>
            )}
            <span className="font-semibold text-xs text-foreground/85 bg-muted border border-border/50 px-2.5 py-0.5 rounded-md">
              {prod.brand.name}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )
      )
    },
    {
      header: "Categories",
      render: (prod: Product) => (
        prod.categories && prod.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {prod.categories.map((c) => (
              <span key={c.id} className="text-[10px] font-semibold bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded-md">
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )
      )
    },
    {
      header: "Variants",
      render: (prod: Product) => (
        prod.variants && prod.variants.length > 0 ? (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs font-semibold text-foreground/70">
              {prod.variants.length} Variant{prod.variants.length > 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap gap-1">
              {prod.variants.slice(0, 2).map((v) => (
                <span key={v.id} className="text-[9px] font-mono bg-muted text-muted-foreground px-1 py-0.5 rounded border border-border/40" title={v.name}>
                  {v.sku}
                </span>
              ))}
              {prod.variants.length > 2 && (
                <span className="text-[9px] font-mono bg-muted text-muted-foreground px-1 py-0.5 rounded border border-border/40">
                  +{prod.variants.length - 2} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No variants</span>
        )
      )
    },
    {
      header: "Status",
      render: (prod: Product) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          prod.status === "published" || prod.status === "active"
            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
            : prod.status === "draft"
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-rose-50 text-rose-600 border-rose-200"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            prod.status === "published" || prod.status === "active" ? "bg-emerald-500" : prod.status === "draft" ? "bg-amber-500" : "bg-rose-500"
          )} />
          {prod.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Price",
      render: (prod: Product) => (
        <span className="font-bold text-sm">
          Rp {(prod.price ?? 0).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (prod: Product) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedProduct(prod);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
            title="Edit Product"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              setProductToDelete(prod);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
            title="Delete Product"
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage global product visibility, inventory status, and core metadata</p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          <Plus size={20} />
          New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
        </div>
        {/* Placeholder for more stats */}
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="filter-bar justify-between">
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          pageSize={limit}
          totalCount={totalCount}
        />
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will remove the product and all its variants from the catalog."
        itemName={productToDelete?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
