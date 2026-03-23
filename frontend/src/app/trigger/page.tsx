"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postMonitor } from "@/lib/api";
import type { MonitorEntry, MonitorResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Radio, Send, AlertCircle, CheckCircle2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_PAYLOAD: MonitorEntry[] = [
  {
    name: "Payment Gateway",
    url: "https://api.payments.example.com/v1/charge",
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer token123" },
    body: { amount: 100, currency: "USD" },
  },
  {
    name: "User Auth Service",
    url: "https://auth.example.com/v1/verify",
    method: "GET",
    headers: { Accept: "application/json" },
  },
  {
    name: "Inventory API",
    url: "https://api.inventory.example.com/stock",
    method: "GET",
  },
];

export default function TriggerMonitorPage() {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOAD, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<MonitorResponse | null>(null);

  const mutation = useMutation({
    mutationFn: postMonitor,
    onSuccess: (data) => {
      setRawResponse(data);
      toast.success("Monitor job submitted!", {
        description: "Your API entries have been sent for monitoring.",
      });
    },
    onError: (err: Error) => {
      setRawResponse(null);
      toast.error("Submission failed", { description: err.message });
    },
  });

  function validateAndSubmit() {
    setJsonError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setJsonError("Invalid JSON — please fix syntax errors before submitting.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setJsonError("Payload must be a JSON array of API entries.");
      return;
    }
    mutation.mutate(parsed as MonitorEntry[]);
  }

  const lineCount = jsonInput.split("\n").length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="px-6 pt-8 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600">
            <Radio size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Trigger Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Submit a JSON array of API entries to start a monitoring job.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Editor Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Code2 size={16} className="text-indigo-500" />
              Payload Editor
              <span className="ml-auto text-xs font-normal text-gray-400 tabular-nums">
                {lineCount} lines
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                id="monitor-payload"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError(null);
                }}
                spellCheck={false}
                rows={18}
                className={cn(
                  "font-mono text-sm resize-y leading-relaxed bg-gray-950 text-gray-100 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20 placeholder:text-gray-600",
                  jsonError && "border-red-500 focus:border-red-500"
                )}
                placeholder="Paste your JSON array here…"
              />
            </div>

            {/* JSON Error */}
            {jsonError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{jsonError}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400">
                POST →{" "}
                <code className="text-gray-500">
                  https://hasan007.app.n8n.cloud/webhook-test/monitor
                </code>
              </p>
              <Button
                onClick={validateAndSubmit}
                disabled={mutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send size={14} className={mutation.isPending ? "animate-pulse" : ""} />
                {mutation.isPending ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raw Response */}
        {(rawResponse || mutation.isError) && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="px-5 py-4 border-b border-gray-100 bg-white">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {mutation.isError ? (
                  <AlertCircle size={15} className="text-red-500" />
                ) : (
                  <CheckCircle2 size={15} className="text-green-500" />
                )}
                Raw Response
                <span
                  className={cn(
                    "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
                    mutation.isError
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  )}
                >
                  {mutation.isError ? "Error" : "200 OK"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="overflow-x-auto bg-gray-950 text-gray-100 text-xs font-mono leading-relaxed p-5 rounded-b-lg">
                {mutation.isError
                  ? JSON.stringify(
                      { error: (mutation.error as Error).message },
                      null,
                      2
                    )
                  : JSON.stringify(rawResponse, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
