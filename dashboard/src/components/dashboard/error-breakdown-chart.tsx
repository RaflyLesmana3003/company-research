"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

const ERROR_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#a3a3a3"];

interface ErrorBreakdownChartProps {
  data: DashboardData["errorBreakdown"];
}

export function ErrorBreakdownChart({ data }: ErrorBreakdownChartProps) {
  const totalErrors = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0 || totalErrors === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Errors by Type</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm">No errors in this period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit to top 5, group rest as "Other"
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 5);

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Errors by Type</h3>
          <p className="text-sm text-muted-foreground">Last 30 days -- "r" values show avg retries before failure</p>
        </div>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="type"
                stroke="none"
              >
                {top.map((_, index) => (
                  <Cell key={index} fill={ERROR_COLORS[index % ERROR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} occurrences`,
                  String(name),
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-red-500">{totalErrors}</span>
            <span className="text-[10px] text-muted-foreground">total errors</span>
          </div>
        </div>
        <div className="space-y-1 mt-2">
          {top.map((entry, i) => (
            <div key={entry.type} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: ERROR_COLORS[i % ERROR_COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{entry.type}</span>
              <span className="text-muted-foreground/60 ml-auto mr-2" title="avg retries">
                {entry.avgRetries > 0 ? `${entry.avgRetries.toFixed(1)}r` : ""}
              </span>
              <span className="font-medium">{entry.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
