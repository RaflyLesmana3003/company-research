"use client";

import { RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  lastUpdated: Date | null;
  countdown: number;
  onRefresh: () => void;
  loading: boolean;
}

export function DashboardHeader({
  lastUpdated,
  countdown,
  onRefresh,
  loading,
}: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Contact Extraction Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Pipeline monitoring & metrics
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Refreshing in {countdown}s
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Badge variant="outline" className="text-[10px] py-0.5 hidden sm:inline-flex">
          Auto-refresh: 30s
        </Badge>
      </div>
    </div>
  );
}
