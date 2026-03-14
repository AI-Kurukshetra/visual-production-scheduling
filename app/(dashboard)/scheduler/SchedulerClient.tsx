"use client";

import { useMemo, useState } from "react";
import { AiReplanButton } from "@/components/ai-replan";
import { Gantt, type MaintenanceWindow } from "@/components/gantt";
import { KpiCard } from "@/components/kpi-card";
import { ScenarioSelector } from "@/components/scenario-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  Facility,
  Metric,
  ProductionLine,
  ScheduleItem,
  Scenario,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus
} from "@/lib/types";

const mockFacility: Facility = {
  id: "fac-01",
  name: "Orion Plant - Detroit",
  location: "Detroit, MI",
  lines: [
    {
      id: "line-01",
      name: "Line A - Precision",
      throughputPerHour: 42,
      machines: [
        { id: "m-01", name: "CNC-01", status: "running", utilization: 0.84 },
        { id: "m-02", name: "CNC-02", status: "idle", utilization: 0.72 }
      ]
    },
    {
      id: "line-02",
      name: "Line B - Assembly",
      throughputPerHour: 38,
      machines: [
        { id: "m-03", name: "ASSY-11", status: "running", utilization: 0.9 },
        { id: "m-04", name: "ASSY-12", status: "maintenance", utilization: 0.68 }
      ]
    },
    {
      id: "line-03",
      name: "Line C - Packaging",
      throughputPerHour: 26,
      machines: [
        { id: "m-05", name: "PACK-08", status: "running", utilization: 0.63 },
        { id: "m-06", name: "PACK-09", status: "running", utilization: 0.58 }
      ]
    }
  ]
};

const mockWorkOrders: WorkOrder[] = [
  {
    id: "WO-1041",
    product: { id: "p-01", name: "Control Board X12", family: "Electronics", leadTimeDays: 6 },
    quantity: 420,
    dueDate: "2026-03-18",
    priority: "critical",
    status: "delayed",
    lineId: "line-02",
    operations: []
  },
  {
    id: "WO-1038",
    product: { id: "p-02", name: "Servo Assembly", family: "Motion", leadTimeDays: 4 },
    quantity: 180,
    dueDate: "2026-03-19",
    priority: "high",
    status: "in-progress",
    lineId: "line-01",
    operations: []
  },
  {
    id: "WO-1052",
    product: { id: "p-03", name: "Valve Housing", family: "Fluid", leadTimeDays: 5 },
    quantity: 260,
    dueDate: "2026-03-20",
    priority: "medium",
    status: "scheduled",
    lineId: "line-03",
    operations: []
  },
  {
    id: "WO-1060",
    product: { id: "p-04", name: "Actuator Frame", family: "Mechanical", leadTimeDays: 7 },
    quantity: 120,
    dueDate: "2026-03-22",
    priority: "high",
    status: "delayed",
    lineId: "line-02",
    operations: []
  }
];

const mockSchedule: ScheduleItem[] = [
  { id: "sch-01", workOrderId: "WO-1041", lineId: "line-02", startDay: 2, durationDays: 2, label: "WO-1041", status: "delayed" },
  { id: "sch-02", workOrderId: "WO-1038", lineId: "line-01", startDay: 1, durationDays: 3, label: "WO-1038", status: "on-time" },
  { id: "sch-03", workOrderId: "WO-1052", lineId: "line-03", startDay: 4, durationDays: 2, label: "WO-1052", status: "on-time" },
  { id: "sch-04", workOrderId: "WO-1060", lineId: "line-02", startDay: 5, durationDays: 2, label: "WO-1060", status: "at-risk" }
];

const mockKpis: Metric[] = [
  { id: "kpi-01", label: "OEE", value: 86.4, unit: "%", delta: 1.2 },
  { id: "kpi-02", label: "OTIF", value: 93.2, unit: "%", delta: 0.8 },
  { id: "kpi-03", label: "Utilization", value: 81.7, unit: "%", delta: -0.6 },
  { id: "kpi-04", label: "Setup Reduction", value: 12.6, unit: "%", delta: 2.4 }
];

