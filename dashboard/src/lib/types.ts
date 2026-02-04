export interface DashboardData {
  summary: {
    totalProcessed: number;
    totalProcessed7d: number;
    totalProcessed30d: number;
    successRate: number;
    avgConfidence: number;
    crmWriteBackRate: number;
    crmPending: number;
    dataFoundCount: number;
    noDataCount: number;
  };
  systemHealth: {
    status: "healthy" | "degraded" | "down";
    lastSuccessfulRun: string | null;
    activeErrorCount: number;
    queueDepth: number;
    uptimePercent: number;
  };
  pipelineStages: {
    triggered: number;
    fetched: number;
    extracted: number;
    validated: number;
    written: number;
  };
  dailyThroughput: Array<{
    date: string;
    successful: number;
    partial: number;
    failed: number;
    total: number;
  }>;
  errorRateTrend: Array<{
    date: string;
    errorRate: number;
    failed: number;
    total: number;
  }>;
  confidenceHistogram: Array<{
    bin: string;
    count: number;
    color: string;
  }>;
  fieldRates: {
    phone: number;
    email: number;
    address: number;
    avgConfidence: number;
    avgFieldsFound: number;
  };
  fieldsDistribution: Array<{
    name: string;
    value: number;
  }>;
  errorBreakdown: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
    avgRetries: number;
  }>;
  crmDaily: Array<{
    date: string;
    confirmed: number;
    pending: number;
    errors: number;
    writeRate: number;
  }>;
  processingStats: {
    avgProcessingTime: number;
    fastestRun: number;
    slowestRun: number;
    totalRetries: number;
    queueDepth: number;
    medianProcessingTime: number;
  };
  recentRuns: Array<{
    runId: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    duration: number | null;
    companiesProcessed: number;
    companiesSuccessful: number;
    companiesFailed: number;
    companiesSkipped: number;
    triggerType: string;
  }>;
  recentErrors: Array<{
    id: number;
    crmRecordId: string;
    timestamp: string;
    type: string;
    message: string;
    retryCount: number;
  }>;
  kpiSparklines: {
    throughput: number[];
    successRate: number[];
    confidence: number[];
    crmRate: number[];
    dataFound: number[];
  };
  extractionRecords: Array<{
    id: number;
    crmRecordId: string;
    companyName: string;
    domain: string;
    extractedPhone: string | null;
    extractedEmail: string | null;
    extractedAddress: string | null;
    confidenceScore: number;
    fieldsFound: number;
    status: string;
    extractionTimestamp: string;
    crmUpdatedAt: string | null;
    processingRunId: string | null;
    modelVersion: string | null;
    extractionTimeSeconds: number | null;
    dataSources: string[];
    rawAiResponse: string | null;
  }>;
}
