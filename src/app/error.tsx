"use client";

import { useEffect } from "react";
import logger from "@/lib/logger";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(
      {
        err: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        },
      },
      "Application error caught by boundary"
    );
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold font-heading">Application Error</h2>
        <p className="text-muted-foreground text-sm">
          An error occurred while loading this page. This issue has been logged.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/95 transition-all cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
