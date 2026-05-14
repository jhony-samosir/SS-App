"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  Lock,
  Unlock,
  Settings,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  LogOut,
  AppWindow,
  Activity,
  UserCircle,
  Menu as MenuIcon,
  Tag,
  Warehouse,
  Package,
  Database,
  MessageSquare,
  Layers,
  FileUp,
  FileText,
  LucideIcon,
  HelpCircle,
  Sparkles,
  Command,
  Monitor,
  Box,
  Truck,
  Grid,
  ClipboardList,
  CreditCard,
  ShoppingBag,
  Bell,
  Search,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store/use-ui-store";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";

const iconMap: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  "package": Package,
  "layers": Layers,
  "tag": Tag,
  "settings": Settings,
  "warehouse": Warehouse,
  "database": Database,
  "message-square": MessageSquare,
  "users": Users,
  "shield-check": ShieldCheck,
  "lock": Lock,
  "app-window": AppWindow,
  "activity": Activity,
  "file-up": FileUp,
  "file-text": FileText,
  "sparkles": Sparkles,
  "shopping-bag": ShoppingBag,
  "clipboard-list": ClipboardList,
  "credit-card": CreditCard,
  "bell": Bell,
  "zap": Zap,
  "grid": Grid,
};

interface MenuTreeDto {
  publicId: string;
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  children: MenuTreeDto[];
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, hasPermission, isHydrated } = useAuth();
  const { isAdminSidebarCollapsed: isLocked, toggleAdminSidebar } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [menus, setMenus] = useState<MenuTreeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const isCollapsed = isLocked && !isHovered;

  useEffect(() => {
    if (!isHydrated) return;
    const fetchMenus = async () => {
      try {
        const response = await apiClient.get<MenuTreeDto[]>("/api/menus/tree");
        setMenus(response.data);
      } catch (error) {
        console.error("Failed to fetch sidebar menus:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenus();
  }, [isHydrated]);

  const navigation = useMemo(() => {
    return menus
      .filter(m => m.path.startsWith("/"))
      .map(section => ({
        id: section.publicId,
        title: section.name,
        path: section.path,
        icon: section.icon ? (iconMap[section.icon] || HelpCircle) : LayoutGrid,
        children: section.children.filter(c => c.path.startsWith("/")).map(child => ({
          name: child.name,
          href: child.path,
          icon: child.icon ? (iconMap[child.icon] || HelpCircle) : LayoutGrid,
          permission: child.name
        }))
      }));
  }, [menus]);

  useEffect(() => {
    const activeParents: Record<string, boolean> = {};
    navigation.forEach(section => {
      if (section.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"))) {
        activeParents[section.id] = true;
      }
    });
    setOpenMenus(prev => ({ ...prev, ...activeParents }));
  }, [pathname, navigation]);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isHydrated || isLoading) {
    return (
      <aside className={cn("w-[76px] border-r border-border/40 bg-background/50 h-screen sticky top-0 lg:flex hidden flex-col items-center py-6 gap-6", className)}>
        <div className="w-10 h-10 bg-muted animate-pulse rounded-2xl" />
        <div className="flex-grow space-y-4 w-full px-4 mt-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-10 w-full bg-muted/20 animate-pulse rounded-xl" />)}
        </div>
      </aside>
    );
  }

  const renderNavItems = (items: { name: string; href: string; icon: LucideIcon; permission: string }[], isSubItem = false) => (
    <div className={cn("flex flex-col gap-0.5", isSubItem ? "pl-11 pr-2 my-1 relative" : "")}>
      {isSubItem && (
        <div className="absolute left-[26px] top-0 bottom-2 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
      )}
      {items
        .filter(item => {
          // Bypass check for Admin
          const userRole = user?.roleName;
          if (userRole === "Admin") return true;

          return !item.permission || hasPermission(item.permission) || hasPermission(`${item.permission} Read`);
        })
        .map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
            className={cn(
              "group relative flex items-center rounded-2xl transition-all duration-500",
              isCollapsed ? "h-12 w-12 justify-center mx-auto" : cn("w-full px-4 py-3 gap-3", isSubItem ? "py-2" : "py-3.5"),
              isActive
                ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] border border-primary/20"
                : "text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground"
            )}
            >
              {isActive && isSubItem && (
                <motion.div
                  layoutId={`sub-active-${item.name}`}
                  className="absolute left-[-15px] w-2 h-px bg-primary"
                />
              )}

              <div className={cn(
                "flex shrink-0 items-center justify-center transition-all duration-300",
                isCollapsed ? "w-11" : "w-5"
              )}>
                <item.icon
                  size={isSubItem ? 15 : 18}
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "opacity-100 scale-110 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "opacity-30 group-hover:opacity-100"
                  )}
                />
              </div>

              {!isCollapsed && (
                <span className={cn(
                  "font-bold tracking-tight truncate flex-grow transition-all",
                  isSubItem ? "text-[12px]" : "text-[13.5px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              )}

              {isActive && !isCollapsed && !isSubItem && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.8)]"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
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
      animate={{ width: isCollapsed ? 76 : 280 }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
      className={cn(
        "border-r border-border/5 bg-background/80 backdrop-blur-[40px] h-screen sticky top-0 flex flex-col z-40 hidden lg:flex select-none shadow-[25px_0_50px_-12px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      {/* Brand Header */}
      <div className={cn("h-28 flex items-center relative overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-40" />
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
        
        <Link href="/" className={cn("flex items-center gap-4 group min-w-0 relative z-10", isCollapsed ? "justify-center w-full" : "")}>
          <div className={cn(
            "bg-gradient-to-tr from-primary to-primary/40 text-white flex-shrink-0 flex items-center justify-center shadow-[0_8px_30px_rgb(var(--primary)/0.3)] border border-white/10 transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110",
            isCollapsed ? "w-11 h-11 rounded-[16px]" : "w-14 h-14 rounded-[22px]"
          )}>
            <Command size={isCollapsed ? 22 : 28} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col min-w-0">
              <span className="font-black text-[22px] tracking-tighter truncate leading-none text-foreground uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
                SamStore
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0 opacity-40" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 relative shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
                <span className="text-[11px] font-black text-muted-foreground/60 truncate uppercase tracking-[0.5em] leading-none">
                  Core v4
                </span>
              </div>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow overflow-y-auto py-4 space-y-3 custom-scrollbar px-3">
        {navigation.map((section) => {
          const hasChildren = section.children.length > 0;
          const isOpen = openMenus[section.id];
          const isParentActive = section.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"));

          return (
            <div key={section.id} className="space-y-1">
              {hasChildren ? (
                <>
                  <button
                    onClick={() => !isCollapsed && toggleMenu(section.id)}
                    className={cn(
                      "group relative flex items-center rounded-2xl transition-all duration-500",
                      isCollapsed ? "h-12 w-12 justify-center mx-auto" : "w-full px-4 py-4 gap-3",
                      isParentActive ? "text-primary bg-primary/[0.03] border border-primary/10 shadow-inner" : "text-muted-foreground/60 hover:bg-muted/20"
                    )}
                  >
                    <div className={cn("flex shrink-0 items-center justify-center transition-all duration-500", isCollapsed ? "w-12" : "w-5", isParentActive && "scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>
                      <section.icon size={20} className={cn(isParentActive ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-black text-[13px] tracking-[0.2em] truncate flex-grow text-left uppercase">
                          {section.title}
                        </span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <ChevronDown size={14} className="opacity-30" />
                        </motion.div>
                      </>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && !isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                        className="overflow-hidden"
                      >
                        {renderNavItems(section.children, true)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                renderNavItems([{
                  name: section.title,
                  href: section.path,
                  icon: section.icon,
                  permission: section.title
                }])
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Details */}
      <div className="p-5 border-t border-border/10 bg-muted/5 backdrop-blur-xl">
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-[24px] transition-all duration-500 border border-white/5 bg-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
          isCollapsed ? "justify-center px-2" : "px-5"
        )}>
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-primary to-primary/40 flex-shrink-0 flex items-center justify-center text-white shadow-[0_4px_20px_rgb(var(--primary)/0.3)] border border-white/20">
            <UserCircle size={24} />
          </div>
          {!isCollapsed && (
            <div className="flex-grow min-w-0">
              <p className="text-[14px] font-black truncate text-foreground leading-tight uppercase italic tracking-tight">{user?.name || "Administrator"}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">System Master</p>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button 
              onClick={toggleAdminSidebar} 
              className="flex items-center justify-center gap-2 py-3 text-[11px] text-muted-foreground/80 hover:text-primary bg-background/30 hover:bg-primary/10 rounded-2xl transition-all duration-300 font-black border border-border/10 hover:border-primary/20 uppercase tracking-widest"
            >
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{isLocked ? "UNLOCK" : "LOCK"}</span>
            </button>
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 py-3 text-[11px] text-destructive/80 hover:text-destructive hover:bg-destructive/10 bg-background/30 rounded-2xl transition-all duration-300 font-black border border-border/10 hover:border-destructive/20 uppercase tracking-widest"
            >
              <LogOut size={14} />
              <span>EXIT</span>
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.15);
          border-radius: 100px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.3);
        }
      `}</style>
    </motion.aside>
  );
}
