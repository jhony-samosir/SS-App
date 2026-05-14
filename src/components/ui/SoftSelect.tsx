"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SoftSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
}

/**
 * SoftSelect - A high-end custom select component
 * Styled like a premium desktop application with custom animations and layout.
 */
export function SoftSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select option...",
  icon,
  className,
  error,
}: SoftSelectProps) {
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1"
      >
        {label}
      </label>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            className={cn(
              "flex items-center gap-2.5 bg-muted/30 border border-border/50 rounded-[14px] px-4 py-3.5 shadow-sm transition-all hover:border-border hover:bg-muted/50 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 w-full text-left group",
              error && "border-destructive/30 ring-destructive/5 focus:ring-destructive/5",
              className
            )}
          >
            {icon && <div className="text-muted-foreground shrink-0 transition-colors group-hover:text-primary">{icon}</div>}
            <span className="flex-grow text-[13px] font-medium truncate">{selectedLabel}</span>
            <ChevronDown size={14} className="text-muted-foreground/60 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          sideOffset={8}
          className="w-[220px] p-2 bg-background/80 backdrop-blur-xl border border-border/40 rounded-[14px] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex items-center h-10 px-3 py-2 rounded-lg text-[13px] font-medium outline-none cursor-pointer transition-all mb-1 last:mb-0",
                    isSelected 
                      ? "bg-primary/[0.08] text-primary" 
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-1 w-1 h-4 bg-primary rounded-full" />
                  )}
                  <span className={cn(isSelected ? "pl-2" : "")}>{opt.label}</span>
                  {isSelected && <Check size={14} className="ml-auto opacity-60" />}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
