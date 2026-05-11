import { Metadata } from "next";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "System Logs - Admin - SamStore",
  description: "Monitor system events and application logs.",
};

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">System Logs</h1>
        <p className="text-muted-foreground">Monitor real-time system events and application diagnostic logs</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Logs Module Under Construction</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We are currently integrating the centralized logging system. Real-time stream and historical log search will be available in the next release.
        </p>
      </div>
    </div>
  );
}
