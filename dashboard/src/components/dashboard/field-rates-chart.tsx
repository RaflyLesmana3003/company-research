"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/lib/types";
import { BarChart3 } from "lucide-react";

const FIELD_COLORS: Record<string, string> = {
  Phone: "#8b5cf6",
  Email: "#3b82f6",
  Address: "#14b8a6",
};

interface FieldRatesChartProps {
  data: DashboardData["fieldRates"];
}

export function FieldRatesChart({ data }: FieldRatesChartProps) {
  const chartData = [
    { field: "Phone", rate: data.phone },
    { field: "Email", rate: data.email },
    { field: "Address", rate: data.address },
  ];

  const allZero = chartData.every((d) => d.rate === 0);

  if (allZero) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Field Extraction Rates</h3>
            <p className="text-sm text-muted-foreground">
              % of records where each contact field was found -- higher means better coverage
            </p>
          </div>
          <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No extraction data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Field Extraction Rates</h3>
          <p className="text-sm text-muted-foreground">
            % of records where each contact field was found -- higher means better coverage
          </p>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                className="stroke-border"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="field"
                tick={{ fill: "var(--foreground)", fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={28}>
                {chartData.map((entry) => (
                  <Cell key={entry.field} fill={FIELD_COLORS[entry.field]} />
                ))}
                <LabelList
                  dataKey="rate"
                  position="right"
                  formatter={(v) => `${Number(v).toFixed(1)}%`}
                  style={{ fontSize: 12, fontWeight: 600, fill: "var(--foreground)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Avg Confidence: {data.avgConfidence.toFixed(2)}</span>
          <span>Avg Fields: {data.avgFieldsFound.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
