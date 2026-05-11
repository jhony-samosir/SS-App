import { Metadata } from "next";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "General Settings - Admin - SamStore",
  description: "Configure system-wide application settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">General Settings</h1>
        <p className="text-muted-foreground">Configure system-wide application parameters and preferences</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Settings size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Settings Console</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The global configuration engine is being finalized. Soon you will be able to manage environment variables, feature flags, and site-wide metadata from here.
        </p>
      </div>
    </div>
  );
}