const mockScenarios: Scenario[] = [
  {
    id: "sc-base",
    name: "Base Plan",
    summary: "Current plan based on committed orders and staffing.",
    metrics: mockKpis
  },
  {
    id: "sc-ai",
    name: "AI Optimized",
    summary: "Balanced line loads and minimized setups for better OTIF.",
    metrics: mockKpis.map((metric) => ({ ...metric, value: metric.value + 2.1, delta: metric.delta + 1.1 }))
  },
  {
    id: "sc-disruption",
    name: "Disruption Case",
    summary: "Modeled supplier delay and reduced labor on Line B.",
    metrics: mockKpis.map((metric) => ({ ...metric, value: metric.value - 3.2, delta: metric.delta - 1.5 }))
  }
];

const statusOptions: Array<WorkOrderStatus | "all"> = [
  "all",
  "scheduled",
  "in-progress",
  "delayed",
  "complete",
  "canceled"
];
const priorityOptions: Array<WorkOrderPriority | "all"> = ["all", "critical", "high", "medium", "low"];

function buildMaintenance(lines: ProductionLine[]): MaintenanceWindow[] {
  return [
    { id: "mw-01", lineId: lines[0]?.id ?? "", startDay: 3, durationDays: 1, label: "Maintenance" },
    { id: "mw-02", lineId: lines[1]?.id ?? "", startDay: 5, durationDays: 1, label: "Calibration" }
  ].filter((item) => item.lineId);
}

function buildWorkOrderMap(orders: WorkOrder[]) {
  return orders.reduce<Record<string, WorkOrder | undefined>>((acc, order) => {
    acc[order.id] = order;
    return acc;
  }, {});
}

function buildLineUtilization(lines: ProductionLine[]) {
  return lines.reduce<Record<string, number>>((acc, line) => {
    const machines = line.machines ?? [];
    const avg = machines.length > 0 ? machines.reduce((sum, machine) => sum + machine.utilization, 0) / machines.length : 0;
    acc[line.id] = Number.isFinite(avg) ? avg : 0;
    return acc;
  }, {});
}

function bumpMetrics(metrics: Metric[]) {
  return metrics.map((metric) => ({
    ...metric,
    value: Number((metric.value + 1.4).toFixed(1)),
    delta: Number((metric.delta + 0.6).toFixed(1))
  }));
}

