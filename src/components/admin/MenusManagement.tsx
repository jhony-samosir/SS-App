"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Loader2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  X,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { menuService } from "@/services/menu-service";
import { MenuItem, MenuCreateRequest } from "@/types/menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/DataTable";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { SoftSelect } from "@/components/ui/SoftSelect";

const menuSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  path: z.string().min(1, "Path is required"),
  icon: z.string().min(1, "Icon is required"),
  sortOrder: z.number().min(0),
  parentId: z.string().nullable().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export function MenusManagement() {
  const [isTreeMode, setIsTreeMode] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for flat list
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const queryClient = useQueryClient();

  // Queries
  const { data: flatMenus, isLoading: isFlatLoading } = useQuery({
    queryKey: ["menus", "flat"],
    queryFn: menuService.getMenus,
  });

  const { data: menuTree, isLoading: isTreeLoading } = useQuery({
    queryKey: ["menus", "tree"],
    queryFn: menuService.getMenuTree,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: MenuCreateRequest) => menuService.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsFormOpen(false);
    },
    onError: (err: any) => setError(err.response?.data?.message || "Failed to create menu")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: MenuCreateRequest }) => menuService.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsFormOpen(false);
    },
    onError: (err: any) => setError(err.response?.data?.message || "Failed to update menu")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuService.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setDeleteConfirmId(null);
    },
    onError: (err: any) => setError(err.response?.data?.message || "Failed to delete menu")
  });

  // Declarative Detail Query
  const { data: editingMenu, isLoading: isFetchingMenu } = useQuery({
    queryKey: ["menus", "detail", editingId],
    queryFn: () => editingId ? menuService.getMenu(editingId) : null,
    enabled: !!editingId && isFormOpen,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { parentId: null, sortOrder: 0, icon: "Circle" }
  });

  // Effect to reset form when editingMenu changes
  useEffect(() => {
    if (editingMenu) {
      reset({
        name: editingMenu.name,
        path: editingMenu.path,
        icon: editingMenu.icon || "Circle",
        sortOrder: editingMenu.sortOrder,
        parentId: editingMenu.parentId,
      });
    }
  }, [editingMenu, reset]);

  const handleOpenForm = (menu?: MenuItem) => {
    setError(null);
    if (menu) {
      setEditingId(menu.publicId);
      setIsFormOpen(true);
    } else {
      setEditingId(null);
      reset({ name: "", path: "", icon: "Circle", sortOrder: 0, parentId: null });
      setIsFormOpen(true);
    }
  };

  // Helper to get all descendant publicIds to prevent circular dependencies
  const getDescendantIds = (nodes: MenuItem[], targetId: string): string[] => {
    const targetNode = nodes.find(n => n.publicId === targetId);
    if (!targetNode || !targetNode.children) return [];
    
    let ids: string[] = [];
    const traverse = (children: MenuItem[]) => {
      children.forEach(child => {
        ids.push(child.publicId);
        if (child.children) traverse(child.children);
      });
    };
    traverse(targetNode.children);
    return ids;
  };

  const descendantIds = editingId && menuTree ? getDescendantIds(menuTree, editingId) : [];
  const validParents = flatMenus?.filter(m => 
    m.publicId !== editingId && !descendantIds.includes(m.publicId)
  );

  // Client-side pagination logic
  const paginatedFlatMenus = flatMenus?.slice((page - 1) * pageSize, page * pageSize) || [];

  const onSubmit = (values: MenuFormValues) => {
    setError(null);
    if (editingMenu) {
      updateMutation.mutate({ id: editingMenu.publicId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    {
      header: "Menu Name",
      render: (m: MenuItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <DynamicIcon name={m.icon || "Link"} size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold truncate-max" title={m.name}>{m.name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Path",
      render: (m: MenuItem) => <code className="text-xs bg-muted px-2 py-1 rounded">{m.path}</code>,
    },
    {
      header: "Sort",
      render: (m: MenuItem) => <span className="text-sm">{m.sortOrder}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (m: MenuItem) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleOpenForm(m)} className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all">
            <Pencil size={18} />
          </button>
          <button onClick={() => setDeleteConfirmId(m.publicId)} className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Menu Registry</h1>
          <p className="text-muted-foreground">Define and organize application navigation menus</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTreeMode(!isTreeMode)}
            className="px-4 py-2 border border-border rounded-2xl flex items-center gap-2 hover:bg-muted transition-all"
          >
            <FolderTree size={20} />
            {isTreeMode ? "View Flat List" : "View Tree"}
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            New Menu
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-destructive/10 rounded-lg">
            <X size={16} />
          </button>
        </motion.div>
      )}

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        {!isTreeMode && (
          <div className="filter-bar">
            <div className="search-container">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search menus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
              />
            </div>
          </div>
        )}
        {isTreeMode ? (
           <div className="p-6">
              {isTreeLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
              ) : (
                <div className="space-y-2">
                  {menuTree?.map(node => <MenuTreeNode key={node.publicId} node={node} onEdit={handleOpenForm} onDelete={setDeleteConfirmId} />)}
                </div>
              )}
           </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedFlatMenus}
            isLoading={isFlatLoading}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            totalCount={flatMenus?.length}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8">
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete Menu?</h2>
              <p className="text-muted-foreground mb-8">This action cannot be undone. All child menus will also be orphaned or deleted depending on system rules.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-6 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-all">Cancel</button>
                <button 
                  onClick={() => deleteMutation.mutate(deleteConfirmId)} 
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:bg-destructive/90 transition-all flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isFormOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                 {isFetchingMenu ? (
                   <div className="py-12 flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-sm text-muted-foreground">Loading details...</p></div>
                 ) : (
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">{editingMenu ? "Edit Menu" : "New Menu"}</h2>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-bold ml-1">Menu Name</label>
                          <input 
                            {...register("name")} 
                            placeholder="e.g. Dashboard"
                            className={`w-full bg-muted/30 border ${errors.name ? 'border-destructive' : 'border-border'} rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all`} 
                          />
                          {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold ml-1">Route Path</label>
                          <input 
                            {...register("path")} 
                            placeholder="/admin/dashboard"
                            className={`w-full bg-muted/30 border ${errors.path ? 'border-destructive' : 'border-border'} rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all`} 
                          />
                          {errors.path && <p className="text-xs text-destructive ml-1">{errors.path.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-bold ml-1">Sort Order</label>
                            <input 
                              type="number" 
                              {...register("sortOrder", { valueAsNumber: true })} 
                              className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <SoftSelect 
                              id="parent-menu"
                              label="Parent Menu"
                              value={watch("parentId") || ""}
                              onChange={(val) => setValue("parentId", val === "" ? null : val)}
                              options={[
                                { value: "", label: "None (Root)" },
                                ...(validParents?.map(m => ({ value: m.publicId, label: m.name })) || [])
                              ]}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold ml-1">Icon Identifier</label>
                          <input 
                            {...register("icon")} 
                            placeholder="Circle, Home, Settings..."
                            className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-3 outline-none focus:border-primary transition-all" 
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold mt-6 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={20} className="animate-spin" />}
                        {editingMenu ? "Save Changes" : "Create Menu"}
                      </button>
                   </form>
                 )}
              </motion.div>
           </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function MenuTreeNode({ node, onEdit, onDelete }: { node: MenuItem, onEdit: (m: MenuItem) => void, onDelete: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl group transition-all">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-muted rounded-md transition-colors">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : <div className="w-6" />}
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
            <DynamicIcon name={node.icon || "Link"} size={14} />
          </div>
          <div>
            <div className="font-medium text-sm">{node.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{node.path}</div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => onEdit(node)} className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-primary"><Pencil size={14} /></button>
           <button onClick={() => onDelete(node.publicId)} className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="ml-8 border-l border-border pl-2 mt-1 space-y-1">
          {node.children?.map(child => <MenuTreeNode key={child.publicId} node={child} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
