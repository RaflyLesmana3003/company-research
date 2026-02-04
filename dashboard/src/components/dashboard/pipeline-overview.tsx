"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import {
  Zap,
  Download,
  Brain,
  ShieldCheck,
  DatabaseZap,
  ChevronRight,
} from "lucide-react";

interface PipelineOverviewProps {
  stages: DashboardData["pipelineStages"];
  totalProcessed: number;
}

const STAGES = [
  {
    key: "triggered" as const,
    label: "Trigger",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    barColor: "bg-blue-500",
  },
  {
    key: "fetched" as const,
    label: "Fetch",
    icon: Download,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    barColor: "bg-violet-500",
  },
  {
    key: "extracted" as const,
    label: "AI Extract",
    icon: Brain,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    barColor: "bg-amber-500",
  },
  {
    key: "validated" as const,
    label: "Validate",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    barColor: "bg-emerald-500",
  },
  {
    key: "written" as const,
    label: "CRM Write",
    icon: DatabaseZap,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    barColor: "bg-teal-500",
  },
];

export function PipelineOverview({ stages, totalProcessed }: PipelineOverviewProps) {
  const maxCount = Math.max(...Object.values(stages), 1);

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Pipeline Flow</h3>
            <p className="text-sm text-muted-foreground">
              30-day throughput per stage -- drop-off between stages indicates where records are lost
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total processed</p>
            <p className="text-lg font-bold">{formatNumber(totalProcessed)}</p>
          </div>
        </div>

        {/* Pipeline stages - horizontal flow */}
        <div className="flex items-stretch gap-1">
          {STAGES.map((stage, index) => {
            const count = stages[stage.key];
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex items-center flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`p-1 rounded ${stage.bgColor}`}>
                      <Icon className={`h-3 w-3 ${stage.color}`} />
                    </div>
                    <span className="text-[11px] font-medium truncate">
                      {stage.label}
                    </span>
                  </div>
                  <div className="text-lg font-bold tabular-nums">
                    {formatNumber(Math.round(count))}
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {pct.toFixed(0)}% of trigger
                  </p>
                </div>
                {index < STAGES.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
