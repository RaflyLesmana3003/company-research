"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import type { DashboardData } from "@/lib/types";
import { formatDuration, formatRelativeTime, formatPercent } from "@/lib/format";
import { ChevronDown, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  running: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  failed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

interface RunsTableProps {
  data: DashboardData["recentRuns"];
}

function ExpandedRow({ run }: { run: DashboardData["recentRuns"][0] }) {
  const successRate =
    run.companiesProcessed > 0
      ? (run.companiesSuccessful / run.companiesProcessed) * 100
      : 0;
  const failRate =
    run.companiesProcessed > 0
      ? (run.companiesFailed / run.companiesProcessed) * 100
      : 0;
  const skipRate =
    run.companiesProcessed > 0
      ? (run.companiesSkipped / run.companiesProcessed) * 100
      : 0;

  return (
    <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={10} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Success breakdown */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Success Breakdown
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-500">Successful</span>
                <span className="font-medium">
                  {run.companiesSuccessful} ({successRate.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={successRate}
                className="h-1.5 bg-muted [&>div]:bg-emerald-500"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-500">Failed</span>
                <span className="font-medium">
                  {run.companiesFailed} ({failRate.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={failRate}
                className="h-1.5 bg-muted [&>div]:bg-red-500"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Skipped</span>
                <span className="font-medium">
                  {run.companiesSkipped} ({skipRate.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={skipRate}
                className="h-1.5 bg-muted [&>div]:bg-muted-foreground"
              />
            </div>
          </div>

          {/* Timing details */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Timing
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-mono">
                  {new Date(run.startedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-mono">
                  {run.completedAt
                    ? new Date(run.completedAt).toLocaleString()
                    : "In progress..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {run.duration ? formatDuration(run.duration) : "--"}
                </span>
              </div>
              {run.companiesProcessed > 0 && run.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per company</span>
                  <span className="font-medium">
                    {formatDuration(run.duration / run.companiesProcessed)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Run metadata */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Metadata
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Run ID</span>
                <span className="font-mono text-muted-foreground">{run.runId || "--"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trigger</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {run.triggerType}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    STATUS_STYLES[run.status] || STATUS_STYLES.waiting
                  }`}
                >
                  {run.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RunsTable({ data }: RunsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (runId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  };

  const statusCounts = data.reduce<Record<string, number>>((acc, run) => {
    const s = run.status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const runsWithDuration = data.filter((r) => r.duration !== null);
  const avgDuration =
    runsWithDuration.length > 0
      ? runsWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) /
        runsWithDuration.length
      : 0;

  // Aggregate footer stats
  const totalProcessed = data.reduce((s, r) => s + r.companiesProcessed, 0);
  const totalSuccessful = data.reduce((s, r) => s + r.companiesSuccessful, 0);
  const totalFailed = data.reduce((s, r) => s + r.companiesFailed, 0);
  const totalSkipped = data.reduce((s, r) => s + r.companiesSkipped, 0);
  const overallSuccessRate =
    totalProcessed > 0 ? (totalSuccessful / totalProcessed) * 100 : 0;

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Recent Workflow Runs</h3>
            <p className="text-sm text-muted-foreground">
              Last {data.length} runs -- click any row for timing and breakdown details
            </p>
          </div>
        </div>
        {data.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    STATUS_STYLES[status] || STATUS_STYLES.waiting
                  }`}
                >
                  {status}
                </Badge>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            <span className="text-muted-foreground ml-auto">
              Avg duration:{" "}
              <span className="font-medium text-foreground">
                {formatDuration(avgDuration)}
              </span>
            </span>
          </div>
        )}
        <div className="overflow-x-auto -mx-5 px-5">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium w-8" />
                <TableHead className="text-xs font-medium">Status</TableHead>
                <TableHead className="text-xs font-medium">Run ID</TableHead>
                <TableHead className="text-xs font-medium">Started</TableHead>
                <TableHead className="text-xs font-medium">Duration</TableHead>
                <TableHead className="text-xs font-medium text-right">
                  Processed
                </TableHead>
                <TableHead className="text-xs font-medium text-right">
                  Success
                </TableHead>
                <TableHead className="text-xs font-medium text-right">
                  Failed
                </TableHead>
                <TableHead className="text-xs font-medium text-center">
                  Success Rate
                </TableHead>
                <TableHead className="text-xs font-medium">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No workflow runs yet
                  </TableCell>
                </TableRow>
              ) : (
                data.map((run) => {
                  const successRate =
                    run.companiesProcessed > 0
                      ? (run.companiesSuccessful / run.companiesProcessed) * 100
                      : 0;
                  const isExpanded = expandedRows.has(run.runId);

                  return (
                    <React.Fragment key={run.runId}>
                      <TableRow
                        className="border-border/50 cursor-pointer"
                        tabIndex={0}
                        role="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleRow(run.runId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleRow(run.runId);
                          }
                        }}
                      >
                        <TableCell className="w-8 pr-0">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              STATUS_STYLES[run.status] || STATUS_STYLES.waiting
                            }`}
                          >
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {run.runId ? `${run.runId.slice(0, 8)}...` : "--"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatRelativeTime(run.startedAt)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {run.duration ? formatDuration(run.duration) : "--"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">
                          {run.companiesProcessed}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <span
                            className={
                              successRate >= 90
                                ? "text-emerald-600"
                                : successRate >= 70
                                ? "text-amber-600"
                                : "text-red-600"
                            }
                          >
                            {run.companiesSuccessful}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {run.companiesFailed > 0 ? (
                            <span className="text-red-600">{run.companiesFailed}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={successRate}
                              className={`h-1.5 flex-1 bg-muted ${
                                successRate >= 90
                                  ? "[&>div]:bg-emerald-500"
                                  : successRate >= 70
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-red-500"
                              }`}
                            />
                            <span
                              className={`text-[11px] font-medium w-10 text-right ${
                                successRate >= 90
                                  ? "text-emerald-500"
                                  : successRate >= 70
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            >
                              {formatPercent(successRate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {run.triggerType}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <ExpandedRow run={run} />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
            {data.length > 0 && (
              <TableFooter>
                <TableRow className="border-border/50 bg-muted/20">
                  <TableCell colSpan={5} className="text-xs font-medium">
                    Totals ({data.length} runs)
                  </TableCell>
                  <TableCell className="text-xs text-right font-bold">
                    {totalProcessed}
                  </TableCell>
                  <TableCell className="text-xs text-right font-bold text-emerald-500">
                    {totalSuccessful}
                  </TableCell>
                  <TableCell className="text-xs text-right font-bold text-red-500">
                    {totalFailed > 0 ? totalFailed : 0}
                  </TableCell>
                  <TableCell className="text-xs text-center">
                    <span
                      className={`font-bold ${
                        overallSuccessRate >= 90
                          ? "text-emerald-500"
                          : overallSuccessRate >= 70
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatPercent(overallSuccessRate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {totalSkipped} skipped
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
