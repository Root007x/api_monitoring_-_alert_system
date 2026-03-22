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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
        const prevKeys = new Set(prev.map((a) => `${a.api_name}-${a.timestamp}`));
        const newAlerts = fetchedAlerts.filter(
          (a) => !prevKeys.has(`${a.api_name}-${a.timestamp}`)
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
      acc[key] = accumulatedAlerts.filter((a) => a.severity.toLowerCase() === key).length;
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading */}
                {isLoading && <TableSkeleton />}

                {/* Empty */}
                {!isLoading && activeAlerts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                  activeAlerts.map((alert, index) => (
                    <TableRow
                      key={`${alert.api_name}-${alert.timestamp}-${index}`}
                      className={cn(
                        "transition-colors hover:bg-gray-50",
                        alert.severity.toLowerCase() === "critical" && "bg-red-50/30"
                      )}
                    >
                      <TableCell className="font-medium text-gray-900 pl-5">
                        {alert.api_name}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={alert.severity.toLowerCase() as Severity} />
                      </TableCell>
                      <TableCell className="max-w-xs text-gray-600 text-sm">
                        <p className="truncate" title={alert.ai_alert_message}>
                          {alert.ai_alert_message}
                        </p>
                      </TableCell>
                      <TableCell className="text-gray-700 tabular-nums">
                        {alert.response_time_ms?.toLocaleString()}
                        <span className="text-gray-400 text-xs ml-1">ms</span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                        <span title={formatRelativeTime(alert.timestamp)}>
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
