"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  User, 
  Shield, 
  Mail, 
  Calendar,
  Lock,
  ChevronRight,
  UserCheck,
  UserX,
  Filter,
  ArrowUpDown,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Plus
} from "lucide-react";
import { userService } from "@/services/user-service";
import { UserListItem, UserCreateRequest } from "@/types/user";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/DataTable";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserFormModal } from "./UserFormModal";
import { toast } from "sonner";

export function UsersManagement() {
  const { hasPermission, isHydrated } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  // Filters & Sorting State
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string, desc: boolean }>({ key: "createdAt", desc: true });
  
  const [forbiddenError, setForbiddenError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsFormOpen(false);
      setSubmitError(null);
      toast.success("User created successfully");
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message || "Failed to create user");
      }
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, debouncedSearch, roleFilter, statusFilter, sortConfig],
    queryFn: async () => {
      try {
        return await userService.getUsers(
          page, 
          10, 
          { 
            search: debouncedSearch, 
            role: roleFilter || undefined,
            isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
            isLocked: statusFilter === "locked" ? true : undefined
          },
          { sortBy: sortConfig.key, isDescending: sortConfig.desc }
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setForbiddenError(true);
        }
        throw err;
      }
    },
    enabled: isHydrated && hasPermission("Users Read"),
    retry: false
  });

  useEffect(() => {
    if (isHydrated && !hasPermission("Users Read")) {
      setForbiddenError(true);
    }
  }, [isHydrated, hasPermission]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      desc: prev.key === key ? !prev.desc : true
    }));
  };

  if (forbiddenError) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-12 text-center flex flex-col items-center">
        <ShieldAlert className="text-destructive mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You do not have the required permission (<strong>Users Read</strong>) to view this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        <button 
          onClick={() => router.push("/")}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const columns = [
    {
      header: "User",
      render: (user: UserListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{user.fullName}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail size={12} />
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (user: UserListItem) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
            <Shield size={14} />
          </div>
          <span className="text-sm font-medium">{user.roleName}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (user: UserListItem) => (
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            user.isActive 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {user.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
            {user.isActive ? "Active" : "Inactive"}
          </div>
          
          {user.isLocked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Lock size={12} />
              Locked
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Joined",
      render: (user: UserListItem) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (user: UserListItem) => (
        <Link 
          href={`/users/${user.publicId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-primary hover:text-white rounded-xl transition-all text-xs font-bold"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">User Management</h1>
          <p className="text-muted-foreground">Monitor and manage all system users and their access levels</p>
        </div>

        {hasPermission("Users Create") && (
          <button
            onClick={() => {
              setSubmitError(null);
              setIsFormOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Create User
          </button>
        )}
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 shadow-sm">
              <Filter size={16} className="text-muted-foreground" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 shadow-sm">
              <UserCheck size={16} className="text-muted-foreground" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 shadow-sm">
              <ArrowUpDown size={16} className="text-muted-foreground" />
              <select 
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="fullName">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="roleName">Sort by Role</option>
              </select>
            </div>
          </div>

          {isLoading && <Loader2 className="animate-spin text-primary ml-auto" size={20} />}
        </div>

        <DataTable
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          totalCount={data?.totalCount}
          page={page}
          onPageChange={setPage}
          emptyMessage={error ? "Error loading users" : "No users found matching filters"}
        />
      </div>

      <UserFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
        isPending={createMutation.isPending}
        error={submitError}
      />
    </div>
  );
}
