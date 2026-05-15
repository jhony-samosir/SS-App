"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Search, 
  Globe, 
  Clock, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  Filter,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Fingerprint
} from "lucide-react";
import { securityService } from "@/services/security-service";
import { LoginAttempt } from "@/types/security";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function LoginAttemptsAudit() {
  const { hasPermission, isHydrated } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [emailSearch, setEmailSearch] = useState("");
  const [ipSearch, setIpSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const debouncedEmail = useDebounce(emailSearch, 500);
  const debouncedIp = useDebounce(ipSearch, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ["login-attempts", page, debouncedEmail, debouncedIp, statusFilter],
    queryFn: () => securityService.getLoginAttempts(page, 10, {
      email: debouncedEmail || undefined,
      ipAddress: debouncedIp || undefined,
      isSuccess: statusFilter === "success" ? true : statusFilter === "failure" ? false : undefined
    }),
    enabled: isHydrated && hasPermission("SecurityAudit"),
    retry: false
  });

  const isForbidden = isHydrated && !hasPermission("SecurityAudit");

  if (isForbidden) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-12 text-center flex flex-col items-center">
        <ShieldAlert className="text-destructive mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Security Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You do not have the required permission (<strong>SecurityAudit</strong>) to access the security audit logs.
        </p>
        <button 
          onClick={() => router.push("/admin")}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const columns = [
    {
      header: "User / Email",
      render: (attempt: LoginAttempt) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border",
            attempt.isSuccess ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            <Mail size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate-max" title={attempt.email}>{attempt.email}</span>
            <span className="text-[10px] text-dimmed uppercase tracking-widest font-medium">Identity</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (attempt: LoginAttempt) => (
        <div className="flex flex-col gap-1">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit",
            attempt.isSuccess 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {attempt.isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {attempt.isSuccess ? "Success" : "Failure"}
          </div>
          {!attempt.isSuccess && attempt.failureReason && (
            <span className="text-[10px] text-destructive font-medium italic truncate max-w-[150px]">
              {attempt.failureReason}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Network Info",
      render: (attempt: LoginAttempt) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Globe size={14} className="text-muted-foreground" />
            {attempt.ipAddress}
          </div>
          {attempt.location && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Fingerprint size={10} />
              {attempt.location}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Device / Browser",
      render: (attempt: LoginAttempt) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Monitor size={14} />
          <span className="truncate max-w-[200px]" title={attempt.userAgent}>
            {attempt.userAgent.split(') ')[1] || attempt.userAgent.split(' ')[0]}
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      render: (attempt: LoginAttempt) => (
        <div className="text-sm font-medium flex items-center gap-1.5">
          <Clock size={14} className="text-muted-foreground" />
          {new Date(attempt.createdAt).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-inner">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Security Audit</h1>
            <p className="text-muted-foreground">Monitor login attempts and security events across the platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-2 rounded-2xl text-xs font-bold">
          <AlertTriangle size={16} />
          Read-Only Mode
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="filter-bar grid grid-cols-1 md:grid-cols-3 w-full">
          {/* Email Search */}
          <div className="search-container !max-w-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Filter by email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>

          {/* IP Search */}
          <div className="search-container !max-w-none">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Filter by IP..."
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5 shadow-sm">
            <Filter size={16} className="text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              <option value="all">All Attempts</option>
              <option value="success">Successful Logins</option>
              <option value="failure">Failed Attempts</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.items}
          isLoading={isLoading}
          totalCount={data?.totalCount}
          page={page}
          onPageChange={setPage}
          emptyMessage={error ? "Error loading logs" : "No security events found"}
        />
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-2 bg-background rounded-xl border border-border text-muted-foreground">
          <Shield size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold">Audit Policy</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All authentication attempts are logged for security purposes. Logs are retained for 90 days. 
            If you notice suspicious activity from a specific IP, consider blacklisting it at the gateway level.
          </p>
        </div>
      </div>
    </div>
  );
}
