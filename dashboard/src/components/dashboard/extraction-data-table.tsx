"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardData } from "@/lib/types";
import { formatRelativeTime, formatDuration, formatConfidence } from "@/lib/format";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Check,
  Clock,
  Search,
  Database,
} from "lucide-react";

type ExtractionRecord = DashboardData["extractionRecords"][0];

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  failed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  pending: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
};

const CONFIDENCE_COLOR = (score: number) => {
  if (score >= 0.8) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  if (score >= 0.6) return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20";
  if (score >= 0.4) return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
};

/** Sentinel values treated as empty/missing. Keep in sync with EMPTY_SENTINELS in queries.ts */
const EMPTY_SENTINELS = ["none", "n/a", "null"];

function hasValue(v: string | null | undefined): boolean {
  if (!v) return false;
  const trimmed = v.trim();
  if (trimmed === "") return false;
  return !EMPTY_SENTINELS.includes(trimmed.toLowerCase());
}

function FieldDot({ found, label }: { found: boolean; label: string }) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${found ? "found" : "missing"}`}
      title={`${label}: ${found ? "found" : "missing"}`}
      className={`inline-block h-2 w-2 rounded-full ${
        found ? "bg-emerald-500" : "bg-muted-foreground/30"
      }`}
    />
  );
}

function ExpandedRecord({ record }: { record: ExtractionRecord }) {
  return (
    <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={11} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Extracted data */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Extracted Data
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone
                </span>
                <span className="font-mono">
                  {hasValue(record.extractedPhone) ? record.extractedPhone : <span className="text-muted-foreground">--</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </span>
                <span className="font-mono">
                  {hasValue(record.extractedEmail) ? record.extractedEmail : <span className="text-muted-foreground">--</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Address
                </span>
                <span className="font-mono text-right max-w-[200px] truncate">
                  {hasValue(record.extractedAddress) ? record.extractedAddress : <span className="text-muted-foreground">--</span>}
                </span>
              </div>
            </div>
          </div>

          {/* AI & Processing info */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Processing Info
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono">
                  {hasValue(record.modelVersion) ? record.modelVersion : <span className="text-muted-foreground">--</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extraction Time</span>
                <span className="font-medium">
                  {record.extractionTimeSeconds
                    ? formatDuration(record.extractionTimeSeconds)
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Run ID</span>
                <span className="font-mono text-muted-foreground">
                  {hasValue(record.processingRunId)
                    ? `${record.processingRunId!.slice(0, 8)}...`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">
                  {formatConfidence(record.confidenceScore)}
                </span>
              </div>
            </div>
          </div>

          {/* Data sources & metadata */}
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              Data Sources
            </p>
            {record.dataSources.length > 0 ? (
              <div className="flex flex-wrap gap-1 mb-3">
                {record.dataSources.map((src) => (
                  <Badge
                    key={src}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {src}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">No sources recorded</p>
            )}
            <p className="text-[11px] font-medium text-muted-foreground mb-1">
              Timestamps
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extracted</span>
                <span className="font-mono">
                  {new Date(record.extractionTimestamp).toLocaleString()}
                </span>
              </div>
              {record.crmUpdatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CRM Updated</span>
                  <span className="font-mono">
                    {new Date(record.crmUpdatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raw AI response */}
        {hasValue(record.rawAiResponse) && (
          <div className="mt-4">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">
              Raw AI Response
            </p>
            <pre className="text-[11px] font-mono bg-muted/50 border border-border/50 rounded-md p-3 max-h-40 overflow-auto whitespace-pre-wrap">{record.rawAiResponse}</pre>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

const PAGE_SIZE = 20;

interface ExtractionDataTableProps {
  data: DashboardData["extractionRecords"];
}

export function ExtractionDataTable({ data }: ExtractionDataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  const statuses = useMemo(
    () => Array.from(new Set(data.map((r) => r.status))).sort(),
    [data]
  );

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.companyName.toLowerCase().includes(q) ||
          r.domain.toLowerCase().includes(q) ||
          r.crmRecordId.toLowerCase().includes(q) ||
          (hasValue(r.extractedEmail) && r.extractedEmail!.toLowerCase().includes(q)) ||
          (hasValue(r.extractedPhone) && r.extractedPhone!.toLowerCase().includes(q))
      );
    }
    return result;
  }, [data, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  // Reset page when filters change
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(0);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Summary stats
  const withPhone = data.filter((r) => hasValue(r.extractedPhone)).length;
  const withEmail = data.filter((r) => hasValue(r.extractedEmail)).length;
  const withAddress = data.filter((r) => hasValue(r.extractedAddress)).length;
  const avgConfidence =
    data.length > 0
      ? data.reduce((s, r) => s + r.confidenceScore, 0) / data.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">Latest Records</p>
              <p className="text-sm font-semibold">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">With Phone</p>
              <p className="text-sm font-semibold">{withPhone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">With Email</p>
              <p className="text-sm font-semibold">{withEmail}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">With Address</p>
              <p className="text-sm font-semibold">{withAddress}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${CONFIDENCE_COLOR(avgConfidence)}`}
            >
              avg
            </Badge>
            <div>
              <p className="text-[11px] text-muted-foreground">Avg Confidence</p>
              <p className="text-sm font-semibold">
                {formatConfidence(avgConfidence)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls row */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search company, domain, email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-transparent shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger size="sm" className="w-full sm:w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto -mx-5 px-5">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-medium w-8" />
                  <TableHead className="text-xs font-medium">Company</TableHead>
                  <TableHead className="text-xs font-medium">Domain</TableHead>
                  <TableHead className="text-xs font-medium text-center" aria-label="Phone">
                    <Phone className="h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-center" aria-label="Email">
                    <Mail className="h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-center" aria-label="Address">
                    <MapPin className="h-3 w-3 inline" />
                  </TableHead>
                  <TableHead className="text-xs font-medium">Confidence</TableHead>
                  <TableHead className="text-xs font-medium text-right">Fields</TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium text-center">CRM</TableHead>
                  <TableHead className="text-xs font-medium">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      {data.length === 0
                        ? "No extraction records yet"
                        : "No records match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData.map((record) => {
                    const isExpanded = expandedRows.has(record.id);
                    return (
                      <React.Fragment key={record.id}>
                        <TableRow
                          className="border-border/50 cursor-pointer"
                          tabIndex={0}
                          role="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleRow(record.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleRow(record.id);
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
                          <TableCell className="text-xs font-medium max-w-[160px] truncate">
                            {record.companyName || <span className="text-muted-foreground">--</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                            {record.domain || <span className="text-muted-foreground">--</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <FieldDot found={hasValue(record.extractedPhone)} label="Phone" />
                          </TableCell>
                          <TableCell className="text-center">
                            <FieldDot found={hasValue(record.extractedEmail)} label="Email" />
                          </TableCell>
                          <TableCell className="text-center">
                            <FieldDot found={hasValue(record.extractedAddress)} label="Address" />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${CONFIDENCE_COLOR(
                                record.confidenceScore
                              )}`}
                            >
                              {formatConfidence(record.confidenceScore)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {record.fieldsFound}/3
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                STATUS_STYLES[record.status] || ""
                              }`}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {record.crmUpdatedAt ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500 inline" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-muted-foreground inline" />
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatRelativeTime(record.extractionTimestamp)}
                          </TableCell>
                        </TableRow>
                        {isExpanded && <ExpandedRecord record={record} />}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-input bg-transparent text-xs font-medium shadow-xs hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-input bg-transparent text-xs font-medium shadow-xs hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
