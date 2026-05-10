import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  id: string;
}

const SoftInput = React.forwardRef<HTMLInputElement, SoftInputProps>(
  ({ className, label, icon: Icon, error, id, type, ...props }, ref) => {
    const errorId = `${id}-error`;

    return (
      <div className="space-y-2">
        <label 
          htmlFor={id} 
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1"
        >
          {label}
        </label>
        <div className="relative group">
          {Icon && (
            <Icon 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
              size={18} 
            />
          )}
          <input
            {...props}
            id={id}
            ref={ref}
            type={type}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full bg-muted/30 border border-border/50 focus:border-primary/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all outline-none ring-primary/5 focus:ring-8",
              error && "border-destructive/30 ring-destructive/5 focus:ring-destructive/5",
              !Icon && "pl-5",
              className
            )}
          />
        </div>
        {error && (
          <p 
            id={errorId} 
            className="text-xs text-destructive font-medium pl-1 animate-in fade-in slide-in-from-top-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

SoftInput.displayName = "SoftInput";

export { SoftInput };
