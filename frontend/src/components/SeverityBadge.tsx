"use client";

import { Badge } from "@/components/ui/badge";
import type { Severity } from "@/types";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: Severity;
}

const severityConfig: Record<
  Severity,
  { label: string; className: string }
> = {
  critical: {
    label: "Critical",
    className:
      "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
  medium: {
    label: "Medium",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  low: {
    label: "Low",
    className:
      "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
  },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity] ?? severityConfig.low;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold px-2.5 py-0.5 rounded-full",
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}
