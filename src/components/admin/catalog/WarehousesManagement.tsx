"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Loader2, 
  Warehouse as WarehouseIcon,
  MapPin,
  Building2,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Truck,
  Search
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { Warehouse } from "@/types/catalog";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { WarehouseFormModal } from "./WarehouseFormModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

type WarehouseListCache = {
  data?: {
    items: Warehouse[];
    total_count: number;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
};

export function WarehousesManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["admin-warehouses", page, limit],
    queryFn: () => catalogService.getWarehouses({ page, limit }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newWh: Partial<Warehouse>) => catalogService.createWarehouse(newWh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      toast.success("Warehouse created successfully");
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create warehouse"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Warehouse> }) => 
      catalogService.updateWarehouse(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-warehouses"] });
      const previousData = queryClient.getQueryData(["admin-warehouses", page, limit]);
      
      queryClient.setQueryData(["admin-warehouses", page, limit], (old: WarehouseListCache | undefined) => {
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
      queryClient.setQueryData(["admin-warehouses", page, limit], context?.previousData);
      toast.error("Failed to update warehouse");
    },
    onSuccess: () => {
      toast.success("Warehouse updated successfully");
      setIsModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteWarehouse(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-warehouses"] });
      const previousData = queryClient.getQueryData(["admin-warehouses", page, limit]);

      queryClient.setQueryData(["admin-warehouses", page, limit], (old: WarehouseListCache | undefined) => {
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
    onSuccess: () => {
      toast.success("Warehouse deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
    }
  });

  const handleFormSubmit = (values: Partial<Warehouse>) => {
    if (selectedWarehouse) {
      updateMutation.mutate({ id: selectedWarehouse.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const warehouses = data?.data?.items || [];
  const totalCount = data?.data?.total_count || 0;

  const filteredData = warehouses.filter(wh => 
    wh.name.toLowerCase().includes(search.toLowerCase()) ||
    wh.code.toLowerCase().includes(search.toLowerCase()) ||
    wh.city.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Warehouse",
      render: (wh: Warehouse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center border border-amber-500/20">
            <WarehouseIcon size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate-max" title={wh.name}>{wh.name}</span>
            <span className="text-xs text-dimmed font-mono truncate-max" title={wh.code}>{wh.code}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      render: (wh: Warehouse) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Building2 size={14} className="text-muted-foreground" />
            {wh.city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} />
            {wh.address}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (wh: Warehouse) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          wh.is_active 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        )}>
          {wh.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {wh.is_active ? "Operational" : "Closed"}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (wh: Warehouse) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedWarehouse(wh);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => {
              setWarehouseToDelete(wh);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">Warehouses</h1>
          <p className="text-muted-foreground">Manage physical distribution centers and logistics nodes</p>
        </div>

        <button
          onClick={() => {
            setSelectedWarehouse(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="filter-bar">
              <div className="search-container">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search warehouses by name, code or city..."
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
              emptyMessage="No warehouses found"
              page={page}
              onPageChange={setPage}
              totalCount={totalCount}
              pageSize={limit}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <Truck size={24} />
              <h3 className="font-bold text-lg">Logistics Overview</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Warehouses</span>
                <span className="font-bold">{totalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Operational</span>
                <span className="font-bold text-emerald-600">
                  {warehouses.filter(w => w.is_active).length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted border border-border rounded-3xl p-6">
            <h3 className="font-bold mb-3">Regional Coverage</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(warehouses.map(w => w.city))).map(city => (
                <span key={city} className="px-3 py-1 bg-background rounded-lg text-xs border border-border">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedWarehouse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => warehouseToDelete && deleteMutation.mutate(warehouseToDelete.id)}
        title="Delete Warehouse"
        description="Are you sure you want to delete this warehouse? This will remove all associated stock levels and logistics records."
        itemName={`${warehouseToDelete?.name} (${warehouseToDelete?.code})`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