export function SchedulerClient() {
  const [items, setItems] = useState<ScheduleItem[]>(mockSchedule);
  const [orders, setOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [kpis, setKpis] = useState<Metric[]>(mockKpis);
  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);
  const [viewMode, setViewMode] = useState<"days" | "shifts">("days");
  const [filters, setFilters] = useState({ lineId: "all", status: "all", priority: "all", productId: "all" });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const maintenance = useMemo(() => buildMaintenance(mockFacility.lines), []);
  const lineUtilization = useMemo(() => buildLineUtilization(mockFacility.lines), []);
  const workOrdersById = useMemo(() => buildWorkOrderMap(orders), [orders]);

  const visibleLines = useMemo(() => {
    if (filters.lineId === "all") {
      return mockFacility.lines;
    }
    return mockFacility.lines.filter((line) => line.id === filters.lineId);
  }, [filters.lineId]);

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((order) => {
      map.set(order.product.id, order.product.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const order = workOrdersById[item.workOrderId];
      if (!order) return false;
      if (filters.lineId !== "all" && item.lineId !== filters.lineId) return false;
      if (filters.status !== "all" && order.status !== filters.status) return false;
      if (filters.priority !== "all" && order.priority !== filters.priority) return false;
      if (filters.productId !== "all" && order.product.id !== filters.productId) return false;
      return true;
    });
  }, [filters.lineId, filters.priority, filters.productId, filters.status, items, workOrdersById]);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedItemId) ?? null, [items, selectedItemId]);
  const selectedOrder = selectedItem ? workOrdersById[selectedItem.workOrderId] : undefined;
  const selectedLine = selectedOrder
    ? mockFacility.lines.find((line) => line.id === selectedOrder.lineId)
    : selectedItem
      ? mockFacility.lines.find((line) => line.id === selectedItem.lineId)
      : undefined;

  async function handleReplan() {
    const delayedOrder = orders.find((order) => order.status === "delayed");
    if (!delayedOrder) return;

    const lineLoad = mockFacility.lines.map((line) => ({
      line,
      count: items.filter((item) => item.lineId === line.id).length
    }));

    const targetLine = lineLoad.sort((a, b) => a.count - b.count)[0]?.line ?? mockFacility.lines[0];

    const updatedOrders = orders.map((order) =>
      order.id === delayedOrder.id
        ? { ...order, status: "in-progress", lineId: targetLine.id }
        : order
    );

    const updatedItems = items.map((item) =>
      item.workOrderId === delayedOrder.id
        ? { ...item, lineId: targetLine.id, status: "at-risk", startDay: Math.max(1, item.startDay - 1) }
        : item
    );

    setOrders(updatedOrders);
    setItems(updatedItems);
    setKpis((prev) => bumpMetrics(prev));

    const aiScenario = scenarios.find((scenario) => scenario.name === "AI Optimized");
    if (aiScenario) {
      setScenarios((prev) =>
        prev.map((scenario) =>
          scenario.id === aiScenario.id ? { ...scenario, metrics: bumpMetrics(aiScenario.metrics) } : scenario
        )
      );
    }

    const updatedSelected = updatedItems.find((item) => item.workOrderId === delayedOrder.id);
    setSelectedItemId(updatedSelected?.id ?? null);
    setDrawerOpen(true);
  }

  return (
    <div className="relative space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Visual Production Scheduler</h1>
          <p className="mt-1 text-sm text-slate-500">{mockFacility.location}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Live</Badge>
          <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 shadow-sm">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Facility</label>
            <select className="mt-1 w-56 bg-transparent text-sm font-medium text-slate-900 outline-none" defaultValue={mockFacility.id}>
              <option value={mockFacility.id}>{mockFacility.name}</option>
            </select>
          </div>
          <AiReplanButton onReplan={handleReplan} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <ScenarioSelector scenarios={scenarios} />

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Gantt Schedule</p>
              <CardTitle>Lines by Day or Shift</CardTitle>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">{filteredItems.length} jobs</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              Delayed
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              At-risk
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              On-time
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-400" />
              Maintenance
            </span>
            <div className="ml-auto">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1 font-medium",
                    viewMode === "days" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  )}
                  onClick={() => setViewMode("days")}
                >
                  Days
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1 font-medium",
                    viewMode === "shifts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  )}
                  onClick={() => setViewMode("shifts")}
                >
                  Shifts
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Line
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.lineId}
                onChange={(event) => setFilters((prev) => ({ ...prev, lineId: event.target.value }))}
              >
                <option value="all">All Lines</option>
                {mockFacility.lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
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
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Priority
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.priority}
                onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Product
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.productId}
                onChange={(event) => setFilters((prev) => ({ ...prev, productId: event.target.value }))}
              >
                <option value="all">All Products</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredItems.length === 0 || visibleLines.length === 0 ? (
            <p className="text-sm text-slate-500">No scheduled tasks available for the current filters.</p>
          ) : (
            <Gantt
              items={filteredItems}
              lines={visibleLines}
              maintenance={maintenance}
              view={viewMode}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setDrawerOpen(true);
              }}
              selectedItemId={selectedItemId}
              workOrdersById={workOrdersById}
              lineUtilization={lineUtilization}
            />
          )}
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Work Order Details</p>
            <p className="text-lg font-semibold text-slate-900">{selectedOrder?.id ?? "Select a block"}</p>
          </div>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.product.name}</p>
                  <p className="text-xs text-slate-500">Due {selectedOrder.dueDate}</p>
                </div>
                <Badge
                  className={cn(
                    "border",
                    selectedOrder.status === "delayed" && "border-rose-200 bg-rose-50 text-rose-700",
                    selectedOrder.status === "in-progress" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    selectedOrder.status === "scheduled" && "border-slate-200 bg-slate-50 text-slate-700"
                  )}
                >
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Priority</span>
                  <span className="font-medium text-slate-900">{selectedOrder.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quantity</span>
                  <span className="font-medium text-slate-900">{selectedOrder.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assigned Line</span>
                  <span className="font-medium text-slate-900">{selectedLine?.name ?? "Unassigned"}</span>
                </div>
              </div>
              {selectedItem ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  Scheduled for {selectedItem.durationDays} day(s) starting Day {selectedItem.startDay}.
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-500">Click a scheduled block to view full details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
