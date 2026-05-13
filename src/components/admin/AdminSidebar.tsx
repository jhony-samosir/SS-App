"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  Lock,
  Settings,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AppWindow,
  Activity,
  UserCircle,
  Menu as MenuIcon,
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
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutGrid, permission: "Admin" },
    ]
  },
  {
    title: "Users",
    items: [
      { name: "User Management", href: "/admin/users", icon: Users, permission: "Users Read" },
    ]
  },
  {
    title: "Roles",
    items: [
      { name: "Role Policies", href: "/admin/roles", icon: ShieldCheck, permission: "Roles" },
    ]
  },
  {
    title: "Permissions",
    items: [
      { name: "Registry", href: "/admin/permissions", icon: Lock, permission: "Permissions" },
    ]
  },
  {
    title: "Menus",
    items: [
      { name: "Navigation Tree", href: "/admin/menus", icon: AppWindow, permission: "Menus" },
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

// UI state and animations
import { useUIStore } from "@/store/use-ui-store";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, hasPermission, isHydrated } = useAuth();
  const { isAdminSidebarCollapsed: isLocked, toggleAdminSidebar } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  // Effective state: expanded if NOT locked OR if hovered
  const isCollapsed = isLocked && !isHovered;

  if (!isHydrated) return <aside className={cn("w-[72px] border-r border-border/40 bg-background h-screen sticky top-0 lg:flex hidden", className)} />;

  const topNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutGrid, permission: "Admin" },
    { name: "Products", href: "/admin/catalog/products", icon: AppWindow, permission: "Products" },
    { name: "Categories", href: "/admin/catalog/categories", icon: LayoutGrid, permission: "Categories" },
    { name: "Users", href: "/admin/users", icon: Users, permission: "Users Read" },
    { name: "Security", href: "/admin/roles", icon: ShieldCheck, permission: "Roles" },
    { name: "Access", href: "/admin/permissions", icon: Lock, permission: "Permissions" },
  ].filter(item => !item.permission || hasPermission(item.permission));

  const middleNav = [
    { name: "Menus", href: "/admin/menus", icon: AppWindow, permission: "Menus" },
    { name: "Audit", href: "/admin/security/login-attempts", icon: Activity, permission: "SecurityAudit" },
  ].filter(item => !item.permission || hasPermission(item.permission));

  const bottomNav = [
    { name: "Logs", href: "/admin/logs", icon: Activity, permission: "SecurityAudit", devOnly: true },
    { name: "Settings", href: "/admin/settings", icon: Settings, permission: "*" },
  ].filter(item => {
    if (isProd && item.devOnly) return false;
    return !item.permission || hasPermission(item.permission);
  });

  const renderNavItems = (items: typeof topNav) => (
    <div className="flex flex-col gap-1.5 px-3">
      {items.map((item) => {
        const isActive = item.href === "/admin"
          ? pathname === "/admin"
          : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group relative flex items-center rounded-xl transition-all duration-200",
              isCollapsed ? "h-11 w-11 justify-center mx-auto" : "px-3 py-2 gap-3",
              isActive
                ? "bg-primary/[0.06] text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex shrink-0 items-center justify-center transition-all duration-200",
              isCollapsed ? "w-11" : "w-6"
            )}>
              <item.icon
                size={20}
                className={cn(
                  "transition-all duration-200",
                  isActive ? "opacity-100 scale-110" : "opacity-50 group-hover:opacity-100"
                )}
              />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium text-[13px] tracking-tight truncate flex-grow"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>

            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className={cn(
                  "absolute bg-primary rounded-full",
                  isCollapsed ? "bottom-1 w-1 h-1" : "right-3 w-1.5 h-1.5"
                )}
              />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <motion.aside
      initial={false}
      onMouseEnter={() => isLocked && setIsHovered(true)}
      onMouseLeave={() => isLocked && setIsHovered(false)}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className={cn(
        "border-r border-border/40 bg-background h-screen sticky top-0 flex flex-col z-40 hidden lg:flex select-none",
        className
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-105">
            <AppWindow size={20} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-bold text-[13px] tracking-tight truncate leading-tight">SamStore</span>
              <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-widest leading-none">Console</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow overflow-y-auto py-2 space-y-6 custom-scrollbar">
        <div className="space-y-1">
          {renderNavItems(topNav)}
        </div>

        <div className="px-5 opacity-40">
          <div className="h-px bg-border" />
        </div>

        <div className="space-y-1">
          {renderNavItems(middleNav)}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border/40 space-y-1">
        {renderNavItems(bottomNav)}

        <div className={cn(
          "flex items-center gap-3 p-2 transition-all mt-2",
          isCollapsed ? "justify-center" : "px-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex-shrink-0 flex items-center justify-center text-secondary border border-secondary/20">
            <UserCircle size={18} />
          </div>
          {!isCollapsed && (
            <div className="flex-grow min-w-0">
              <p className="text-[12px] font-bold truncate leading-none mb-1">{user?.name || "User"}</p>
              <button
                onClick={toggleAdminSidebar}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isLocked ? "Unlock Sidebar" : "Lock Sidebar"}
              </button>
            </div>
          )}
        </div>

        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-150 font-medium text-[13px]",
            isCollapsed ? "h-11 w-11 justify-center mx-auto" : "px-3 py-2.5"
          )}
        >
          <LogOut size={18} className="shrink-0 opacity-50" />
          {!isCollapsed && <span>Exit</span>}
        </Link>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </motion.aside>
  );
}
