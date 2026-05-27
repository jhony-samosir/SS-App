"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Shield, 
  Activity, 
  Key, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { userService } from "@/services/user-service";
import { securityService } from "@/services/security-service";
import { roleService } from "@/services/role-service";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardOverview() {
  // 1. Fetch Stats
  const { data: usersData } = useQuery({
    queryKey: ["admin-stats-users"],
    queryFn: () => userService.getUsers(1, 1),
  });

  const { data: rolesData } = useQuery({
    queryKey: ["admin-stats-roles"],
    queryFn: () => roleService.getRoles(1, 1),
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["admin-stats-logs"],
    queryFn: () => securityService.getLoginAttempts(1, 5),
  });

  const stats = [
    { 
      title: "Total Users", 
      value: usersData?.totalCount || "...", 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      trend: "+12% this month"
    },
    { 
      title: "System Roles", 
      value: rolesData?.totalCount || "...", 
      icon: Shield, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      trend: "Stable"
    },
    { 
      title: "Security Events", 
      value: recentLogs?.totalCount || "...", 
      icon: Activity, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      trend: "4 critical today"
    },
    { 
      title: "Uptime", 
      value: "99.9%", 
      icon: TrendingUp, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      trend: "Health: Excellent"
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight font-heading">Console Overview</h1>
        <p className="text-muted-foreground text-lg">System health, user activity, and security auditing dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-black">{stat.value}</span>
                  <span className="text-xs font-medium opacity-60 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold font-heading">Recent Security Audit</h2>
            <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all shrink-0">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border shadow-2xl overflow-hidden">
            <div className="p-2">
              {recentLogs?.items?.map(log => (
                <div 
                  key={log.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-muted/50 group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                      {log.isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{log.email}</span>
                      <span className="text-xs text-muted-foreground font-mono truncate">{log.ipAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs font-bold">{log.isSuccess ? "Login Successful" : "Failed Attempt"}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
              
              {!recentLogs?.items?.length && (
                <div className="py-20 flex flex-col items-center gap-2 text-muted-foreground">
                  <Activity size={40} className="opacity-20 animate-pulse" />
                  <p className="text-sm font-medium">No recent security events found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Health Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-heading">Platform Health</h2>
          <div className="bg-linear-to-br from-primary/10 via-background to-background rounded-3xl border border-primary/20 shadow-2xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Auth Service</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Healthy</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">API Gateway</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Healthy</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Catalog Service</span>
                <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Degraded</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-[10px] text-muted-foreground bg-orange-500/5 p-2 rounded-lg border border-orange-500/10 break-words leading-tight">
                Warning: Background worker for media processing is currently unreachable.
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                   <Key size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase">Keys Rotation</span>
                  <span className="text-[10px] text-muted-foreground">Last rotated: 4 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
