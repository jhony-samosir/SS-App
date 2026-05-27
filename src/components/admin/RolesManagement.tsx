"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Loader2,
  Shield,
  X,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { roleService } from "@/services/role-service";
import { Role, RoleCreateRequest } from "@/types/role";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/DataTable";
import { RolePermissionsEditor } from "./RolePermissionsEditor";

const roleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RolesManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // 500ms debounce
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Permission Editor state
  const [isPermsOpen, setIsPermsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ id: string, name: string } | null>(null);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["roles", page, debouncedSearch],
    queryFn: () => roleService.getRoles(page, 10, debouncedSearch),
  });

  const createMutation = useMutation({
    mutationFn: (data: RoleCreateRequest) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsFormOpen(false);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create role");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: RoleCreateRequest }) => roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsFormOpen(false);
      setEditingRole(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update role");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.errorCode;
        if (errorCode === "RoleInUse") {
          setError("Cannot delete role because it is currently assigned to users.");
        } else {
          setError(err.response?.data?.message || "Failed to delete role");
        }
      }
      setDeleteConfirmId(null);
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  const handleOpenForm = async (role?: Role) => {
    setError(null);
    if (role) {
      setIsFetchingRole(true);
      setIsFormOpen(true); // Open modal with loading state
      try {
        // Fetch fresh data before editing (Enterprise Requirement)
        const freshRole = await roleService.getRole(role.publicId);
        setEditingRole(freshRole);
        reset({ name: freshRole.name, description: freshRole.description });
      } catch (err) {
        console.error("Failed to fetch latest role data:", err);
        setError("Failed to fetch latest role data.");
        setIsFormOpen(false);
      } finally {
        setIsFetchingRole(false);
      }
    } else {
      setEditingRole(null);
      reset({ name: "", description: "" });
      setIsFormOpen(true);
    }
  };

  const onSubmit = (values: RoleFormValues) => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.publicId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    {
      header: "Role Name",
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Shield size={16} />
          </div>
          <span className="font-bold truncate-max" title={role.name}>{role.name}</span>
        </div>
      ),
    },
    {
      header: "Description",
      render: (role: Role) => (
        <p className="text-sm text-dimmed truncate-max" title={role.description}>{role.description}</p>
      ),
    },
    {
      header: "Created At",
      render: (role: Role) => (
        <span className="text-sm text-muted-foreground">
          {new Date(role.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (role: Role) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => { setSelectedRole({ id: role.publicId, name: role.name }); setIsPermsOpen(true); }}
            className="p-2 hover:bg-background rounded-lg transition-all text-muted-foreground hover:text-secondary"
            title="Manage Permissions"
          >
            <Lock size={18} />
          </button>
          <button 
            onClick={() => handleOpenForm(role)}
            className="p-2 hover:bg-background rounded-lg transition-all text-muted-foreground hover:text-primary"
            title="Edit Role"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => setDeleteConfirmId(role.publicId)}
            className="p-2 hover:bg-background rounded-lg transition-all text-muted-foreground hover:text-destructive"
            title="Delete Role"
          >
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">Role Management</h1>
          <p className="text-muted-foreground">Manage system-wide user roles and permissions</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="filter-bar">
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          
          {error && (
            <div className="grow max-w-md p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={16} />
              <p className="grow">{error}</p>
              <button onClick={() => setError(null)}><X size={14} /></button>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          totalCount={data?.totalCount}
          page={page}
          onPageChange={setPage}
          emptyMessage="No roles found"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isFetchingRole && setIsFormOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8"
            >
              {isFetchingRole ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-sm text-muted-foreground animate-pulse">Fetching fresh data...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-heading">{editingRole ? "Edit Role" : "Create New Role"}</h2>
                    <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="role-name" className="text-sm font-bold ml-1">Role Name</label>
                      <input
                        id="role-name"
                        {...register("name")}
                        placeholder="e.g. Moderator"
                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                      {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role-description" className="text-sm font-bold ml-1">Description</label>
                      <textarea
                        id="role-description"
                        {...register("description")}
                        placeholder="Describe the role's purpose..."
                        rows={4}
                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                      />
                      {errors.description && <p className="text-xs text-destructive ml-1">{errors.description.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        editingRole ? "Update Role" : "Create Role"
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete Role?</h2>
              <p className="text-muted-foreground mb-8">
                Are you sure you want to delete this role? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-2xl font-bold hover:bg-destructive/90 transition-all flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <RolePermissionsEditor 
        isOpen={isPermsOpen}
        onClose={() => setIsPermsOpen(false)}
        roleId={selectedRole?.id || ""}
        roleName={selectedRole?.name || ""}
      />
    </div>
  );
}
