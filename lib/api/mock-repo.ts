import type {
  AiRecommendation,
  Alert,
  AlertStatus,
  DashboardPayload,
  Facility,
  KpiMetric,
  ProductionLine,
  Resource,
  Scenario,
  ScheduleItem,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus
} from "@/lib/api/types";
import { generateAiRecommendations } from "@/lib/ai/recommendations";

const lines: ProductionLine[] = [
  { id: "line-a", name: "Line A - Precision", code: "A", throughputPerHour: 42 },
  { id: "line-b", name: "Line B - Assembly", code: "B", throughputPerHour: 38 },
  { id: "line-c", name: "Line C - Packaging", code: "C", throughputPerHour: 26 },
  { id: "line-d", name: "Line D - Finishing", code: "D", throughputPerHour: 30 }
];

let facilities: Facility[] = [
  {
    id: "fac-01",
    name: "Orion Plant - Detroit",
    location: "Detroit, MI",
    lines
  }
];

let workOrders: WorkOrder[] = [
  {
    id: "wo-1041",
    code: "WO-1041",
    product: { id: "prod-01", name: "Control Board X12", sku: "CBX12" },
    quantity: 420,
    priority: "critical",
    status: "delayed",
    progress: 42,
    dueDate: "2026-03-18",
    assignedLine: lines[1]
  },
  {
    id: "wo-1038",
    code: "WO-1038",
    product: { id: "prod-02", name: "Servo Assembly", sku: "SVA-02" },
    quantity: 180,
    priority: "high",
    status: "in-progress",
    progress: 64,
    dueDate: "2026-03-19",
    assignedLine: lines[0]
  },
  {
    id: "wo-1052",
    code: "WO-1052",
    product: { id: "prod-03", name: "Valve Housing", sku: "VH-11" },
    quantity: 260,
    priority: "medium",
    status: "scheduled",
    progress: 28,
    dueDate: "2026-03-20",
    assignedLine: lines[2]
  },
  {
    id: "wo-1060",
    code: "WO-1060",
    product: { id: "prod-04", name: "Actuator Frame", sku: "AF-08" },
    quantity: 120,
    priority: "high",
    status: "delayed",
    progress: 18,
    dueDate: "2026-03-22",
    assignedLine: lines[1]
  }
];

let resources: Resource[] = [
  {
    id: "res-01",
    name: "CNC-11",
    type: "machine",
    status: "busy",
    utilization: 0.88,
    assignedLine: lines[0],
    availability: "Next slot in 2 hrs"
  },
  {
    id: "res-02",
    name: "CNC-14",
    type: "machine",
    status: "maintenance",
    utilization: 0.42,
    assignedLine: lines[0],
    availability: "Maintenance until 4 PM"
  },
  {
    id: "res-03",
    name: "Assy Cell 4",
    type: "machine",
    status: "busy",
    utilization: 0.76,
    assignedLine: lines[1],
    availability: "Next slot in 1 hr"
  },
  {
    id: "res-04",
    name: "Paint Booth 2",
    type: "machine",
    status: "available",
    utilization: 0.31,
    assignedLine: lines[3],
    availability: "Available now"
  },
  {
    id: "res-05",
    name: "QA Inspector - Lin",
    type: "workforce",
    status: "busy",
    utilization: 0.91,
    assignedLine: lines[1],
    availability: "Free in 45 mins"
  },
  {
    id: "res-06",
    name: "Maintenance Tech - Perez",
    type: "workforce",
    status: "maintenance",
    utilization: 0.6,
    assignedLine: lines[2],
    availability: "On call"
  },
  {
    id: "res-07",
    name: "Material Handler - Kira",
    type: "workforce",
    status: "available",
    utilization: 0.38,
    assignedLine: lines[2],
    availability: "Available now"
  }
];

let alerts: Alert[] = [
  {
    id: "ALT-1021",
    type: "material shortage",
    severity: "high",
    status: "open",
    title: "Control Board X12 supply below safety stock",
    message: "Stock for X12 is 18% below safety stock. Risk of Line B stoppage.",
    line: lines[1],
    workOrderCode: "WO-1041",
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
    line: lines[0],
    workOrderCode: "WO-1038",
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
    line: lines[2],
    workOrderCode: "WO-1052",
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
    line: lines[1],
    workOrderCode: "WO-1060",
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
    line: lines[1],
    workOrderCode: null,
    createdAt: "2026-03-13 21:30",
    recommendedAction: "Shift QA inspector from Line C to Line B for 3 hours."
  }
];

