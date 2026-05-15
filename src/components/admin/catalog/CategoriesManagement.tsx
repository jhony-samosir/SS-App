"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Loader2, 
  Layers, 
  Edit3, 
  Trash2, 
  FolderTree,
  ChevronRight,
  Info
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { Category } from "@/types/catalog";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CategoryFormModal } from "./CategoryFormModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export function CategoriesManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories", page, limit],
    queryFn: () => catalogService.getCategories({ page, limit }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newCat: Partial<Category>) => catalogService.createCategory(newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => 
      catalogService.updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previousData = queryClient.getQueryData(["admin-categories", page, limit]);
      
      queryClient.setQueryData(["admin-categories", page, limit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item: Category) => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admin-categories", page, limit], context?.previousData);
      toast.error("Failed to update category");
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      setIsModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-categories"] });
      const previousData = queryClient.getQueryData(["admin-categories", page, limit]);

      queryClient.setQueryData(["admin-categories", page, limit], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item: Category) => item.id !== id),
            total_count: old.data.total_count - 1
          }
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    }
  });

  const handleFormSubmit = (values: any) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const categories = data?.data?.items || [];
  const totalCount = data?.data?.total_count || 0;

  const filteredData = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Category",
      render: (cat: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Layers size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{cat.name}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {cat.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Hierarchy",
      render: (cat: Category) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold border",
            cat.level === 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
          )}>
            Level {cat.level}
          </span>
          {cat.parent_id && (
            <>
              <ChevronRight size={14} />
              <span className="text-xs">ID: {cat.parent_id}</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Sort Order",
      render: (cat: Category) => (
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded-lg">
          {cat.sort_order}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (cat: Category) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedCategory(cat);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
            title="Edit Category"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              setCategoryToDelete(cat);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
            title="Delete Category"
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">Category Hierarchy</h1>
          <p className="text-muted-foreground">Manage product categorization and SEO taxonomy</p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search categories..."
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
              data={filteredData}
              isLoading={isLoading}
              emptyMessage="No categories found"
              page={page}
              onPageChange={setPage}
              totalCount={totalCount}
              pageSize={limit}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <FolderTree size={20} />
              <h3 className="font-bold">Hierarchy Info</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Categories use a nested hierarchy. <strong>Level 0</strong> categories are top-level menus. 
              Sub-categories inherit properties from their parents but can have unique SEO metadata.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <Info size={20} />
              <h3 className="font-bold">SEO Tip</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Always provide localized descriptions and meta tags to improve search engine rankings across different regions.
            </p>
          </div>
        </div>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
        title="Delete Category"
        description="Are you sure you want to delete this category? Sub-categories and product associations might be affected."
        itemName={categoryToDelete?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
