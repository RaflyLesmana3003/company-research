"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { TrendingDown } from "lucide-react";

interface ErrorRateTrendProps {
  data: DashboardData["errorRateTrend"];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">{label ? formatDate(label) : ""}</p>
      <div className="flex items-center gap-2 text-xs">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-muted-foreground">Error Rate:</span>
        <span className="font-medium text-red-500">{d.value.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function ErrorRateTrend({ data }: ErrorRateTrendProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const avgErrorRate =
    sorted.length > 0
      ? sorted.reduce((sum, d) => sum + d.errorRate, 0) / sorted.length
      : 0;

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Error Rate Trend</h3>
            <p className="text-sm text-muted-foreground">Daily error % over time</p>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <TrendingDown className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No error data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Error Rate Trend</h3>
            <p className="text-sm text-muted-foreground">Daily error % over time -- below 5% is healthy, above 10% needs attention</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">30d avg</p>
            <p className={`text-sm font-bold ${avgErrorRate > 10 ? "text-red-500" : avgErrorRate > 5 ? "text-amber-500" : "text-emerald-500"}`}>
              {avgErrorRate.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sorted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={avgErrorRate}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Avg ${avgErrorRate.toFixed(1)}%`,
                  position: "insideTopRight",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.15}
                strokeWidth={2}
                name="Error Rate"
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
