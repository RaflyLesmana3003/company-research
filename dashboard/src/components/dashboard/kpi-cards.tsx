"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatNumber, formatPercent, formatConfidence } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import {
  Building2,
  CheckCircle2,
  Brain,
  DatabaseZap,
  SearchCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface KpiCardsProps {
  summary: DashboardData["summary"];
  sparklines: DashboardData["kpiSparklines"];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 20;
  const padding = 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on last point */}
      {data.length > 0 && (
        <circle
          cx={padding + ((data.length - 1) / (data.length - 1)) * (width - 2 * padding)}
          cy={height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding)}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}

function TrendArrow({ data }: { data: number[] }) {
  if (data.length < 2) return <Minus className="h-3 w-3 text-muted-foreground" />;

  const recent = data.slice(-3).reduce((s, v) => s + v, 0) / Math.min(data.length, 3);
  const older = data.slice(0, Math.max(1, data.length - 3)).reduce((s, v) => s + v, 0) / Math.max(1, data.length - 3);
  const diff = recent - older;
  const pctChange = older > 0 ? (diff / older) * 100 : 0;

  if (Math.abs(pctChange) < 1) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <Minus className="h-2.5 w-2.5" />
        <span>--</span>
      </span>
    );
  }

  if (pctChange > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
        <TrendingUp className="h-2.5 w-2.5" />
        <span>+{pctChange.toFixed(1)}%</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 text-[10px] text-red-500">
      <TrendingDown className="h-2.5 w-2.5" />
      <span>{pctChange.toFixed(1)}%</span>
    </span>
  );
}

export function KpiCards({ summary, sparklines }: KpiCardsProps) {
  const dataFoundTotal = summary.dataFoundCount + summary.noDataCount;
  const dataFoundRate = dataFoundTotal > 0 ? (summary.dataFoundCount / dataFoundTotal) * 100 : 0;

  const cards = [
    {
      label: "Companies Processed",
      value: formatNumber(summary.totalProcessed),
      subLabel: `${formatNumber(summary.totalProcessed7d)} last 7d`,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      sparkColor: "#3b82f6",
      sparkData: sparklines.throughput,
      progress: null as number | null,
      progressColor: "",
    },
    {
      label: "Success Rate",
      value: formatPercent(summary.successRate),
      subLabel: `of ${formatNumber(summary.totalProcessed30d)} in 30d`,
      icon: CheckCircle2,
      color:
        summary.successRate >= 90
          ? "text-emerald-500"
          : summary.successRate >= 70
          ? "text-amber-500"
          : "text-red-500",
      bgColor:
        summary.successRate >= 90
          ? "bg-emerald-500/10"
          : summary.successRate >= 70
          ? "bg-amber-500/10"
          : "bg-red-500/10",
      sparkColor: summary.successRate >= 90 ? "#10b981" : summary.successRate >= 70 ? "#f59e0b" : "#ef4444",
      sparkData: sparklines.successRate,
      progress: summary.successRate,
      progressColor:
        summary.successRate >= 90
          ? "[&>div]:bg-emerald-500"
          : summary.successRate >= 70
          ? "[&>div]:bg-amber-500"
          : "[&>div]:bg-red-500",
    },
    {
      label: "Data Found Rate",
      value: dataFoundTotal > 0 ? formatPercent(dataFoundRate) : "--",
      subLabel: `${formatNumber(summary.dataFoundCount)} found / ${formatNumber(summary.noDataCount)} empty`,
      icon: SearchCheck,
      color:
        dataFoundRate >= 80
          ? "text-emerald-500"
          : dataFoundRate >= 50
          ? "text-amber-500"
          : "text-red-500",
      bgColor:
        dataFoundRate >= 80
          ? "bg-emerald-500/10"
          : dataFoundRate >= 50
          ? "bg-amber-500/10"
          : "bg-red-500/10",
      sparkColor: dataFoundRate >= 80 ? "#10b981" : dataFoundRate >= 50 ? "#f59e0b" : "#ef4444",
      sparkData: sparklines.dataFound,
      progress: dataFoundRate,
      progressColor:
        dataFoundRate >= 80
          ? "[&>div]:bg-emerald-500"
          : dataFoundRate >= 50
          ? "[&>div]:bg-amber-500"
          : "[&>div]:bg-red-500",
    },
    {
      label: "Avg Confidence",
      value: formatConfidence(summary.avgConfidence),
      subLabel: "across all extractions",
      icon: Brain,
      color:
        summary.avgConfidence >= 0.8
          ? "text-emerald-500"
          : summary.avgConfidence >= 0.6
          ? "text-amber-500"
          : "text-red-500",
      bgColor:
        summary.avgConfidence >= 0.8
          ? "bg-emerald-500/10"
          : summary.avgConfidence >= 0.6
          ? "bg-amber-500/10"
          : "bg-red-500/10",
      sparkColor: summary.avgConfidence >= 0.8 ? "#10b981" : summary.avgConfidence >= 0.6 ? "#f59e0b" : "#ef4444",
      sparkData: sparklines.confidence,
      progress: summary.avgConfidence * 100,
      progressColor:
        summary.avgConfidence >= 0.8
          ? "[&>div]:bg-emerald-500"
          : summary.avgConfidence >= 0.6
          ? "[&>div]:bg-amber-500"
          : "[&>div]:bg-red-500",
    },
    {
      label: "CRM Write-Back",
      value: formatPercent(summary.crmWriteBackRate),
      subLabel: summary.crmPending > 0 ? `${summary.crmPending} pending` : "all confirmed",
      icon: DatabaseZap,
      color:
        summary.crmWriteBackRate >= 90
          ? "text-emerald-500"
          : "text-amber-500",
      bgColor:
        summary.crmWriteBackRate >= 90
          ? "bg-emerald-500/10"
          : "bg-amber-500/10",
      sparkColor: summary.crmWriteBackRate >= 90 ? "#10b981" : "#f59e0b",
      sparkData: sparklines.crmRate,
      progress: summary.crmWriteBackRate,
      progressColor:
        summary.crmWriteBackRate >= 90
          ? "[&>div]:bg-emerald-500"
          : "[&>div]:bg-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className={`text-2xl font-bold tracking-tight ${card.color}`}>
                  {card.value}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground truncate">{card.subLabel}</p>
                  <TrendArrow data={card.sparkData} />
                </div>
              </div>
              <div className="shrink-0 pb-1">
                <MiniSparkline data={card.sparkData} color={card.sparkColor} />
              </div>
            </div>
            {card.progress !== null && (
              <Progress
                value={card.progress}
                className={`h-1 mt-3 bg-muted ${card.progressColor}`}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
