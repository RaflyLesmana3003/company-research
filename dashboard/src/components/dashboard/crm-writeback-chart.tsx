"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { DatabaseZap } from "lucide-react";

interface CrmWritebackChartProps {
  data: DashboardData["crmDaily"];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1.5">{label ? formatDate(label) : ""}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.dataKey === "writeRate"
              ? `${entry.value.toFixed(1)}%`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CrmWritebackChart({ data }: CrmWritebackChartProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">CRM Write-Back</h3>
            <p className="text-sm text-muted-foreground">
              Records pushed to HubSpot: confirmed, pending, or failed per day
            </p>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <DatabaseZap className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No CRM data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">CRM Write-Back</h3>
          <p className="text-sm text-muted-foreground">
            Records pushed to HubSpot: confirmed, pending, or failed per day
          </p>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sorted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                yAxisId="left"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              />
              <Bar
                yAxisId="left"
                dataKey="confirmed"
                stackId="crm"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
                name="Confirmed"
              />
              <Bar
                yAxisId="left"
                dataKey="pending"
                stackId="crm"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
                name="Pending"
              />
              <Bar
                yAxisId="left"
                dataKey="errors"
                stackId="crm"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Errors"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="writeRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6" }}
                name="Write Rate %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
