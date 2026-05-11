"use client";

import { Search, Bell, User, Menu } from "lucide-react";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "./AdminSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <AdminSidebar className="border-r-0 lg:flex" />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden sm:block">
          <AdminBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            aria-label="Search resources"
            className="bg-muted/30 border border-border/50 rounded-2xl py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>
          
          <div className="h-8 w-[1px] bg-border/50 mx-1" />

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{user?.roleName || "System Admin"}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
