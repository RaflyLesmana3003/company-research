"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DashboardData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react";

interface RecentErrorsProps {
  data: DashboardData["recentErrors"];
}

export function RecentErrors({ data }: RecentErrorsProps) {
  const [isOpen, setIsOpen] = useState(data.length > 0);

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-2">
              {data.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              <span className="text-sm font-medium">
                Recent Errors
                {data.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                    {data.length}
                  </Badge>
                )}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {data.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No errors in the selected period
              </div>
            ) : (
              <div className="space-y-2">
                {data.map((err) => (
                  <div
                    key={err.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                      >
                        {err.type}
                      </Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {err.crmRecordId || "--"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(err.timestamp)}
                        </span>
                        {err.retryCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {err.retryCount} retries
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {err.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