let schedules: ScheduleItem[] = [
  { id: "sch-01", workOrderCode: "WO-1041", lineId: lines[1].id, startDay: 2, durationDays: 2, status: "delayed" },
  { id: "sch-02", workOrderCode: "WO-1038", lineId: lines[0].id, startDay: 1, durationDays: 3, status: "on-time" },
  { id: "sch-03", workOrderCode: "WO-1052", lineId: lines[2].id, startDay: 4, durationDays: 2, status: "on-time" },
  { id: "sch-04", workOrderCode: "WO-1060", lineId: lines[1].id, startDay: 5, durationDays: 2, status: "at-risk" }
];

const scenarios: Scenario[] = [
  {
    id: "sc-base",
    name: "Base Plan",
    summary: "Current committed plan using standard sequencing and staffing.",
    oee: 85.1,
    otif: 92.4,
    utilization: 80.9,
    setupReduction: 9.2,
    recommended: false
  },
  {
    id: "sc-ai",
    name: "AI Optimized",
    summary: "AI sequencing balances critical orders and minimizes changeovers.",
    oee: 88.8,
    otif: 95.1,
    utilization: 84.6,
    setupReduction: 13.8,
    recommended: true
  },
  {
    id: "sc-disruption",
    name: "Disruption Case",
    summary: "Supplier delay and reduced staffing impact throughput and delivery risk.",
    oee: 80.2,
    otif: 88.3,
    utilization: 76.4,
    setupReduction: 6.1,
    recommended: false
  }
];

const recommendationsSeed: AiRecommendation[] = [
  {
    id: "rec-01",
    title: "Shift QA inspector to reduce queue",
    action: "Move Lin to Line A for the next 3 hours to clear inspection backlog.",
    impact: "Inspection WIP -18%",
    eta: "3 hrs",
    confidence: 0.86
  },
  {
    id: "rec-02",
    title: "Reassign work order to healthier line",
    action: "Move WO-1041 from Line B to Line D while Assy Cell 4 is constrained.",
    impact: "OTIF +2.4%",
    eta: "1 day",
    confidence: 0.79
  },
  {
    id: "rec-03",
    title: "Group work orders to reduce setup time",
    action: "Batch Valve Housing and Actuator Frame to reduce setup by 1.5 hrs.",
    impact: "Setup -12%",
    eta: "2 days",
    confidence: 0.73
  }
];

function buildKpis(): KpiMetric[] {
  return [
    { id: "kpi-01", label: "OEE", value: 86.4, unit: "%", delta: 1.2 },
    { id: "kpi-02", label: "OTIF", value: 93.2, unit: "%", delta: 0.8 },
    { id: "kpi-03", label: "Utilization", value: 81.7, unit: "%", delta: -0.6 },
    { id: "kpi-04", label: "Setup Reduction", value: 12.6, unit: "%", delta: 2.4 }
  ];
}

function buildUtilization() {
  return [
    { day: "Mon", utilization: 78 },
    { day: "Tue", utilization: 82 },
    { day: "Wed", utilization: 80 },
    { day: "Thu", utilization: 85 },
    { day: "Fri", utilization: 88 },
    { day: "Sat", utilization: 83 },
    { day: "Sun", utilization: 79 }
  ];
}

function findLineById(id: string | null | undefined): ProductionLine | null {
  if (!id) return null;
  return lines.find((line) => line.id === id) ?? null;
}

export function getFacilities(): Facility[] {
  return facilities;
}

export function getDashboard(): DashboardPayload {
  const delayed = workOrders.filter((order) => order.status === "delayed").length;
  const highAlerts = alerts.filter((alert) => alert.severity === "high").length;
  const openAlerts = alerts.filter((alert) => alert.status === "open").length;

  return {
    facility: facilities[0],
    kpis: buildKpis(),
    utilization: buildUtilization(),
    delayedWorkOrders: delayed,
    alertSummary: {
      total: alerts.length,
      high: highAlerts,
      open: openAlerts
    }
  };
}

