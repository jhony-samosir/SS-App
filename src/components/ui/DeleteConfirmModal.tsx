"use client";

import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  isLoading?: boolean;
  itemName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  itemName
}: Readonly<DeleteConfirmModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-destructive/50 to-transparent" />
        
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center shadow-inner">
              <Trash2 size={32} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">
                {description || "This action cannot be undone. This will permanently remove the record from our servers."}
              </p>
            </div>

            {itemName && (
              <div className="px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-xs font-mono text-muted-foreground break-all">
                {itemName}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl font-bold border border-border hover:bg-muted transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-destructive/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Delete Now"
              )}
            </button>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="bg-destructive/5 border-t border-border/50 p-4 flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-destructive" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80">
            Destructive Action
          </span>
        </div>
      </div>
    </div>
  );
}
