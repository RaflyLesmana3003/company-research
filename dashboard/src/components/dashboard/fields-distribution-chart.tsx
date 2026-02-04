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
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

interface FieldsDistributionChartProps {
  data: DashboardData["fieldsDistribution"];
  avgFieldsFound: number;
}

export function FieldsDistributionChart({
  data,
  avgFieldsFound,
}: FieldsDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Fields Found</h3>
            <p className="text-sm text-muted-foreground">How many of 3 fields (phone, email, address) each record has</p>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <PieChartIcon className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No distribution data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Fields Found</h3>
          <p className="text-sm text-muted-foreground">How many of 3 fields (phone, email, address) each record has</p>
        </div>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value} (${total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0}%)`,
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
            <span className="text-2xl font-bold">{avgFieldsFound.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">Avg Fields</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: COLORS[i] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
