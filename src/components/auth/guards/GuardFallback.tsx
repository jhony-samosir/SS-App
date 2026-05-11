"use client";

import React from "react";

interface GuardFallbackProps {
  message: string;
}

/**
 * Reusable loading fallback for Authentication and Authorization guards.
 * Standardizes the "Checking access" UI across the application.
 */
export function GuardFallback({ message }: GuardFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse font-medium">{message}</p>
    </div>
  );
}
