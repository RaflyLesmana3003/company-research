"use client";

import type { DashboardData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  AlertCircle,
  Layers,
  Shield,
} from "lucide-react";

interface SystemHealthStripProps {
  health: DashboardData["systemHealth"];
}

const STATUS_CONFIG = {
  healthy: {
    icon: CheckCircle2,
    label: "All Systems Operational",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    textClass: "text-emerald-500",
    dotClass: "bg-emerald-500",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Degraded Performance",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    textClass: "text-amber-500",
    dotClass: "bg-amber-500",
  },
  down: {
    icon: XCircle,
    label: "System Down",
    bgClass: "bg-red-500/10 border-red-500/20",
    textClass: "text-red-500",
    dotClass: "bg-red-500",
  },
};

export function SystemHealthStrip({ health }: SystemHealthStripProps) {
  const config = STATUS_CONFIG[health.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 rounded-lg border ${config.bgClass}`}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
          {health.status === "healthy" && (
            <div className={`absolute w-2 h-2 rounded-full ${config.dotClass} animate-ping`} />
          )}
        </div>
        <StatusIcon className={`h-3.5 w-3.5 ${config.textClass}`} />
        <span className={`text-xs font-semibold ${config.textClass}`}>
          {config.label}
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Last successful run */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Last success:</span>
        <span className="font-medium text-foreground">
          {health.lastSuccessfulRun
            ? formatRelativeTime(health.lastSuccessfulRun)
            : "No runs yet"}
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Active errors */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        <span>Errors (24h):</span>
        <span
          className={`font-medium ${
            health.activeErrorCount > 0 ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {health.activeErrorCount}
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Queue depth */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Layers className="h-3 w-3" />
        <span>Queue:</span>
        <span
          className={`font-medium ${
            health.queueDepth > 0 ? "text-blue-500" : "text-foreground"
          }`}
        >
          {health.queueDepth} pending
        </span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Uptime */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Uptime:</span>
        <span className="font-medium text-foreground">
          {health.uptimePercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
