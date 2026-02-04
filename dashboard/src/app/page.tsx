"use client";

import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardHeader } from "@/components/dashboard/header";
import { SystemHealthStrip } from "@/components/dashboard/system-health-strip";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProcessingStats } from "@/components/dashboard/processing-stats";
import { ThroughputChart } from "@/components/dashboard/throughput-chart";
import { ErrorRateTrend } from "@/components/dashboard/error-rate-trend";
import { FieldRatesChart } from "@/components/dashboard/field-rates-chart";
import { ConfidenceHistogram } from "@/components/dashboard/confidence-histogram";
import { FieldsDistributionChart } from "@/components/dashboard/fields-distribution-chart";
import { ErrorBreakdownChart } from "@/components/dashboard/error-breakdown-chart";
import { CrmWritebackChart } from "@/components/dashboard/crm-writeback-chart";
import { RunsTable } from "@/components/dashboard/runs-table";
import { RecentErrors } from "@/components/dashboard/recent-errors";
import { ExtractionDataTable } from "@/components/dashboard/extraction-data-table";
import { SectionLabel } from "@/components/dashboard/section-label";
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  Gauge,
  BarChart3,
  Target,
  DatabaseZap,
  Timer,
  History,
  TableProperties,
} from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error, lastUpdated, countdown, refetch } =
    useDashboardData();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader
          lastUpdated={lastUpdated}
          countdown={countdown}
          onRefresh={refetch}
          loading={loading && !data}
        />

        {error && !data && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-3 rounded-full bg-red-500/10 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Connection Error</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Could not connect to the database. Ensure your DATABASE_URL
              environment variable is set correctly.
            </p>
            <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded">
              {error}
            </p>
          </div>
        )}

        {loading && !data && <DashboardSkeleton />}

        {data && (
          <div className="space-y-4">
            {/* System Health Strip — always visible above tabs */}
            <SystemHealthStrip health={data.systemHealth} />

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="extracted-data">
                  Extracted Data
                </TabsTrigger>
                <TabsTrigger value="run-history">Run History</TabsTrigger>
              </TabsList>

              {/* --- Overview Tab --- */}
              <TabsContent value="overview">
                <div className="space-y-4">
                  {/* Pipeline Overview */}
                  <PipelineOverview
                    stages={data.pipelineStages}
                    totalProcessed={data.summary.totalProcessed30d}
                  />

                  {/* --- Key Metrics Section --- */}
                  <SectionLabel
                    icon={Gauge}
                    title="Key Metrics"
                    description="KPI overview with 7-day trends"
                  />
                  <KpiCards summary={data.summary} sparklines={data.kpiSparklines} />

                  {/* --- Throughput & Trends Section --- */}
                  <SectionLabel
                    icon={BarChart3}
                    title="Throughput & Trends"
                    description="Daily processing volume and error trends"
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <ThroughputChart data={data.dailyThroughput} />
                    </div>
                    <ErrorRateTrend data={data.errorRateTrend} />
                  </div>

                  {/* --- Extraction Quality Section --- */}
                  <SectionLabel
                    icon={Target}
                    title="Extraction Quality"
                    description="How well the AI is finding contact data -- aim for high field rates and confidence above 80%"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldRatesChart data={data.fieldRates} />
                    <ConfidenceHistogram
                      data={data.confidenceHistogram}
                      avgConfidence={data.summary.avgConfidence}
                    />
                    <FieldsDistributionChart
                      data={data.fieldsDistribution}
                      avgFieldsFound={data.fieldRates.avgFieldsFound}
                    />
                  </div>

                  {/* --- CRM & Integration Section --- */}
                  <SectionLabel
                    icon={DatabaseZap}
                    title="CRM Integration"
                    description="How reliably extracted contacts are synced to HubSpot and where errors occur"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CrmWritebackChart data={data.crmDaily} />
                    <ErrorBreakdownChart data={data.errorBreakdown} />
                  </div>

                  {/* --- Processing Performance Section --- */}
                  <SectionLabel
                    icon={Timer}
                    title="Processing Performance"
                    description="Speed and reliability of each pipeline run -- watch for rising retries or queue buildup"
                  />
                  <ProcessingStats stats={data.processingStats} />
                </div>
              </TabsContent>

              {/* --- Extracted Data Tab --- */}
              <TabsContent value="extracted-data">
                <div className="space-y-4">
                  <SectionLabel
                    icon={TableProperties}
                    title="Extraction Records"
                    description="Every company processed with extracted phone, email, and address -- click a row for full details"
                  />
                  <ExtractionDataTable data={data.extractionRecords} />
                </div>
              </TabsContent>

              {/* --- Run History Tab --- */}
              <TabsContent value="run-history">
                <div className="space-y-4">
                  <SectionLabel
                    icon={History}
                    title="Run History"
                    description="Each pipeline execution with per-company results -- click a row to expand details"
                  />
                  <RunsTable data={data.recentRuns} />
                  <RecentErrors data={data.recentErrors} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                SMEVentures Contact Extraction Pipeline &middot; Powered by n8n,
                Gemini, PostgreSQL &amp; HubSpot
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
