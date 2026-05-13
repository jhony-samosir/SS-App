"use client";

import { Store, Save } from "lucide-react";

export default function SellerSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-heading">Store Setup</h1>
          <p className="text-muted-foreground text-lg">Configure your store profile and preferences.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Store size={20} className="text-primary" /> Store Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold opacity-70">Store Name</label>
              <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all" placeholder="Enter store name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold opacity-70">Description</label>
              <textarea className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all min-h-[120px]" placeholder="Tell customers about your store" />
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 space-y-6">
          <h3 className="text-xl font-bold">Store Appearance</h3>
          <p className="text-muted-foreground text-sm">Upload your logo and cover images to stand out.</p>
          <div className="aspect-video bg-muted rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
             <Store size={40} className="opacity-10 mb-2" />
             <span className="text-xs font-medium">Click to upload banner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
