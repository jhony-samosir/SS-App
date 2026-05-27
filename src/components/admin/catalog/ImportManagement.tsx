"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileUp, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ExternalLink,
  Download,
  Database,
  BarChart3,
  Calendar
} from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

import { ImportJob } from "@/types/catalog";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
};

export function ImportManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [jobType, setJobType] = useState("product_batch");

  // Queries
  const { data: jobData, isLoading } = useQuery({
    queryKey: ["admin-imports", page, limit],
    queryFn: () => catalogService.getImportJobs({ page, limit }),
    refetchInterval: (query) => {
      // Polling if there are active jobs
      const hasActiveJobs = query.state.data?.data?.items?.some(
        (job: ImportJob) => job.Status === "pending" || job.Status === "processing"
      );
      return hasActiveJobs ? 3000 : false;
    }
  });

  // Mutations
  const triggerImportMutation = useMutation({
    mutationFn: (payload: { file_url: string; job_type: string }) => 
      catalogService.triggerImport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-imports"] });
      toast.success("Import job triggered successfully");
      setIsImportModalOpen(false);
      setFileUrl("");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trigger import"));
    }
  });

  const jobs = jobData?.data?.items || [];
  const totalCount = jobData?.data?.total_count || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
            <XCircle size={12} />
            Failed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
            <Loader2 size={12} className="animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  const columns = [
    {
      header: "Job Info",
      render: (job: ImportJob) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
            job.Status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
            job.Status === "failed" ? "bg-rose-500/10 text-rose-600" :
            "bg-primary/10 text-primary"
          )}>
            <Database size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm uppercase tracking-tight truncate-max" title={job.JobType.replace("_", " ")}>{job.JobType.replace("_", " ")}</span>
            <span className="text-[10px] text-dimmed font-mono">{job.PublicID?.slice(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      header: "Progress",
      render: (job: ImportJob) => (
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Processed</span>
            <span>{job.Processed} / {job.TotalRows || "?"}</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                job.Status === "completed" ? "bg-emerald-500" :
                job.Status === "failed" ? "bg-rose-500" :
                "bg-primary animate-pulse"
              )}
              style={{ 
                width: job.TotalRows ? `${(job.Processed / job.TotalRows) * 100}%` : 
                       job.Status === "completed" ? "100%" : "10%" 
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (job: ImportJob) => getStatusBadge(job.Status),
    },
    {
      header: "Created At",
      render: (job: ImportJob) => (
        <div className="flex flex-col text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar size={12} />
            {format(new Date(job.CreatedAt), "MMM dd, yyyy")}
          </div>
          <div className="text-[10px] font-medium pl-4">{format(new Date(job.CreatedAt), "HH:mm")}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (job: ImportJob) => (
        <div className="flex justify-end gap-2">
          {job.FileURL && (
            <a 
              href={job.FileURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-primary"
              title="View Source File"
            >
              <Download size={16} />
            </a>
          )}
          {job.ErrorLog && (
            <button 
              className="p-2 hover:bg-rose-50 rounded-lg transition-all text-rose-600"
              title="View Error Log"
              onClick={() => alert(job.ErrorLog)}
            >
              <AlertCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Data Imports</h1>
          <p className="text-muted-foreground mt-1">Bulk manage catalog data and track system synchronization</p>
        </div>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
        >
          <FileUp size={18} />
          New Import
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Jobs</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
        </div>

        <div className="bg-card/50 p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</p>
            <p className="text-2xl font-bold text-emerald-600">
              {totalCount > 0 ? Math.round((jobs.filter((j: ImportJob) => j.Status === "completed").length / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="filter-bar">
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search by job ID or type..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={jobs}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          pageSize={limit}
          totalCount={totalCount}
        />
      </div>

      {/* Trigger Import Modal (Simplified for now) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <FileUp className="text-primary" />
                Trigger New Import
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Job Type</label>
                <select 
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl p-3.5 text-sm outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="product_batch">Product Batch Import</option>
                  <option value="inventory_sync">Inventory Synchronization</option>
                  <option value="variant_update">Mass Variant Update</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">File URL (S3/Public)</label>
                <input 
                  type="url"
                  placeholder="https://bucket.s3.region.amazonaws.com/catalog.csv"
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl p-3.5 text-sm outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-xs text-primary/80">
                <AlertCircle className="shrink-0" size={18} />
                <p>The system will queue this job and process it asynchronously. You can monitor the progress in the main list.</p>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold border border-border rounded-2xl hover:bg-background transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => triggerImportMutation.mutate({ file_url: fileUrl, job_type: jobType })}
                disabled={!fileUrl || triggerImportMutation.isPending}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {triggerImportMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
