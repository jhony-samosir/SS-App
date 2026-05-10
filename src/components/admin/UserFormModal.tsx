"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X, 
  Loader2, 
  Mail, 
  User, 
  Shield,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, UserCreateRequest, UserUpdateRequest } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { roleService } from "@/services/role-service";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  roleName: z.string().min(1, "Please select a role"),
  isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData?: UserProfile | null;
  isPending: boolean;
  error: string | null;
}

export function UserFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isPending,
  error 
}: UserFormModalProps) {
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-list"],
    queryFn: () => roleService.getRoles(1, 100), // Fetch all roles
    enabled: isOpen
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData ? {
      email: initialData.email,
      fullName: initialData.fullName,
      roleName: initialData.roleName,
      isActive: initialData.isActive
    } : {
      email: "",
      fullName: "",
      roleName: "",
      isActive: true
    }
  });

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset(initialData ? {
        email: initialData.email,
        fullName: initialData.fullName,
        roleName: initialData.roleName,
        isActive: initialData.isActive
      } : {
        email: "",
        fullName: "",
        roleName: "",
        isActive: true
      });
    }
  }, [isOpen, initialData, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading">
                    {initialData ? "Edit User" : "Create New User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {initialData ? "Update user profile and permissions." : "Invite a new member to the platform."}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Email - Disabled in Edit Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        {...register("email")}
                        disabled={!!initialData}
                        placeholder="user@example.com"
                        className={cn(
                          "w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none",
                          initialData && "opacity-60 cursor-not-allowed bg-muted/20"
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        {...register("fullName")}
                        placeholder="John Doe"
                        className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-destructive ml-1">{errors.fullName.message}</p>}
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Assigned Role</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <select
                        {...register("roleName")}
                        className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select a role...</option>
                        {rolesData?.items.map(role => (
                          <option key={role.publicId} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                      {isLoadingRoles && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" size={18} />
                      )}
                    </div>
                    {errors.roleName && <p className="text-xs text-destructive ml-1">{errors.roleName.message}</p>}
                  </div>

                  {/* Active Status Toggle (Only in Edit) */}
                  {initialData && (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border",
                          initialData.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Account Active</p>
                          <p className="text-xs text-muted-foreground">User can access the platform</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        {...register("isActive")}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending || isLoadingRoles}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    initialData ? "Update User" : "Create User"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
