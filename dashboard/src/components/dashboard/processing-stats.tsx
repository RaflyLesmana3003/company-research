"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import {
  Timer,
  Zap,
  Snail,
  RotateCcw,
  Layers,
  Clock,
} from "lucide-react";

interface ProcessingStatsProps {
  stats: DashboardData["processingStats"];
}

export function ProcessingStats({ stats }: ProcessingStatsProps) {
  const items = [
    {
      label: "Avg Processing Time",
      value: formatDuration(stats.avgProcessingTime),
      subLabel: "per company",
      icon: Timer,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Median Time",
      value: formatDuration(stats.medianProcessingTime),
      subLabel: "typical run duration",
      icon: Clock,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Fastest Run",
      value: formatDuration(stats.fastestRun),
      subLabel: "best case",
      icon: Zap,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Slowest Run",
      value: formatDuration(stats.slowestRun),
      subLabel: "worst case",
      icon: Snail,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Total Retries",
      value: String(stats.totalRetries),
      subLabel: "0 is ideal",
      icon: RotateCcw,
      color: stats.totalRetries > 0 ? "text-red-500" : "text-emerald-500",
      bgColor: stats.totalRetries > 0 ? "bg-red-500/10" : "bg-emerald-500/10",
    },
    {
      label: "Queue Depth",
      value: String(stats.queueDepth),
      subLabel: "waiting to process",
      icon: Layers,
      color: stats.queueDepth > 0 ? "text-blue-500" : "text-muted-foreground",
      bgColor: stats.queueDepth > 0 ? "bg-blue-500/10" : "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate">
                {item.label}
              </span>
            </div>
            <div className={`text-lg font-bold tracking-tight ${item.color}`}>
              {item.value}
            </div>
            {item.subLabel && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.subLabel}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
