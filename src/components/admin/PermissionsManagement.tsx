import { Info } from "lucide-react";
import { ADMIN_PERMISSIONS } from "@/lib/constants";
import { PermissionCard } from "./PermissionCard";

/**
 * PermissionsManagement Component
 * 
 * Displays the system-wide RBAC permission registry.
 * Note: This is a Server Component. Interactive/animated elements are delegated to PermissionCard.
 * 
 * TODO: Integrate with SS-AuthService API once the /api/permissions endpoint is finalized
 * to fetch dynamic permission definitions instead of using local constants.
 */
export function PermissionsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Permission Registry</h1>
          <p className="text-muted-foreground">System-wide RBAC permission identifiers and definitions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_PERMISSIONS.map((permission, index) => (
          <PermissionCard 
            key={permission} 
            permission={permission} 
            index={index} 
          />
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-primary mb-1">Architecture Note</h4>
          <p className="text-sm text-primary/70 leading-relaxed">
            These permissions are statically defined in the system core. They are used across the backend microservices (via JWT scope validation) and the frontend (via the AdminGuard and permission-filtering components) to enforce strict Access Control Policies.
          </p>
        </div>
      </div>
    </div>
  );
}
