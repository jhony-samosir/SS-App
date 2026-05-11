"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Dashboard",
  users: "Users",
  roles: "Roles",
  menus: "Menus",
  security: "Security",
  "login-attempts": "Login Activity",
  settings: "Settings",
  logs: "System Logs",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  /**
   * TODO: Implement dynamic route mapping.
   * Instead of a static SEGMENT_LABELS map, we should use a centralized route configuration 
   * or fetch metadata from the active route to ensure scalability as the application grows.
   */

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
      <Link
        href="/admin"
        className="hover:text-primary transition-colors flex items-center gap-1.5"
      >
        <Home size={14} />
        <span>Admin</span>
      </Link>

      {segments.length > 1 && (
        <ChevronRight size={14} className="text-muted-foreground/30" />
      )}

      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join("/")}`;
        const isLast = index === segments.length - 2;
        
        // Better name generation
        let name = SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        
        // Detect UUID or ID pattern
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || /^\d+$/.test(segment)) {
          name = isLast ? "Details" : "Resource";
        }

        return (
          <div key={href} className="flex items-center space-x-1">
            <Link
              href={href}
              className={cn(
                "hover:text-primary transition-colors capitalize",
                isLast && "text-foreground font-bold pointer-events-none"
              )}
            >
              {name}
            </Link>
            {!isLast && (
              <ChevronRight size={14} className="text-muted-foreground/30" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
