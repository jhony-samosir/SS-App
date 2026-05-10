"use client";

import { ReactNode } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  totalCount?: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data = [],
  isLoading = false,
  totalCount = 0,
  page,
  onPageChange,
  pageSize = 10,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-widest font-bold">
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-4", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn("px-6 py-4", col.className)}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {data.length} of {totalCount} items
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 border border-border rounded-lg disabled:opacity-30 hover:bg-muted transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            disabled={page * pageSize >= totalCount}
            onClick={() => onPageChange(page + 1)}
            className="p-2 border border-border rounded-lg disabled:opacity-30 hover:bg-muted transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
