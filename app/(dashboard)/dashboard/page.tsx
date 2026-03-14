import { AiRecommendationsPanel } from "@/components/ai-recommendations";
import { KpiCard } from "@/components/kpi-card";
import { UtilizationChart } from "@/components/metric-chart";
import { ScenarioSelector } from "@/components/scenario-selector";
import { AlertSummaryPanel, DelayedWorkOrdersTable } from "@/components/summary-panels";
import { WorkOrderStatusChart } from "@/components/work-order-status-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert, Metric, Scenario, WorkOrder } from "@/lib/types";

const facilities = [
  { id: "fac-01", name: "Orion Plant - Detroit", location: "Detroit, MI" },
  { id: "fac-02", name: "Lynx Assembly - Austin", location: "Austin, TX" },
  { id: "fac-03", name: "Aurora Components - Reno", location: "Reno, NV" }
];

const kpis: Metric[] = [
  { id: "kpi-01", label: "OEE", value: 86.4, unit: "%", delta: 1.8 },
  { id: "kpi-02", label: "OTIF", value: 93.2, unit: "%", delta: 0.9 },
  { id: "kpi-03", label: "Utilization", value: 81.7, unit: "%", delta: -1.1 },
  { id: "kpi-04", label: "Setup Reduction", value: 12.6, unit: "%", delta: 2.4 }
];

const utilizationData = [
  { day: "Mon", utilization: 78 },
  { day: "Tue", utilization: 82 },
  { day: "Wed", utilization: 80 },
  { day: "Thu", utilization: 85 },
  { day: "Fri", utilization: 88 },
  { day: "Sat", utilization: 83 },
  { day: "Sun", utilization: 79 }
];

const workOrderStatus = [
  { name: "Scheduled", value: 48, color: "#3b82f6" },
  { name: "In Progress", value: 32, color: "#10b981" },
  { name: "Delayed", value: 9, color: "#f97316" },
  { name: "Complete", value: 112, color: "#94a3b8" }
];

const alerts: Alert[] = [
  {
    id: "alert-1",
    type: "maintenance",
    title: "Line 3 spindle vibration above threshold",
    description: "Schedule inspection within 24 hours to avoid downtime.",
    severity: "high",
    createdAt: "2026-03-12"
  },
  {
    id: "alert-2",
    type: "delay",
    title: "Supplier lead time extended for Control Board X12",
    description: "Risk of 2-day delay on WO-1041.",
    severity: "medium",
    createdAt: "2026-03-13"
  },
  {
    id: "alert-3",
    type: "quality",
    title: "Yield drop on Servo Assembly",
    description: "First-pass yield down 3.1% vs baseline.",
    severity: "low",
    createdAt: "2026-03-13"
  }
];

const workOrders: WorkOrder[] = [
  {
    id: "WO-1041",
    product: { id: "p-1", name: "Control Board X12", family: "Electronics", leadTimeDays: 6 },
    quantity: 420,
    dueDate: "2026-03-18",
    priority: "critical",
    status: "delayed",
    lineId: "line-2",
    operations: []
  },
  {
    id: "WO-1038",
    product: { id: "p-2", name: "Servo Assembly", family: "Motion", leadTimeDays: 4 },
    quantity: 180,
    dueDate: "2026-03-19",
    priority: "high",
    status: "delayed",
    lineId: "line-1",
    operations: []
  },
  {
    id: "WO-1052",
    product: { id: "p-3", name: "Valve Housing", family: "Fluid", leadTimeDays: 5 },
    quantity: 260,
    dueDate: "2026-03-20",
    priority: "medium",
    status: "delayed",
    lineId: "line-4",
    operations: []
  },
  {
    id: "WO-1060",
    product: { id: "p-4", name: "Actuator Frame", family: "Mechanical", leadTimeDays: 7 },
    quantity: 120,
    dueDate: "2026-03-22",
    priority: "high",
    status: "delayed",
    lineId: "line-3",
    operations: []
  }
];

const recommendations = [
  {
    id: "rec-1",
    title: "Shift load from Line C to Line B",
    action: "Move WO-1041 assembly to Line B for the next 48 hours.",
    impact: "OTIF +2.8%",
    eta: "2 days",
    confidence: 0.86
  },
  {
    id: "rec-2",
    title: "Batch similar setups",
    action: "Group Servo Assembly and Valve Housing to cut setup time by 1.3 hrs.",
    impact: "Setup -11%",
    eta: "1 day",
    confidence: 0.79
  },
  {
    id: "rec-3",
    title: "Expedite Control Boards",
    action: "Trigger supplier expedite for 180 units to avoid WO-1041 delay.",
    impact: "Delay risk -1.1 days",
    eta: "3 days",
    confidence: 0.73
  }
];

const scenarios: Scenario[] = [
  {
    id: "sc-1",
    name: "Base Plan",
    summary: "Current plan based on today’s committed orders and labor.",
    metrics: [
      { id: "sc-1-1", label: "OTIF", value: 92.4, unit: "%", delta: 0.0 },
      { id: "sc-1-2", label: "OEE", value: 85.1, unit: "%", delta: 0.0 },
      { id: "sc-1-3", label: "Utilization", value: 80.9, unit: "%", delta: 0.0 },
      { id: "sc-1-4", label: "Lead Time", value: 4.2, unit: "d", delta: 0.0 }
    ]
  },
  {
    id: "sc-2",
    name: "AI Optimized",
    summary: "AI-driven sequencing with setup minimization and balanced shifts.",
    metrics: [
      { id: "sc-2-1", label: "OTIF", value: 95.1, unit: "%", delta: 2.7 },
      { id: "sc-2-2", label: "OEE", value: 88.8, unit: "%", delta: 3.7 },
      { id: "sc-2-3", label: "Utilization", value: 84.6, unit: "%", delta: 3.7 },
      { id: "sc-2-4", label: "Lead Time", value: 3.6, unit: "d", delta: -0.6 }
    ]
  },
  {
    id: "sc-3",
    name: "Disruption Case",
    summary: "Modeled with supplier delay and reduced staffing on Line 2.",
    metrics: [
      { id: "sc-3-1", label: "OTIF", value: 88.3, unit: "%", delta: -4.1 },
      { id: "sc-3-2", label: "OEE", value: 80.2, unit: "%", delta: -4.9 },
      { id: "sc-3-3", label: "Utilization", value: 76.4, unit: "%", delta: -4.5 },
      { id: "sc-3-4", label: "Lead Time", value: 5.1, unit: "d", delta: 0.9 }
    ]
  }
];

export default function DashboardPage() {
  const facility = facilities[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Production Scheduling Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">{facility.location}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Live</Badge>
          <div className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 shadow-sm">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Facility</label>
            <select
              className="mt-1 w-48 bg-transparent text-sm font-medium text-slate-900 outline-none"
              defaultValue={facility.id}
            >
              {facilities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <ScenarioSelector scenarios={scenarios} />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Line Utilization</p>
              <CardTitle>Weekly Capacity Use</CardTitle>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">Avg 82%</Badge>
          </CardHeader>
          <CardContent>
            <UtilizationChart data={utilizationData} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Work Orders</p>
              <CardTitle>Status Mix</CardTitle>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">201 Total</Badge>
          </CardHeader>
          <CardContent>
            <WorkOrderStatusChart data={workOrderStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <AlertSummaryPanel alerts={alerts} />
        <AiRecommendationsPanel recommendations={recommendations} />
      </div>

      <DelayedWorkOrdersTable workOrders={workOrders} />
    </div>
  );
}
