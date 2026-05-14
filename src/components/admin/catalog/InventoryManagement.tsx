"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Loader2, 
  Search, 
  Filter,
  Warehouse,
  History,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ChevronRight,
  Database
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { ProductInventory } from "@/types/product";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SoftInput } from "@/components/ui/SoftInput";
import { SoftSelect } from "@/components/ui/SoftSelect";

export function InventoryManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<ProductInventory | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  // Queries
  const { data: invData, isLoading } = useQuery({
    queryKey: ["admin-inventory", page, limit, warehouseId],
    queryFn: () => catalogService.getInventory({ page, limit, warehouse_id: warehouseId }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["admin-warehouses-lookup"],
    queryFn: () => catalogService.getWarehouses({ limit: 100 }),
  });

  // Mutations
  const adjustStockMutation = useMutation({
    mutationFn: (data: any) => catalogService.updateStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Stock adjusted successfully");
      setIsAdjustModalOpen(false);
      setAdjustQty(0);
      setAdjustNote("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to adjust stock");
    }
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;
    
    adjustStockMutation.mutate({
      variant_id: selectedInv.variant_id,
      warehouse_id: selectedInv.warehouse_id,
      quantity: adjustQty,
      note: adjustNote,
      reference_type: "adjustment"
    });
  };

  const inventory = invData?.data?.items || [];
  const totalCount = invData?.data?.total_count || 0;
  const warehouses = warehousesData?.data?.items || [];

  const columns = [
    {
      header: "Product / Variant",
      render: (inv: ProductInventory) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">Variant ID: {inv.variant_id}</span>
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">SKU REFERENCE</span>
        </div>
      ),
    },
    {
      header: "Warehouse",
      render: (inv: ProductInventory) => (
        <div className="flex items-center gap-2">
          <Warehouse size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">{inv.warehouse_name || "Unknown Warehouse"}</span>
        </div>
      ),
    },
    {
      header: "Stock Level",
      render: (inv: ProductInventory) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className={cn(
              "text-lg font-bold",
              inv.quantity_on_hand <= inv.low_stock_alert ? "text-destructive" : "text-foreground"
            )}>
              {inv.quantity_on_hand}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">On Hand</span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col opacity-60">
            <span className="text-sm font-bold">{inv.quantity_reserved}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Reserved</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (inv: ProductInventory) => {
        const isLow = inv.quantity_on_hand <= inv.low_stock_alert;
        const isOut = inv.quantity_on_hand === 0;
        
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isOut 
              ? "bg-rose-50 text-rose-600 border-rose-200" 
              : isLow 
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
          )}>
            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "Healthy"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      render: (inv: ProductInventory) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedInv(inv);
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold"
          >
            <Database size={14} />
            Adjust Stock
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Inventory Hub</h1>
          <p className="text-muted-foreground mt-1">Real-time stock monitoring and warehouse logistics</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-[240px]">
            <SoftSelect
              id="wh-filter"
              label="Warehouse Filter"
              options={[
                { value: "", label: "All Warehouses" },
                ...warehouses.map(w => ({ value: w.id, label: w.name }))
              ]}
              value={warehouseId}
              onChange={setWarehouseId}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total SKUs</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
        </div>
        
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600">
              {inventory.filter(i => i.quantity_on_hand <= i.low_stock_alert && i.quantity_on_hand > 0).length}
            </p>
          </div>
        </div>

        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600">
              {inventory.filter(i => i.quantity_on_hand === 0).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search by Variant SKU or ID..."
              className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
            <History size={16} />
            Movement Logs
          </button>
        </div>

        <DataTable
          columns={columns}
          data={inventory}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          pageSize={limit}
          totalCount={totalCount}
        />
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAdjustModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
              <div>
                <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                  <Database size={20} className="text-primary" />
                  Adjust Stock Level
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manual inventory correction for Warehouse</p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-muted-foreground">
                  <span>Current Stock</span>
                  <span>New Balance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{selectedInv?.quantity_on_hand}</span>
                  <ChevronRight size={24} className="text-muted-foreground/30" />
                  <span className={cn(
                    "text-2xl font-bold",
                    adjustQty > 0 ? "text-emerald-600" : adjustQty < 0 ? "text-rose-600" : "text-foreground"
                  )}>
                    {(selectedInv?.quantity_on_hand || 0) + adjustQty}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <SoftInput
                  id="adj-qty"
                  label="Adjustment Quantity"
                  type="number"
                  placeholder="e.g. 50 or -20"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  helperText="Use positive for adding, negative for removing stock."
                />

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Reason / Note</label>
                  <textarea
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="w-full bg-muted/30 border border-border/50 rounded-2xl p-4 text-sm min-h-[80px] focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                    placeholder="Provide a reason for this adjustment..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold border border-border hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isPending || adjustQty === 0}
                  className="flex-1 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {adjustStockMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
