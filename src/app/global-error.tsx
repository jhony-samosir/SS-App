"use client";

import { useEffect } from "react";
import logger from "@/lib/logger";

export default function GlobalError({
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
      "Global application error caught"
    );
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <span className="text-2xl font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-slate-400 text-sm">
              An unexpected global error occurred. The team has been notified.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full bg-rose-600 text-white py-3 rounded-2xl font-bold hover:bg-rose-500 transition-all cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
