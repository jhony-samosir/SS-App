"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Settings,
  LayoutGrid,
  ChevronRight,
  LogOut,
  AppWindow,
  Activity,
  UserCircle,
  LucideIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Users",
    items: [
      { name: "User Management", href: "/admin/users", icon: Users, permission: "UserManagement Read" },
    ]
  },
  {
    title: "Roles",
    items: [
      { name: "Role Policies", href: "/admin/roles", icon: ShieldCheck, permission: "RoleManagement" },
    ]
  },
  {
    title: "Permissions",
    items: [
      { name: "Registry", href: "/admin/permissions", icon: Lock, permission: "RoleManagement" },
    ]
  },
  {
    title: "Menus",
    items: [
      { name: "Navigation Tree", href: "/admin/menus", icon: LayoutGrid, permission: "MenuManagement" },
    ]
  },
  {
    title: "Security",
    items: [
      { name: "Security Audit", href: "/admin/security/login-attempts", icon: Activity, permission: "SecurityAudit" },
    ]
  },
  {
    title: "System (Dev)",
    items: [
      { name: "System Logs", href: "/admin/logs", icon: Activity, permission: "SecurityAudit" },
      { name: "Settings", href: "/admin/settings", icon: Settings, permission: "*" },
    ]
  }
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const isProd = process.env.NODE_ENV === "production";

  const filteredNavigation = navigation
    .filter(section => {
      // Hide Infrastructure/System (Dev) section in production as it's under construction
      if (isProd && section.title.includes("(Dev)")) return false;
      return true;
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.permission || hasPermission(item.permission))
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className={cn("w-72 border-r border-border/50 bg-background h-screen sticky top-0 flex flex-col z-40 hidden lg:flex", className)}>
      <div className="h-20 flex items-center px-8 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <AppWindow className="text-primary-foreground" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base leading-none">Console</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">SamStore Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-grow overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-border/50">
        {filteredNavigation.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <item.icon 
                        size={20} 
                        className={cn(
                          "transition-colors duration-300",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                        )} 
                      />
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-muted/30 rounded-[2rem] p-4 flex items-center gap-3 border border-border/50 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <UserCircle size={24} />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-xs font-bold truncate">{user?.name || "Loading..."}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">Session Active</p>
          </div>
        </div>
        
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-300 font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Exit Console</span>
        </Link>
      </div>
    </aside>
  );
}
