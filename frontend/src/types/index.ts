export type Severity = "critical" | "high" | "medium" | "low";

export interface Alert {
  api_name: string;
  severity: string;
  ai_alert_message: string;
  response_time_ms: number;
  status_code: number;
  timestamp: string;
}

export interface AlertsResponse {
  alerts: Alert[];
}

export interface MonitorEntry {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface MonitorResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface ResolveResponse {
  success: boolean;
  id: string;
}
