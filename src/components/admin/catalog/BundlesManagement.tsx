"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
  Tag,
  Info
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProductBundle } from "@/types/catalog";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export function BundlesManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<ProductBundle | null>(null);

  // Queries
  const { data: bundleData, isLoading } = useQuery({
    queryKey: ["admin-bundles", page, limit],
    queryFn: () => catalogService.getBundles({ offset: (page - 1) * limit, limit }),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogService.deleteBundle(id),
    onSuccess: () => {
      toast.success("Bundle deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bundles"] });
    }
  });

  const bundles = bundleData?.data?.items || [];
  const totalCount = bundleData?.data?.total_count || 0;

  const columns = [
    {
      header: "Bundle Name",
      render: (bundle: ProductBundle) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Layers size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{bundle.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{bundle.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Items",
      render: (bundle: ProductBundle) => (
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold">
            {bundle.items?.length || 0} Products
          </span>
        </div>
      ),
    },
    {
      header: "Price Override",
      render: (bundle: ProductBundle) => (
        <div className="flex items-center gap-1.5">
          {bundle.price_override ? (
            <>
              <Tag size={12} className="text-emerald-500" />
              <span className="font-bold text-emerald-600">${bundle.price_override.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs italic">Default Pricing</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (bundle: ProductBundle) => (
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          bundle.is_active 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
            : "bg-muted text-muted-foreground border-border"
        )}>
          {bundle.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {bundle.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (bundle: ProductBundle) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-lg transition-all">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit size={14} /> Edit Bundle
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                setBundleToDelete(bundle);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Product Bundles</h1>
          <p className="text-muted-foreground mt-1">Create and manage curated product packages and discounts</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm">
          <Plus size={18} />
          New Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Bundles</p>
            <p className="text-2xl font-bold">{bundles.filter((b: ProductBundle) => b.is_active).length}</p>
          </div>
        </div>

        <div className="bg-indigo-600 p-4 rounded-3xl border border-indigo-500 shadow-sm flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Promotion Active</p>
            <p className="text-2xl font-bold">Marketing Seasonal</p>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search bundles..."
              className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
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
          data={bundles}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          pageSize={limit}
          totalCount={totalCount}
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Info className="text-amber-600 shrink-0" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-bold">Did you know?</p>
          <p className="opacity-80">Product bundles increase your Average Order Value (AOV) by encouraging customers to buy complementary items at a slight discount.</p>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => bundleToDelete && deleteMutation.mutate(parseInt(bundleToDelete.id))}
        title="Delete Bundle"
        description="Are you sure you want to delete this product bundle? This will not delete the individual products."
        itemName={bundleToDelete?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
