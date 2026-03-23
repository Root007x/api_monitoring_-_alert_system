"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/api";
import type { Alert, Severity } from "@/types";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatTimestamp, formatRelativeTime } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  ShieldAlert,
  Clock,
  RefreshCw,
  CheckCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Helper ────────────────────────────────────────────────────────────────────

function getAlertSeverity(alert: Alert): Severity {
  if (alert.severity) return (alert.severity.toLowerCase() || 'low') as Severity;
  if (!alert.issues || alert.issues.length === 0) return 'low';
  
  const levels: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  let maxSev: Severity = 'low';
  let maxScore = 0;
  
  for (const issue of alert.issues) {
    const s = issue.severity?.toLowerCase() || 'low';
    const score = levels[s] || 1;
    if (score > maxScore) {
       maxScore = score;
       maxSev = s as Severity;
    }
  }
  return maxSev;
}

// ── Severity card config ──────────────────────────────────────────────────────

const SEVERITY_CARDS: {
  key: Severity;
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
}[] = [
  {
    key: "critical",
    label: "Critical",
    icon: ShieldAlert,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  {
    key: "high",
    label: "High",
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  {
    key: "medium",
    label: "Medium",
    icon: Activity,
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  {
    key: "low",
    label: "Low",
    icon: CheckCircle2,
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
  },
];

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const qc = useQueryClient();
  const [accumulatedAlerts, setAccumulatedAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const {
    data: fetchedAlerts = [],
    isLoading,
    isError,
    error,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (fetchedAlerts.length > 0) {
      setAccumulatedAlerts((prev) => {
        // Prevent duplicate alerts from stacking up (unique by api_name + timestamp)
        const prevKeys = new Set(prev.map((a) => `${a.api_name || 'unknown'}-${a.timeStamp || a.timestamp || a._id || ''}`));
        const newAlerts = fetchedAlerts.filter(
          (a) => !prevKeys.has(`${a.api_name || 'unknown'}-${a.timeStamp || a.timestamp || a._id || ''}`)
        );
        
        if (newAlerts.length === 0) return prev;
        
        // Add new items at the top and trim the array to only keep the last 20
        const combined = [...newAlerts, ...prev];
        return combined.slice(0, 20);
      });
    }
  }, [fetchedAlerts]);

  const severityCounts = SEVERITY_CARDS.reduce(
    (acc, { key }) => {
      acc[key] = accumulatedAlerts.filter((a) => getAlertSeverity(a) === key).length;
      return acc;
    },
    {} as Record<Severity, number>
  );

  const hasCritical = severityCounts.critical > 0;
  const activeAlerts = accumulatedAlerts;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Critical Banner */}
      {hasCritical && (
        <div className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white text-sm font-medium">
          <ShieldAlert size={16} className="shrink-0 animate-pulse" />
          <span>
            {severityCounts.critical} critical alert
            {severityCounts.critical > 1 ? "s" : ""} require
            {severityCounts.critical === 1 ? "s" : ""} immediate attention.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="px-6 pt-8 pb-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Alerts Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Clock size={13} />
              {dataUpdatedAt
                ? `Last refreshed ${formatRelativeTime(new Date(dataUpdatedAt).toISOString())}`
                : "Fetching data…"}
              &nbsp;· Auto-refresh every 30s
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SEVERITY_CARDS.map(({ key, label, icon: Icon, bg, text, border }) => (
            <Card
              key={key}
              className={cn("border shadow-sm", bg, border)}
            >
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                  <Icon size={15} className={text} />
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                {isLoading ? (
                  <Skeleton className="h-8 w-10" />
                ) : (
                  <p className={cn("text-3xl font-bold", text)}>
                    {severityCounts[key]}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              Active Alerts
              {!isLoading && (
                <span className="ml-1 rounded-full bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 font-medium">
                  {activeAlerts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 pl-5">
                    API Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Severity
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 max-w-xs">
                    AI Alert Message
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Response Time
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status Code
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Timestamp
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right pr-5">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading */}
                {isLoading && <TableSkeleton />}

                {/* Empty */}
                {!isLoading && activeAlerts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-16 text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 size={28} className="text-green-400" />
                        <p className="font-medium text-gray-500">
                          All clear! No active alerts.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  activeAlerts.map((alert, index) => {
                    const sev = getAlertSeverity(alert);
                    const ts = alert.timeStamp || alert.timestamp;
                    const msg = alert.alert_messages || alert.ai_alert_message || alert.alert_message;
                    return (
                      <TableRow
                        key={`${alert.api_name || 'unknown'}-${ts || alert._id || ''}-${index}`}
                        className={cn(
                          "transition-colors hover:bg-gray-50",
                          sev === "critical" && "bg-red-50/30"
                        )}
                      >
                        <TableCell className="font-medium text-gray-900 pl-5">
                          {alert.api_name || <span className="text-gray-400 italic">Unknown API</span>}
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={sev} />
                        </TableCell>
                        <TableCell className="max-w-xs text-gray-600 text-sm">
                          <p className="truncate" title={msg || "No message provided"}>
                            {msg || <span className="text-gray-400 italic">No message provided</span>}
                          </p>
                        </TableCell>
                        <TableCell className="text-gray-700 tabular-nums">
                          {alert.response_time_ms != null ? (
                            <>
                              {alert.response_time_ms.toLocaleString()}
                              <span className="text-gray-400 text-xs ml-1">ms</span>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {alert.status_code != null ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold",
                                alert.status_code >= 500
                                  ? "bg-red-100 text-red-700"
                                  : alert.status_code >= 400
                                    ? "bg-orange-100 text-orange-700"
                                    : alert.status_code >= 200
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {alert.status_code}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                          {ts ? (
                            <span title={formatRelativeTime(ts)}>
                              {formatTimestamp(ts)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                Alert Details
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedAlert(null)}>
                <X size={16} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">API Name</p>
                  <p className="font-semibold text-gray-900">{selectedAlert.api_name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Severity</p>
                  <SeverityBadge severity={getAlertSeverity(selectedAlert)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Timestamp</p>
                  <p className="text-gray-900">
                    {selectedAlert.timeStamp || selectedAlert.timestamp 
                      ? formatTimestamp((selectedAlert.timeStamp || selectedAlert.timestamp) as string) 
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Response Time</p>
                  <p className="text-gray-900">
                    {selectedAlert.response_time_ms != null ? `${selectedAlert.response_time_ms} ms` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status Code</p>
                  <p className="text-gray-900 font-mono">
                    {selectedAlert.status_code != null ? selectedAlert.status_code : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Alert Message</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                  {selectedAlert.alert_messages || selectedAlert.ai_alert_message || selectedAlert.alert_message || "No specific message provided."}
                </div>
              </div>

              {selectedAlert.issues && selectedAlert.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Detected Issues</p>
                  <div className="space-y-2">
                    {selectedAlert.issues.map((issue, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-start gap-3">
                        <ShieldAlert size={16} className={cn("mt-0.5", issue.severity === 'critical' ? 'text-red-500' : issue.severity === 'high' ? 'text-orange-500' : 'text-yellow-500')} />
                        <div>
                          <p className="text-sm font-medium capitalize text-gray-900">{issue.type?.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">Severity: {issue.severity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button onClick={() => setSelectedAlert(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
