"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  LayoutDashboard,
  Menu as MenuIcon
} from "lucide-react";

const navigation = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Roles", href: "/admin/roles", icon: ShieldCheck },
  { name: "Security", href: "/admin/security/login-attempts", icon: Lock },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="text-primary bg-primary/10 p-2 rounded-xl">
          <MenuIcon size={20} />
        </div>
        <span className="font-bold tracking-tight font-heading text-lg">Admin Console</span>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary")} size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}
