"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function SectionSkeleton() {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex items-center gap-2.5 shrink-0">
        <Skeleton className="h-7 w-7 rounded-md" />
        <div>
          <Skeleton className="h-4 w-28 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Separator className="flex-1" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* System Health Strip */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Tab bar skeleton */}
      <div className="flex gap-1 bg-muted rounded-lg p-[3px] w-fit">
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>

      {/* Pipeline Overview */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <Skeleton className="h-5 w-28 mb-1" />
          <Skeleton className="h-4 w-44 mb-4" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-7 w-12 mb-1.5" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Section */}
      <SectionSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <Skeleton className="h-7 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-1 w-full mt-3 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Throughput & Trends Section */}
      <SectionSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Extraction Quality Section */}
      <SectionSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CRM Section */}
      <SectionSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-36 mb-4" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Processing Performance */}
      <SectionSkeleton />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
