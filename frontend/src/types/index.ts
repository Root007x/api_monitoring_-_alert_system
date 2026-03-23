export type Severity = "critical" | "high" | "medium" | "low";

export interface Issue {
  _id?: string;
  type?: string;
  severity?: string;
}

export interface Alert {
  _id?: string;
  api_name?: string | null;
  alert_messages?: string | null;
  timeStamp?: string | null;
  response_time_ms?: number | null;
  status_code?: number | null;
  records_returned?: number | null;
  issues?: Issue[] | null;
  
  // Fallbacks for older schemas
  alert_message?: string | null;
  ai_alert_message?: string | null;
  severity?: string | null;
  timestamp?: string | null;
  [key: string]: any;
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
