"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AlertSeverity = "high" | "medium" | "low";
type AlertStatus = "open" | "acknowledged" | "resolved";
type AlertType =
  | "material shortage"
  | "machine downtime"
  | "maintenance conflict"
  | "schedule delay risk"
  | "resource bottleneck"
  | "quality hold";

type AlertItem = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  line: string;
  workOrder?: string;
  createdAt: string;
  recommendedAction: string;
};

const alertsData: AlertItem[] = [
  {
    id: "ALT-1021",
    type: "material shortage",
    severity: "high",
    status: "open",
    title: "Control Board X12 supply below safety stock",
    message: "Stock for X12 is 18% below safety stock. Risk of Line B stoppage.",
    line: "Line B - Assembly",
    workOrder: "WO-1041",
    createdAt: "2026-03-14 08:20",
    recommendedAction: "Expedite supplier shipment or shift to alternate supplier for next 48 hours."
  },
  {
    id: "ALT-1022",
    type: "machine downtime",
    severity: "high",
    status: "acknowledged",
    title: "CNC-14 unexpectedly down",
    message: "CNC-14 reported spindle failure. Estimated downtime 6 hours.",
    line: "Line A - Precision",
    workOrder: "WO-1038",
    createdAt: "2026-03-14 07:55",
    recommendedAction: "Reassign WO-1038 to CNC-11 and prioritize repair slot."
  },
  {
    id: "ALT-1023",
    type: "maintenance conflict",
    severity: "medium",
    status: "open",
    title: "Planned maintenance overlaps WO-1052",
    message: "Scheduled maintenance window conflicts with planned packaging run.",
    line: "Line C - Packaging",
    workOrder: "WO-1052",
    createdAt: "2026-03-14 06:45",
    recommendedAction: "Move packaging run forward by 1 shift or reschedule maintenance."
  },
  {
    id: "ALT-1024",
    type: "schedule delay risk",
    severity: "medium",
    status: "open",
    title: "Late inbound shipment may delay WO-1060",
    message: "Inbound actuator frames running 10 hours late, impacting due date.",
    line: "Line B - Assembly",
    workOrder: "WO-1060",
    createdAt: "2026-03-13 23:15",
    recommendedAction: "Pull buffer inventory or swap sequence with WO-1058."
  },
  {
    id: "ALT-1025",
    type: "resource bottleneck",
    severity: "low",
    status: "open",
    title: "QA inspection queue building",
    message: "QA inspection queue up 14% this shift.",
    line: "Line B - Assembly",
    createdAt: "2026-03-13 21:30",
    recommendedAction: "Shift QA inspector from Line C to Line B for 3 hours."
  },
  {
    id: "ALT-1026",
    type: "quality hold",
    severity: "high",
    status: "resolved",
    title: "Servo Assembly yield below threshold",
    message: "First-pass yield dropped to 92.1%. Investigation complete.",
    line: "Line A - Precision",
    workOrder: "WO-1038",
    createdAt: "2026-03-13 16:10",
    recommendedAction: "Hold remaining batch and run calibration routine."
  }
];

const typeFilters: Array<AlertType | "all"> = [
  "all",
  "material shortage",
  "machine downtime",
  "maintenance conflict",
  "schedule delay risk",
  "resource bottleneck",
  "quality hold"
];

const severityFilters: Array<AlertSeverity | "all"> = ["all", "high", "medium", "low"];
const statusFilters: Array<AlertStatus | "all"> = ["all", "open", "acknowledged", "resolved"];

const severityTone: Record<AlertSeverity, string> = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const statusTone: Record<AlertStatus, string> = {
  open: "border-slate-200 bg-slate-50 text-slate-700",
  acknowledged: "border-sky-200 bg-sky-50 text-sky-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

function getTopImpactedLine(alerts: AlertItem[]) {
  const tally = alerts.reduce<Record<string, number>>((acc, alert) => {
    acc[alert.line] = (acc[alert.line] ?? 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "-";
}

export function AlertsClient() {
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsData);
  const [filters, setFilters] = useState({ severity: "all", type: "all", status: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedAlert = useMemo(() => alerts.find((alert) => alert.id === selectedId) ?? null, [alerts, selectedId]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (filters.severity !== "all" && alert.severity !== filters.severity) return false;
      if (filters.type !== "all" && alert.type !== filters.type) return false;
      if (filters.status !== "all" && alert.status !== filters.status) return false;
      return true;
    });
  }, [alerts, filters]);

  const totalAlerts = alerts.length;
  const highCount = alerts.filter((alert) => alert.severity === "high").length;
  const openCount = alerts.filter((alert) => alert.status === "open").length;
  const resolvedCount = alerts.filter((alert) => alert.status === "resolved").length;
  const topLine = getTopImpactedLine(alerts);

  function updateStatus(status: AlertStatus) {
    if (!selectedAlert) return;
    setAlerts((prev) => prev.map((alert) => (alert.id === selectedAlert.id ? { ...alert, status } : alert)));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Alerts & Exception Management</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor production risks and resolve issues faster.</p>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-700">{totalAlerts} total alerts</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Alerts</p>
            <CardTitle className="text-2xl">{totalAlerts}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border border-rose-200/70 bg-rose-50/60 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-500">High Severity</p>
            <CardTitle className="text-2xl text-rose-700">{highCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open vs Resolved</p>
            <CardTitle className="text-2xl">
              {openCount} / {resolvedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top Impacted Line</p>
            <CardTitle className="text-base text-slate-900">{topLine}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alert Queue</p>
              <CardTitle>Filter by Severity, Type, or Status</CardTitle>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">{filteredAlerts.length} visible</Badge>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Severity
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.severity}
                onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
              >
                {severityFilters.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Type
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              >
                {typeFilters.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Status
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                {statusFilters.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => {
                  setSelectedId(alert.id);
                  setDrawerOpen(true);
                }}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{alert.type}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="mt-2 text-xs text-slate-500">{alert.message}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge className={cn("border", severityTone[alert.severity])}>{alert.severity}</Badge>
                    <Badge className={cn("border", statusTone[alert.status])}>{alert.status}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Line: {alert.line}</span>
                  {alert.workOrder ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      Work Order: {alert.workOrder}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{alert.createdAt}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full max-w-md translate-x-full border-l border-slate-200 bg-white shadow-2xl transition-transform",
          drawerOpen && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alert Detail</p>
            <p className="text-lg font-semibold text-slate-900">{selectedAlert?.id ?? "Select an alert"}</p>
          </div>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>
        <div className="space-y-5 px-6 py-5">
          {selectedAlert ? (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedAlert.title}</p>
                <p className="mt-1 text-xs text-slate-500">{selectedAlert.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("border", severityTone[selectedAlert.severity])}>{selectedAlert.severity}</Badge>
                <Badge className={cn("border", statusTone[selectedAlert.status])}>{selectedAlert.status}</Badge>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Impacted Line</span>
                  <span className="font-medium text-slate-900">{selectedAlert.line}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Work Order</span>
                  <span className="font-medium text-slate-900">{selectedAlert.workOrder ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span className="font-medium text-slate-900">{selectedAlert.createdAt}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recommended Action</p>
                <p className="mt-2 text-sm text-slate-700">{selectedAlert.recommendedAction}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => updateStatus("acknowledged")}>
                  Mark Acknowledged
                </Button>
                <Button onClick={() => updateStatus("resolved")}>Mark Resolved</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select an alert to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
