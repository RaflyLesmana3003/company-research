"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface ConfidenceHistogramProps {
  data: DashboardData["confidenceHistogram"];
  avgConfidence: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { bin: string; color: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">Confidence: {d.payload.bin}%</p>
      <div className="flex items-center gap-2 text-xs">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: d.payload.color }}
        />
        <span className="text-muted-foreground">Records:</span>
        <span className="font-medium">{d.value}</span>
      </div>
    </div>
  );
}

export function ConfidenceHistogram({ data, avgConfidence }: ConfidenceHistogramProps) {
  const totalRecords = data.reduce((sum, d) => sum + d.count, 0);

  if (totalRecords === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Confidence Distribution</h3>
            <p className="text-sm text-muted-foreground">How certain the AI is about extracted data; higher is better</p>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No confidence data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert avg confidence (0-1) to percentage (0-100) for reference line
  const avgPct = avgConfidence * 100;

  // For bar chart category axis, use the bin label directly
  const avgBin = data.find((_, i) => {
    const ranges = [
      [0, 20],
      [20, 40],
      [40, 60],
      [60, 80],
      [80, 100],
    ];
    return avgPct >= ranges[i][0] && avgPct < ranges[i][1];
  })?.bin || "80-100";

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Confidence Distribution</h3>
            <p className="text-sm text-muted-foreground">How certain the AI is about extracted data; higher is better</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-sm font-bold text-foreground">{avgPct.toFixed(1)}%</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis
                dataKey="bin"
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={avgBin}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg: ${avgPct.toFixed(0)}%`,
                  position: "insideTopRight",
                  fill: "#8b5cf6",
                  fontSize: 10,
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/50">
          {data.map((entry) => (
            <div key={entry.bin} className="flex items-center gap-1.5 text-[11px]">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ background: entry.color }}
              />
              <span className="text-muted-foreground">{entry.bin}%:</span>
              <span className="font-medium">
                {entry.count}
                <span className="text-muted-foreground ml-0.5">
                  ({totalRecords > 0 ? ((entry.count / totalRecords) * 100).toFixed(0) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
