import { getDb } from "./db";
import type { DashboardData } from "./types";

/**
 * Sentinel values treated as empty/missing throughout the dashboard.
 * IMPORTANT: Keep this list in sync with the SQL NOT IN clauses below.
 * SQL equivalent: LOWER(TRIM(col)) NOT IN ('', 'none', 'n/a', 'null')
 */
const EMPTY_SENTINELS = ["none", "n/a", "null"];

/** Return null if value is empty, whitespace-only, or matches an EMPTY_SENTINEL */
function normalizeStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  if (EMPTY_SENTINELS.includes(s.toLowerCase())) return null;
  return s;
}

const HISTOGRAM_COLORS: Record<string, string> = {
  "0-20": "#ef4444",
  "20-40": "#f97316",
  "40-60": "#f59e0b",
  "60-80": "#3b82f6",
  "80-100": "#10b981",
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const sql = getDb();

  const [
    totalAll,
    total7d,
    total30d,
    dailySummary,
    fieldRates,
    fieldsDistribution,
    errorSummary,
    crmStatus,
    recentRuns,
    recentErrors,
    confidenceHist,
    processingStatsResult,
    totalRetries,
    lastSuccessRun,
    activeErrors24h,
    queueDepthResult,
    extractionRecordsResult,
    dailyDataFoundResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM contact_extraction_results`,
    sql`SELECT COUNT(*) as count FROM contact_extraction_results WHERE extraction_timestamp > NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(*) as count FROM contact_extraction_results WHERE extraction_timestamp > NOW() - INTERVAL '30 days'`,
    sql`SELECT * FROM v_daily_summary ORDER BY processing_date DESC LIMIT 30`,
    sql`
      SELECT
        ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_phone IS NOT NULL AND LOWER(TRIM(extracted_phone)) NOT IN ('', 'none', 'n/a', 'null')) / NULLIF(COUNT(*), 0), 2) as phone_rate,
        ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_email IS NOT NULL AND LOWER(TRIM(extracted_email)) NOT IN ('', 'none', 'n/a', 'null')) / NULLIF(COUNT(*), 0), 2) as email_rate,
        ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_address IS NOT NULL AND LOWER(TRIM(extracted_address)) NOT IN ('', 'none', 'n/a', 'null')) / NULLIF(COUNT(*), 0), 2) as address_rate,
        ROUND(AVG(confidence_score)::numeric, 4) as avg_confidence,
        ROUND(AVG(
          (CASE WHEN extracted_phone IS NOT NULL AND LOWER(TRIM(extracted_phone)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END) +
          (CASE WHEN extracted_email IS NOT NULL AND LOWER(TRIM(extracted_email)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END) +
          (CASE WHEN extracted_address IS NOT NULL AND LOWER(TRIM(extracted_address)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END)
        )::numeric, 2) as avg_fields_found
      FROM contact_extraction_results
      WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
    `,
    sql`
      SELECT
        (
          CASE WHEN extracted_phone IS NOT NULL AND LOWER(TRIM(extracted_phone)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END +
          CASE WHEN extracted_email IS NOT NULL AND LOWER(TRIM(extracted_email)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END +
          CASE WHEN extracted_address IS NOT NULL AND LOWER(TRIM(extracted_address)) NOT IN ('', 'none', 'n/a', 'null') THEN 1 ELSE 0 END
        ) as fields_found,
        COUNT(*) as count
      FROM contact_extraction_results
      WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1
    `,
    sql`SELECT * FROM v_error_summary`,
    sql`SELECT * FROM v_crm_update_status ORDER BY processing_date DESC LIMIT 30`,
    sql`
      SELECT run_id, started_at, completed_at, status,
             companies_processed, companies_successful,
             companies_failed, companies_skipped,
             total_duration_seconds, trigger_type
      FROM workflow_runs
      ORDER BY started_at DESC
      LIMIT 20
    `,
    sql`
      SELECT id, crm_record_id, error_timestamp, error_type,
             error_message, retry_count
      FROM processing_errors
      ORDER BY error_timestamp DESC
      LIMIT 10
    `,
    // Confidence histogram bins
    sql`
      SELECT
        CASE
          WHEN confidence_score < 0.2 THEN '0-20'
          WHEN confidence_score < 0.4 THEN '20-40'
          WHEN confidence_score < 0.6 THEN '40-60'
          WHEN confidence_score < 0.8 THEN '60-80'
          ELSE '80-100'
        END as bin,
        COUNT(*) as count
      FROM contact_extraction_results
      WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
        AND confidence_score IS NOT NULL
      GROUP BY bin
      ORDER BY bin
    `,
    // Processing stats from workflow_runs
    sql`
      SELECT
        COALESCE(AVG(total_duration_seconds), 0) as avg_time,
        COALESCE(MIN(total_duration_seconds), 0) as min_time,
        COALESCE(MAX(total_duration_seconds), 0) as max_time,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration_seconds), 0) as median_time
      FROM workflow_runs
      WHERE completed_at IS NOT NULL
        AND started_at > NOW() - INTERVAL '30 days'
    `,
    // Total retries
    sql`
      SELECT COALESCE(SUM(retry_count), 0) as total_retries
      FROM processing_errors
      WHERE error_timestamp > NOW() - INTERVAL '30 days'
    `,
    // Last successful run
    sql`
      SELECT completed_at
      FROM workflow_runs
      WHERE status IN ('completed', 'success')
      ORDER BY completed_at DESC
      LIMIT 1
    `,
    // Active errors in last 24h
    sql`
      SELECT COUNT(*) as count
      FROM processing_errors
      WHERE error_timestamp > NOW() - INTERVAL '24 hours'
    `,
    // Queue depth (runs with status 'waiting' or 'running')
    sql`
      SELECT COUNT(*) as count
      FROM workflow_runs
      WHERE status IN ('waiting', 'running', 'queued')
    `,
    // Extraction records for detail table
    sql`
      SELECT id, crm_record_id, company_name, domain,
             extracted_phone, extracted_email, extracted_address,
             confidence_score, fields_found, status,
             extraction_timestamp, crm_updated_at,
             processing_run_id, model_version,
             extraction_time_seconds, data_sources_used, raw_ai_response
      FROM contact_extraction_results
      ORDER BY extraction_timestamp DESC
      LIMIT 100
    `,
    // Per-day data-found rate (normalized) for sparkline
    sql`
      SELECT
        extraction_timestamp::date as day,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE
          (extracted_phone IS NOT NULL AND LOWER(TRIM(extracted_phone)) NOT IN ('', 'none', 'n/a', 'null')) OR
          (extracted_email IS NOT NULL AND LOWER(TRIM(extracted_email)) NOT IN ('', 'none', 'n/a', 'null')) OR
          (extracted_address IS NOT NULL AND LOWER(TRIM(extracted_address)) NOT IN ('', 'none', 'n/a', 'null'))
        ) as data_found
      FROM contact_extraction_results
      WHERE extraction_timestamp > NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day
    `,
  ]);

  const totalProcessed = Number(totalAll[0]?.count || 0);
  const totalProcessed7d = Number(total7d[0]?.count || 0);
  const totalProcessed30d = Number(total30d[0]?.count || 0);

  const fr = fieldRates[0] || {};

  // Calculate success rate from 30-day window
  const dailySummaryRows = dailySummary as Array<Record<string, unknown>>;
  const totalSuccessful = dailySummaryRows.reduce(
    (sum: number, d) => sum + Number(d.successful || 0),
    0
  );
  const totalFromDaily = dailySummaryRows.reduce(
    (sum: number, d) => sum + Number(d.total_processed || 0),
    0
  );
  const successRate = totalFromDaily > 0 ? (totalSuccessful / totalFromDaily) * 100 : 0;

  // Data Found vs No Data
  const fieldsDistRows = fieldsDistribution as Array<Record<string, unknown>>;
  const noDataCount = Number(
    fieldsDistRows.find((r) => Number(r.fields_found) === 0)?.count || 0
  );
  const dataFoundCount = fieldsDistRows
    .filter((r) => Number(r.fields_found) > 0)
    .reduce((sum, r) => sum + Number(r.count || 0), 0);

  // CRM write-back rate
  const crmRows = crmStatus as Array<Record<string, unknown>>;
  const totalCrmExtracted = crmRows.reduce(
    (sum: number, d) => sum + Number(d.total_extracted || 0),
    0
  );
  const totalCrmConfirmed = crmRows.reduce(
    (sum: number, d) => sum + Number(d.crm_confirmed || 0),
    0
  );
  const totalCrmPending = crmRows.reduce(
    (sum: number, d) => sum + Number(d.crm_pending || 0),
    0
  );
  const crmWriteBackRate =
    totalCrmExtracted > 0 ? (totalCrmConfirmed / totalCrmExtracted) * 100 : 0;

  // Error rate trend (derived from daily summary)
  const errorRateTrend = dailySummaryRows.map((d) => {
    const total = Number(d.total_processed || 0);
    const failed = Number(d.failed || 0);
    return {
      date: String(d.processing_date),
      errorRate: total > 0 ? (failed / total) * 100 : 0,
      failed,
      total,
    };
  });

  // Confidence histogram
  const histRows = confidenceHist as Array<Record<string, unknown>>;
  const allBins = ["0-20", "20-40", "40-60", "60-80", "80-100"];
  const confidenceHistogram = allBins.map((bin) => ({
    bin,
    count: Number(histRows.find((r) => String(r.bin) === bin)?.count || 0),
    color: HISTOGRAM_COLORS[bin],
  }));

  // Processing stats
  const ps = processingStatsResult[0] || {};
  const processingStats = {
    avgProcessingTime: Number(ps.avg_time || 0),
    fastestRun: Number(ps.min_time || 0),
    slowestRun: Number(ps.max_time || 0),
    totalRetries: Number((totalRetries as Array<Record<string, unknown>>)[0]?.total_retries || 0),
    queueDepth: Number((queueDepthResult as Array<Record<string, unknown>>)[0]?.count || 0),
    medianProcessingTime: Number(ps.median_time || 0),
  };

  // System health
  const activeErrorCount = Number((activeErrors24h as Array<Record<string, unknown>>)[0]?.count || 0);
  const lastSuccessfulRunTime = (lastSuccessRun as Array<Record<string, unknown>>)[0]?.completed_at
    ? String((lastSuccessRun as Array<Record<string, unknown>>)[0].completed_at)
    : null;
  const queueDepth = processingStats.queueDepth;

  // Determine system health status
  let healthStatus: "healthy" | "degraded" | "down" = "healthy";
  if (activeErrorCount > 10 || (lastSuccessfulRunTime && (Date.now() - new Date(lastSuccessfulRunTime).getTime()) > 3600000)) {
    healthStatus = "degraded";
  }
  if (activeErrorCount > 50 || (lastSuccessfulRunTime && (Date.now() - new Date(lastSuccessfulRunTime).getTime()) > 86400000)) {
    healthStatus = "down";
  }
  if (!lastSuccessfulRunTime && totalProcessed === 0) {
    healthStatus = "healthy"; // Fresh install, no runs yet
  }

  // Uptime percent (successful / total runs in 30d)
  const allRuns = recentRuns as Array<Record<string, unknown>>;
  const successfulRuns = allRuns.filter((r) =>
    ["completed", "success"].includes(String(r.status))
  ).length;
  const uptimePercent = allRuns.length > 0 ? (successfulRuns / allRuns.length) * 100 : 100;

  // Pipeline stages (derived from 30d data)
  const totalPartial = dailySummaryRows.reduce((s, d) => s + Number(d.partial || 0), 0);
  const totalFailed = dailySummaryRows.reduce((s, d) => s + Number(d.failed || 0), 0);
  const pipelineStages = {
    triggered: totalFromDaily,
    fetched: totalFromDaily - totalFailed,
    extracted: dataFoundCount,
    validated: totalSuccessful,
    written: Math.round(totalCrmConfirmed),
  };

  // KPI sparklines (from daily throughput, last 7 days)
  const last7Days = [...dailySummaryRows]
    .sort((a, b) => new Date(String(a.processing_date)).getTime() - new Date(String(b.processing_date)).getTime())
    .slice(-7);

  const kpiSparklines = {
    throughput: last7Days.map((d) => Number(d.total_processed || 0)),
    successRate: last7Days.map((d) => {
      const t = Number(d.total_processed || 0);
      const s = Number(d.successful || 0);
      return t > 0 ? (s / t) * 100 : 0;
    }),
    confidence: last7Days.map(() => Number(fr.avg_confidence || 0)), // per-day confidence not available, use avg
    crmRate: last7Days.map((d) => {
      const crmRow = crmRows.find((c) => String(c.processing_date) === String(d.processing_date));
      return crmRow ? Number(crmRow.crm_write_rate || 0) : 0;
    }),
    dataFound: (() => {
      const dailyDataFound = dailyDataFoundResult as Array<Record<string, unknown>>;
      return dailyDataFound.map((d) => {
        const total = Number(d.total || 0);
        const found = Number(d.data_found || 0);
        return total > 0 ? (found / total) * 100 : 0;
      });
    })(),
  };

  return {
    summary: {
      totalProcessed,
      totalProcessed7d,
      totalProcessed30d,
      successRate,
      avgConfidence: Number(fr.avg_confidence || 0),
      crmWriteBackRate,
      crmPending: totalCrmPending,
      dataFoundCount,
      noDataCount,
    },
    systemHealth: {
      status: healthStatus,
      lastSuccessfulRun: lastSuccessfulRunTime,
      activeErrorCount,
      queueDepth,
      uptimePercent,
    },
    pipelineStages,
    dailyThroughput: dailySummaryRows.map((d) => ({
      date: String(d.processing_date),
      successful: Number(d.successful || 0),
      partial: Number(d.partial || 0),
      failed: Number(d.failed || 0),
      total: Number(d.total_processed || 0),
    })),
    errorRateTrend,
    confidenceHistogram,
    fieldRates: {
      phone: Number(fr.phone_rate || 0),
      email: Number(fr.email_rate || 0),
      address: Number(fr.address_rate || 0),
      avgConfidence: Number(fr.avg_confidence || 0),
      avgFieldsFound: Number(fr.avg_fields_found || 0),
    },
    fieldsDistribution: [0, 1, 2, 3].map((n) => ({
      name: n === 1 ? "1 Field" : `${n} Fields`,
      value: Number(
        fieldsDistRows.find((r) => Number(r.fields_found) === n)?.count || 0
      ),
    })),
    errorBreakdown: (errorSummary as Array<Record<string, unknown>>).map((e) => ({
      type: normalizeStr(e.error_type) ?? "unknown",
      count: Number(e.error_count || 0),
      lastOccurrence: String(e.last_occurrence || ""),
      avgRetries: Number(e.avg_retries || 0),
    })),
    crmDaily: crmRows.map((d) => ({
      date: String(d.processing_date),
      confirmed: Number(d.crm_confirmed || 0),
      pending: Number(d.crm_pending || 0),
      errors: Number(d.errors || 0),
      writeRate: Number(d.crm_write_rate || 0),
    })),
    processingStats,
    recentRuns: (recentRuns as Array<Record<string, unknown>>).map((r) => ({
      runId: normalizeStr(r.run_id) ?? "",
      status: normalizeStr(r.status) ?? "unknown",
      startedAt: String(r.started_at),
      completedAt: r.completed_at ? String(r.completed_at) : null,
      duration: r.total_duration_seconds ? Number(r.total_duration_seconds) : null,
      companiesProcessed: Number(r.companies_processed || 0),
      companiesSuccessful: Number(r.companies_successful || 0),
      companiesFailed: Number(r.companies_failed || 0),
      companiesSkipped: Number(r.companies_skipped || 0),
      triggerType: normalizeStr(r.trigger_type) ?? "schedule",
    })),
    recentErrors: (recentErrors as Array<Record<string, unknown>>).map((e) => ({
      id: Number(e.id),
      crmRecordId: normalizeStr(e.crm_record_id) ?? "",
      timestamp: String(e.error_timestamp),
      type: normalizeStr(e.error_type) ?? "unknown",
      message: normalizeStr(e.error_message) ?? "No message provided",
      retryCount: Number(e.retry_count || 0),
    })),
    kpiSparklines,
    extractionRecords: (extractionRecordsResult as Array<Record<string, unknown>>).map((r) => {
      const phone = normalizeStr(r.extracted_phone);
      const email = normalizeStr(r.extracted_email);
      const address = normalizeStr(r.extracted_address);
      return {
      id: Number(r.id),
      crmRecordId: normalizeStr(r.crm_record_id) ?? "",
      companyName: normalizeStr(r.company_name) ?? "",
      domain: normalizeStr(r.domain) ?? "",
      extractedPhone: phone,
      extractedEmail: email,
      extractedAddress: address,
      confidenceScore: Number(r.confidence_score || 0),
      fieldsFound: (phone ? 1 : 0) + (email ? 1 : 0) + (address ? 1 : 0),
      status: normalizeStr(r.status) ?? "unknown",
      extractionTimestamp: String(r.extraction_timestamp),
      crmUpdatedAt: r.crm_updated_at ? String(r.crm_updated_at) : null,
      processingRunId: normalizeStr(r.processing_run_id),
      modelVersion: normalizeStr(r.model_version),
      extractionTimeSeconds: r.extraction_time_seconds ? Number(r.extraction_time_seconds) : null,
      dataSources: (() => {
        const raw = Array.isArray(r.data_sources_used)
          ? (r.data_sources_used as string[])
          : typeof r.data_sources_used === "string"
            ? (() => { try { const p = JSON.parse(r.data_sources_used as string); return Array.isArray(p) ? p : []; } catch { return []; } })()
            : [];
        return raw.map(s => normalizeStr(s)).filter((s): s is string => s !== null);
      })(),
      rawAiResponse: normalizeStr(r.raw_ai_response),
    };
    }),
  };
}
