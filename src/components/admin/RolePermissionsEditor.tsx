"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, 
  Loader2, 
  Check, 
  Save,
  ShieldCheck,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { roleService } from "@/services/role-service";
import { menuService } from "@/services/menu-service";
import { RolePermission, RolePermissionsUpdateRequest } from "@/types/role";
import { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

interface RolePermissionsEditorProps {
  roleId: string;
  roleName: string;
  isOpen: boolean;
  onClose: () => void;
}

type PermissionAction = "canRead" | "canCreate" | "canUpdate" | "canDelete";

export function RolePermissionsEditor({ roleId, roleName, isOpen, onClose }: Readonly<RolePermissionsEditorProps>) {
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>([]);
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: initialPermissions, isLoading: isPermsLoading } = useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: () => roleService.getRolePermissions(roleId),
    enabled: isOpen && !!roleId,
  });

  const { data: menuTree, isLoading: isMenusLoading } = useQuery({
    queryKey: ["menus", "tree"],
    queryFn: menuService.getMenuTree,
    enabled: isOpen,
  });

  // Mutation
  const updateMutation = useMutation({
    mutationFn: (data: RolePermissionsUpdateRequest) => roleService.updateRolePermissions(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", roleId, "permissions"] });
      setIsDiffVisible(false);
      onClose();
    },
  });

  const flattenMenus = (nodes: MenuItem[]): MenuItem[] => {
    let list: MenuItem[] = [];
    for (const node of nodes) {
      list.push(node);
      if (node.children) {
        list = list.concat(flattenMenus(node.children));
      }
    }
    return list;
  };

  // Sync local state when data loads
  useEffect(() => {
    if (initialPermissions) {
      const timer = setTimeout(() => {
        setLocalPermissions(structuredClone(initialPermissions));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPermissions]);

  const togglePermission = (menuId: string, action: PermissionAction, menuName: string) => {
    setLocalPermissions(prev => {
      const exists = prev.find(p => p.menuId === menuId);
      if (exists) {
        return prev.map(p => p.menuId === menuId ? { ...p, [action]: !p[action] } : p);
      } else {
        return [...prev, { menuId, menuName, canRead: false, canCreate: false, canUpdate: false, canDelete: false, [action]: true }];
      }
    });
  };

  const applyBulkAction = (perms: RolePermission[], menu: MenuItem, action: PermissionAction, value: boolean): RolePermission[] => {
    const existingIdx = perms.findIndex(p => p.menuId === menu.publicId);
    if (existingIdx >= 0) {
      const updated = [...perms];
      updated[existingIdx] = { ...updated[existingIdx], [action]: value };
      return updated;
    }
    return [...perms, {
      menuId: menu.publicId,
      menuName: menu.name,
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      [action]: value
    }];
  };

  const bulkToggleColumn = (action: PermissionAction, value: boolean) => {
    if (!menuTree) return;
    const allMenus = flattenMenus(menuTree);
    setLocalPermissions(prev => allMenus.reduce((acc, menu) => applyBulkAction(acc, menu, action, value), prev));
  };

  const changes = useMemo(() => {
    if (!initialPermissions) return [];
    return localPermissions.filter(local => {
      const initial = initialPermissions.find(i => i.menuId === local.menuId);
      
      // If it didn't exist initially, but now it has some true permission
      if (!initial) {
        return local.canRead || local.canCreate || local.canUpdate || local.canDelete;
      }
      
      // If it existed, check if any value changed
      return local.canRead !== initial.canRead || 
             local.canCreate !== initial.canCreate || 
             local.canUpdate !== initial.canUpdate || 
             local.canDelete !== initial.canDelete;
    });
  }, [localPermissions, initialPermissions]);

  const handleSave = () => {
    if (changes.length === 0) {
      onClose();
      return;
    }
    setIsDiffVisible(true);
  };

  const confirmSave = () => {
    updateMutation.mutate({
      permissions: localPermissions.map(p => ({
        menuId: p.menuId,
        canRead: p.canRead,
        canCreate: p.canCreate,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete,
      }))
    });
  };

  const isLoading = isPermsLoading || isMenusLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl h-full bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading">Role Permissions</h2>
                  <p className="text-muted-foreground">Configuring access for <span className="text-foreground font-bold">{roleName}</span></p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Matrix Content */}
            <div className="grow overflow-auto p-8">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={48} />
                  <p className="text-muted-foreground animate-pulse font-medium">Loading permission matrix...</p>
                </div>
              ) : (
                <div className="space-y-6">
                   {/* Column Headers / Bulk Toggle */}
                   <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border items-center sticky top-0 bg-card z-10 py-2">
                      <div className="col-span-4 font-bold text-sm text-muted-foreground uppercase tracking-wider">Module / Menu</div>
                      <div className="col-span-2 text-center">
                        <button onClick={() => bulkToggleColumn("canRead", true)} className="text-[10px] font-bold text-primary hover:underline uppercase">Read</button>
                      </div>
                      <div className="col-span-2 text-center">
                        <button onClick={() => bulkToggleColumn("canCreate", true)} className="text-[10px] font-bold text-primary hover:underline uppercase">Create</button>
                      </div>
                      <div className="col-span-2 text-center">
                        <button onClick={() => bulkToggleColumn("canUpdate", true)} className="text-[10px] font-bold text-primary hover:underline uppercase">Update</button>
                      </div>
                      <div className="col-span-2 text-center">
                        <button onClick={() => bulkToggleColumn("canDelete", true)} className="text-[10px] font-bold text-primary hover:underline uppercase">Delete</button>
                      </div>
                   </div>

                   {/* Rows */}
                   <div className="divide-y divide-border/50">
                     {menuTree?.map(menu => (
                       <PermissionRow 
                         key={menu.publicId} 
                         menu={menu} 
                         localPermissions={localPermissions} 
                         onToggle={togglePermission} 
                         depth={0}
                       />
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="p-8 border-t border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info size={16} />
                <span>{changes.length} unsaved changes</span>
              </div>
              <div className="flex gap-4">
                <button onClick={onClose} className="px-8 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={changes.length === 0}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={20} />
                  Save Permissions
                </button>
              </div>
            </div>

            {/* Diff Summary Modal */}
            <AnimatePresence>
              {isDiffVisible && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDiffVisible(false)} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8">
                     <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><LayoutGrid className="text-primary" /> Review Changes</h3>
                     <div className="max-h-[40vh] overflow-auto space-y-3 mb-8 pr-2">
                        {changes.map(c => (
                          <div key={c.menuId} className="p-3 bg-muted/50 rounded-xl border border-border/50">
                            <div className="font-bold text-sm mb-2">{c.menuName}</div>
                            <div className="flex flex-wrap gap-2">
                              {renderDiffBadge("Read", initialPermissions?.find(i => i.menuId === c.menuId)?.canRead, c.canRead)}
                              {renderDiffBadge("Create", initialPermissions?.find(i => i.menuId === c.menuId)?.canCreate, c.canCreate)}
                              {renderDiffBadge("Update", initialPermissions?.find(i => i.menuId === c.menuId)?.canUpdate, c.canUpdate)}
                              {renderDiffBadge("Delete", initialPermissions?.find(i => i.menuId === c.menuId)?.canDelete, c.canDelete)}
                            </div>
                          </div>
                        ))}
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => setIsDiffVisible(false)} className="flex-1 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all">Go Back</button>
                        <button 
                          onClick={confirmSave} 
                          disabled={updateMutation.isPending}
                          className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                        >
                          {updateMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : "Confirm & Save"}
                        </button>
                     </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PermissionRow({ menu, localPermissions, onToggle, depth }: Readonly<{ menu: MenuItem, localPermissions: RolePermission[], onToggle: (id: string, a: PermissionAction, name: string) => void, depth: number }>) {
  const perm = localPermissions.find(p => p.menuId === menu.publicId) || { menuId: menu.publicId, canRead: false, canCreate: false, canUpdate: false, canDelete: false };
  const hasChildren = menu.children && menu.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <div className={cn("grid grid-cols-12 gap-4 py-4 items-center group hover:bg-muted/30 transition-all px-2 rounded-xl", depth > 0 && "ml-4 border-l border-border pl-6")}>
        <div className="col-span-4 flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-muted rounded-md text-muted-foreground group-hover:text-primary transition-colors">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <div className="w-6" />}
          <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
             <DynamicIcon name={menu.icon || "Link"} size={12} />
          </div>
          <span className={cn("text-sm font-medium", depth === 0 ? "text-foreground" : "text-muted-foreground")}>{menu.name}</span>
        </div>
        <div className="col-span-2 flex justify-center">
          <Checkbox checked={perm.canRead} onChange={() => onToggle(menu.publicId, "canRead", menu.name)} />
        </div>
        <div className="col-span-2 flex justify-center">
          <Checkbox checked={perm.canCreate} onChange={() => onToggle(menu.publicId, "canCreate", menu.name)} />
        </div>
        <div className="col-span-2 flex justify-center">
          <Checkbox checked={perm.canUpdate} onChange={() => onToggle(menu.publicId, "canUpdate", menu.name)} />
        </div>
        <div className="col-span-2 flex justify-center">
          <Checkbox checked={perm.canDelete} onChange={() => onToggle(menu.publicId, "canDelete", menu.name)} />
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {menu.children?.map(child => (
            <PermissionRow key={child.publicId} menu={child} localPermissions={localPermissions} onToggle={onToggle} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

function Checkbox({ checked, onChange }: Readonly<{ checked: boolean, onChange: () => void }>) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
        checked ? "bg-primary border-primary text-primary-foreground shadow-sm" : "border-muted group-hover:border-border"
      )}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  );
}

function renderDiffBadge(label: string, oldVal: boolean | undefined, newVal: boolean) {
  if (oldVal === newVal) return null;
  return (
    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase", newVal ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20")}>
      {newVal ? `+ ${label}` : `- ${label}`}
    </span>
  );
}
