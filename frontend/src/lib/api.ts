import axios from "axios";
import type { Alert, MonitorEntry, MonitorResponse, ResolveResponse } from "@/types";

const WEBHOOK_BASE = "https://hasan007.app.n8n.cloud/webhook-test";
const INTERNAL_BASE = "https://hasan007.app.n8n.cloud/webhook-test";

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const { data } = await axios.get<any>(
      `${WEBHOOK_BASE}/alerts`
    );
    
    if (!data) return [];
    
    // handle array shape directly
    if (Array.isArray(data)) return data;
    
    // handle nested wrappers common in n8n
    if (data.alerts && Array.isArray(data.alerts)) return data.alerts;
    if (data.data && Array.isArray(data.data)) return data.data;
    
    // If it's literally just a single JSON object (even if 'api_name' is missing/misspelled)
    if (typeof data === "object" && !Array.isArray(data)) {
      return [data];
    }

    return [];
  } catch (err) {
    return [];
  }
}

export async function resolveAlert(id: string): Promise<ResolveResponse> {
  const { data } = await axios.patch<ResolveResponse>(
    `${INTERNAL_BASE}/alerts/${id}/resolve`
  );
  return data;
}

// ── Monitor ───────────────────────────────────────────────────────────────────

export async function postMonitor(
  entries: MonitorEntry[]
): Promise<MonitorResponse> {
  const { data } = await axios.post<MonitorResponse>(
    `${WEBHOOK_BASE}/monitor`,
    entries
  );
  return data;
}
