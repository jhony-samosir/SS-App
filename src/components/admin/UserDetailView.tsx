"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  History,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Fingerprint,
  ShieldAlert,
  Pencil,
  Unlock,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";
import { userService } from "@/services/user-service";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import { useState } from "react";
import { UserFormModal } from "./UserFormModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserUpdateRequest } from "@/types/user";

export function UserDetailView({ publicId }: { publicId: string }) {
  const { hasPermission, isHydrated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "unlock" | "reset" | "delete", label: string } | null>(null);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", publicId],
    queryFn: () => userService.getUser(publicId),
    enabled: isHydrated && hasPermission("UserManagement Read"),
    retry: false
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => userService.updateUser(publicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", publicId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditModalOpen(false);
      setEditError(null);
      toast.success("User updated successfully");
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setEditError(err.response?.data?.message || "Failed to update user");
      }
    }
  });

  const unlockMutation = useMutation({
    mutationFn: () => userService.unlockUser(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", publicId] });
      toast.success("Account unlocked successfully");
      setConfirmAction(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to unlock account");
      }
      setConfirmAction(null);
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => userService.forceResetPassword(publicId),
    onSuccess: () => {
      toast.success("Password reset forced successfully");
      setConfirmAction(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to force password reset");
      }
      setConfirmAction(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteUser(publicId),
    onSuccess: () => {
      toast.success("User deleted successfully");
      router.push("/users");
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to delete user");
      }
      setConfirmAction(null);
    }
  });

  const isForbidden = (error && axios.isAxiosError(error) && error.response?.status === 403) || 
                      (isHydrated && !hasPermission("UserManagement Read"));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted-foreground animate-pulse">Loading user profile...</p>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-12 text-center flex flex-col items-center">
        <ShieldAlert className="text-destructive mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You do not have the required permission (<strong>UserManagement Read</strong>) to view this profile.
        </p>
        <Link href="/users" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to User List
        </Link>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-12 text-center">
        <AlertCircle className="mx-auto text-destructive mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error Loading User</h2>
        <p className="text-muted-foreground mb-8">The user profile could not be retrieved. It may have been deleted or you may lack permissions.</p>
        <Link href="/users" className="bg-primary text-white px-6 py-3 rounded-2xl font-bold inline-flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Users
        </Link>
      </div>
    );
  }

  const sections = [
    {
      title: "Core Identity",
      icon: <User size={20} />,
      fields: [
        { label: "Full Name", value: user.fullName },
        { label: "Email Address", value: user.email },
        { label: "Email Status", value: user.isEmailVerified ? "Verified" : "Pending", variant: user.isEmailVerified ? "success" : "warning" },
        { label: "System Role", value: user.roleName, variant: "primary" },
      ]
    },
    {
      title: "Security & Access",
      icon: <Shield size={20} />,
      fields: [
        { label: "Account Status", value: user.isActive ? "Active" : "Inactive", variant: user.isActive ? "success" : "danger" },
        { label: "MFA Protection", value: user.mfaEnabled ? "Enabled" : "Disabled", variant: user.mfaEnabled ? "success" : "secondary" },
        { label: "Lock Status", value: user.isLocked ? "Locked" : "Unlocked", variant: user.isLocked ? "danger" : "success" },
        { label: "Failed Attempts", value: user.failedLoginAttempts.toString() },
        { label: "Locked Until", value: user.lockedUntil ? new Date(user.lockedUntil).toLocaleString() : "N/A" },
      ]
    },
    {
      title: "Legal & Audit",
      icon: <FileText size={20} />,
      fields: [
        { label: "TOS Accepted", value: user.tosAcceptedAt ? new Date(user.tosAcceptedAt).toLocaleDateString() : "Pending" },
        { label: "Privacy Policy", value: user.privacyPolicyAcceptedAt ? new Date(user.privacyPolicyAcceptedAt).toLocaleDateString() : "Pending" },
        { label: "Created At", value: new Date(user.createdAt).toLocaleString() },
        { label: "Last Updated", value: new Date(user.updatedAt).toLocaleString() },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/users" className="p-3 hover:bg-muted rounded-2xl transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">User Details</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Fingerprint size={14} />
              ID: {user.publicId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasPermission("UserManagement Update") && (
            <>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-muted hover:bg-primary hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Pencil size={18} />
                Edit Profile
              </button>

              {user.isLocked && (
                <button 
                  onClick={() => setConfirmAction({ type: "unlock", label: "Unlock Account" })}
                  className="flex-1 md:flex-none px-6 py-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Unlock size={18} />
                  Unlock
                </button>
              )}

              <button 
                onClick={() => setConfirmAction({ type: "reset", label: "Force Password Reset" })}
                className="flex-1 md:flex-none px-6 py-3 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Force Reset
              </button>
            </>
          )}

          {hasPermission("UserManagement Delete") && (
            <button 
              onClick={() => setConfirmAction({ type: "delete", label: "Delete User" })}
              className="flex-1 md:flex-none px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto border-2 border-primary/20 shadow-inner">
              <User size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.roleName}
              </span>
              <span className={cn(
                "px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider",
                user.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </motion.div>

          <div className="bg-muted/30 rounded-3xl p-6 border border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-widest">
              <History size={16} />
              Audit Log Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Registered</span>
                <span className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Last Modified</span>
                <span className="text-xs font-medium">{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
                <div className="p-2 bg-background rounded-xl border border-border text-primary shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold font-heading">{section.title}</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.fields.map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Clock size={10} />
                      {field.label}
                    </label>
                    <div className="flex items-center">
                      {field.variant ? (
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-sm font-bold",
                          field.variant === "success" && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                          field.variant === "danger" && "bg-destructive/10 text-destructive border border-destructive/20",
                          field.variant === "warning" && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                          field.variant === "primary" && "bg-primary/10 text-primary border border-primary/20",
                          field.variant === "secondary" && "bg-muted text-muted-foreground border border-border"
                        )}>
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">{field.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <UserFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(values) => updateMutation.mutate(values)}
        initialData={user}
        isPending={updateMutation.isPending}
        error={editError}
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
                confirmAction.type === "delete" ? "bg-destructive/10 text-destructive" : 
                confirmAction.type === "reset" ? "bg-secondary/10 text-secondary" : 
                "bg-amber-500/10 text-amber-600"
              )}>
                {confirmAction.type === "delete" ? <Trash2 size={32} /> : 
                 confirmAction.type === "reset" ? <RefreshCw size={32} /> : 
                 <Unlock size={32} />}
              </div>
              <h2 className="text-2xl font-bold mb-2">{confirmAction.label}?</h2>
              <p className="text-muted-foreground mb-8">
                {confirmAction.type === "delete" ? "Are you sure you want to delete this user? This action cannot be undone." : 
                 confirmAction.type === "reset" ? "Are you sure you want to force a password reset for this user? They will be required to change it upon next login." : 
                 "Are you sure you want to unlock this account?"}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-3 border border-border rounded-2xl font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === "unlock") unlockMutation.mutate();
                    if (confirmAction.type === "reset") resetMutation.mutate();
                    if (confirmAction.type === "delete") deleteMutation.mutate();
                  }}
                  disabled={unlockMutation.isPending || resetMutation.isPending || deleteMutation.isPending}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                    confirmAction.type === "delete" ? "bg-destructive text-white hover:bg-destructive/90" : 
                    confirmAction.type === "reset" ? "bg-secondary text-white hover:bg-secondary/90" : 
                    "bg-amber-500 text-white hover:bg-amber-600"
                  )}
                >
                  {(unlockMutation.isPending || resetMutation.isPending || deleteMutation.isPending) ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