export function getWorkOrders(): WorkOrder[] {
  return workOrders;
}

export function createWorkOrder(input: {
  code?: string;
  productName: string;
  productSku?: string;
  quantity: number;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  dueDate: string;
  assignedLineId?: string | null;
}): WorkOrder {
  const id = `wo-${Date.now()}`;
  const code = input.code ?? `WO-${Math.floor(1000 + Math.random() * 9000)}`;
  const line = findLineById(input.assignedLineId ?? null);
  const order: WorkOrder = {
    id,
    code,
    product: {
      id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      name: input.productName,
      sku: input.productSku ?? "GEN-01"
    },
    quantity: input.quantity,
    priority: input.priority,
    status: input.status,
    progress: 0,
    dueDate: input.dueDate,
    assignedLine: line
  };
  workOrders = [order, ...workOrders];
  return order;
}

export function updateWorkOrder(id: string, patch: {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  dueDate?: string;
  assignedLineId?: string | null;
  progress?: number;
}): WorkOrder | null {
  const idx = workOrders.findIndex((order) => order.id === id);
  if (idx === -1) return null;
  const current = workOrders[idx];
  const next: WorkOrder = {
    ...current,
    status: patch.status ?? current.status,
    priority: patch.priority ?? current.priority,
    dueDate: patch.dueDate ?? current.dueDate,
    progress: patch.progress ?? current.progress,
    assignedLine: patch.assignedLineId ? findLineById(patch.assignedLineId) : current.assignedLine
  };
  workOrders = workOrders.map((order) => (order.id === id ? next : order));
  return next;
}

export function getResources(): Resource[] {
  return resources;
}

export function getAlerts(): Alert[] {
  return alerts;
}

export function updateAlert(id: string, status: AlertStatus): Alert | null {
  const idx = alerts.findIndex((alert) => alert.id === id);
  if (idx === -1) return null;
  const updated = { ...alerts[idx], status };
  alerts = alerts.map((alert) => (alert.id === id ? updated : alert));
  return updated;
}

export function getSchedules(): ScheduleItem[] {
  return schedules;
}

export function replanSchedule(): {
  updatedSchedules: ScheduleItem[];
  updatedWorkOrders: WorkOrder[];
  impact: { otifDelta: number; utilizationDelta: number };
} {
  const delayed = workOrders.find((order) => order.status === "delayed");
  if (!delayed) {
    return { updatedSchedules: schedules, updatedWorkOrders: workOrders, impact: { otifDelta: 0, utilizationDelta: 0 } };
  }

  const lineCounts = lines.map((line) => ({
    line,
    count: schedules.filter((item) => item.lineId === line.id).length
  }));
  const targetLine = lineCounts.sort((a, b) => a.count - b.count)[0]?.line ?? lines[0];

  schedules = schedules.map((item) =>
    item.workOrderCode === delayed.code
      ? { ...item, lineId: targetLine.id, status: "at-risk", startDay: Math.max(1, item.startDay - 1) }
      : item
  );

  workOrders = workOrders.map((order) =>
    order.id === delayed.id
      ? { ...order, status: "in-progress", assignedLine: targetLine, progress: Math.min(order.progress + 12, 100) }
      : order
  );

  return {
    updatedSchedules: schedules,
    updatedWorkOrders: workOrders,
    impact: { otifDelta: 1.8, utilizationDelta: 1.1 }
  };
}

export function getReplanImpactPreview(): { otifDelta: number; utilizationDelta: number } {
  return { otifDelta: 1.8, utilizationDelta: 1.1 };
}

export function getScenarios(): Scenario[] {
  return scenarios;
}

export function getAiRecommendations(): AiRecommendation[] {
  return generateAiRecommendations({
    facilities,
    workOrders,
    resources,
    schedules,
    recommendationsSeed,
    today: "2026-03-14",
    materialInventory: [
      { id: "mat-01", name: "Control Board X12", onHand: 180, threshold: 240, lineId: lines[1].id },
      { id: "mat-02", name: "Servo Assembly", onHand: 320, threshold: 300, lineId: lines[0].id }
    ]
  });
}
