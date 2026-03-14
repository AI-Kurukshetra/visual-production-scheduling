import type { Alert, Facility, Inventory, Metric, Resource, Scenario, ScheduleItem, WorkOrder } from "@/lib/types";

export const facility: Facility = {
  id: "fac-01",
  name: "Apex Components Plant",
  location: "Columbus, OH",
  lines: [
    {
      id: "line-01",
      name: "Line A - Precision",
      throughputPerHour: 42,
      machines: [
        { id: "m-01", name: "CNC-22", status: "running", utilization: 0.88 },
        { id: "m-02", name: "Laser-7", status: "maintenance", utilization: 0.52 }
      ]
    },
    {
      id: "line-02",
      name: "Line B - Assembly",
      throughputPerHour: 58,
      machines: [
        { id: "m-03", name: "Press-11", status: "running", utilization: 0.91 },
        { id: "m-04", name: "Robot-4", status: "idle", utilization: 0.36 }
      ]
    },
    {
      id: "line-03",
      name: "Line C - Finishing",
      throughputPerHour: 35,
      machines: [
        { id: "m-05", name: "Coat-3", status: "down", utilization: 0.12 },
        { id: "m-06", name: "Pack-6", status: "running", utilization: 0.77 }
      ]
    }
  ]
};

export const workOrders: WorkOrder[] = [
  {
    id: "WO-10021",
    product: { id: "p-01", name: "Valve Housing", family: "Hydraulics", leadTimeDays: 6 },
    quantity: 480,
    dueDate: "2026-03-20",
    priority: "high",
    status: "in-progress",
    lineId: "line-01",
    operations: [
      { id: "op-01", name: "Rough CNC", durationHours: 12, setupHours: 1.5, resourceIds: ["res-01"] },
      { id: "op-02", name: "Finish CNC", durationHours: 8, setupHours: 1.0, resourceIds: ["res-02"] }
    ]
  },
  {
    id: "WO-10045",
    product: { id: "p-02", name: "Actuator Frame", family: "Motion", leadTimeDays: 4 },
    quantity: 620,
    dueDate: "2026-03-18",
    priority: "critical",
    status: "delayed",
    lineId: "line-02",
    operations: [
      { id: "op-03", name: "Stamping", durationHours: 10, setupHours: 2.0, resourceIds: ["res-03"] },
      { id: "op-04", name: "Assembly", durationHours: 14, setupHours: 1.0, resourceIds: ["res-04"] }
    ]
  },
  {
    id: "WO-10077",
    product: { id: "p-03", name: "Seal Kit", family: "Hydraulics", leadTimeDays: 3 },
    quantity: 1200,
    dueDate: "2026-03-17",
    priority: "medium",
    status: "scheduled",
    lineId: "line-03",
    operations: [
      { id: "op-05", name: "Coating", durationHours: 6, setupHours: 0.5, resourceIds: ["res-05"] },
      { id: "op-06", name: "Packaging", durationHours: 4, setupHours: 0.3, resourceIds: ["res-06"] }
    ]
  },
  {
    id: "WO-10102",
    product: { id: "p-04", name: "Servo Bracket", family: "Motion", leadTimeDays: 5 },
    quantity: 350,
    dueDate: "2026-03-22",
    priority: "high",
    status: "scheduled",
    lineId: "line-01",
    operations: [
      { id: "op-07", name: "Laser Cut", durationHours: 7, setupHours: 0.8, resourceIds: ["res-02"] }
    ]
  }
];

export const scheduleItems: ScheduleItem[] = [
  { id: "sch-01", workOrderId: "WO-10021", lineId: "line-01", startDay: 1, durationDays: 2, label: "WO-10021", status: "on-time" },
  { id: "sch-02", workOrderId: "WO-10102", lineId: "line-01", startDay: 4, durationDays: 2, label: "WO-10102", status: "at-risk" },
  { id: "sch-03", workOrderId: "WO-10045", lineId: "line-02", startDay: 1, durationDays: 3, label: "WO-10045", status: "delayed" },
  { id: "sch-04", workOrderId: "WO-10077", lineId: "line-03", startDay: 2, durationDays: 2, label: "WO-10077", status: "on-time" }
];

export const resources: Resource[] = [
  { id: "res-01", name: "CNC Cell 22", type: "machine", utilization: 0.82, status: "available" },
  { id: "res-02", name: "Laser Cell 7", type: "machine", utilization: 0.66, status: "constrained" },
  { id: "res-03", name: "Press Line 11", type: "machine", utilization: 0.91, status: "available" },
  { id: "res-04", name: "Assembly Pod B", type: "labor", utilization: 0.78, status: "available" },
  { id: "res-05", name: "Coating Booth 3", type: "tooling", utilization: 0.44, status: "down" },
  { id: "res-06", name: "Packaging Cell 6", type: "labor", utilization: 0.62, status: "available" }
];

export const inventory: Inventory[] = [
  { id: "inv-01", item: "Alloy 7075", onHand: 1200, safetyStock: 1500, status: "low" },
  { id: "inv-02", item: "Seal Rings", onHand: 8000, safetyStock: 4000, status: "ok" },
  { id: "inv-03", item: "Control Boards", onHand: 140, safetyStock: 300, status: "short" }
];

export const alerts: Alert[] = [
  {
    id: "al-01",
    type: "material",
    title: "Material shortage risk",
    description: "Control Boards inventory below safety stock for WO-10045.",
    severity: "high",
    createdAt: "2026-03-14T08:15:00Z"
  },
  {
    id: "al-02",
    type: "maintenance",
    title: "Scheduled maintenance overlap",
    description: "Laser Cell 7 downtime overlaps with WO-10102 setup window.",
    severity: "medium",
    createdAt: "2026-03-14T06:40:00Z"
  },
  {
    id: "al-03",
    type: "delay",
    title: "Delay risk flagged",
    description: "WO-10045 forecast slip of 1.2 days if no replanning.",
    severity: "high",
    createdAt: "2026-03-13T22:10:00Z"
  }
];

export const scenarios: Scenario[] = [
  {
    id: "sc-01",
    name: "Base Plan",
    summary: "Current schedule with maintenance constraints and material risk.",
    metrics: [
      { id: "m-01", label: "OEE", value: 78, unit: "%", delta: -2 },
      { id: "m-02", label: "OTIF", value: 88, unit: "%", delta: -4 },
      { id: "m-03", label: "Utilization", value: 84, unit: "%", delta: -3 },
      { id: "m-04", label: "Setup Reduction", value: 12, unit: "%", delta: 1 }
    ]
  },
  {
    id: "sc-02",
    name: "AI Optimized",
    summary: "Auto-balanced loads, expedited material, reduced setup.",
    metrics: [
      { id: "m-05", label: "OEE", value: 83, unit: "%", delta: 5 },
      { id: "m-06", label: "OTIF", value: 93, unit: "%", delta: 7 },
      { id: "m-07", label: "Utilization", value: 88, unit: "%", delta: 4 },
      { id: "m-08", label: "Setup Reduction", value: 18, unit: "%", delta: 6 }
    ]
  },
  {
    id: "sc-03",
    name: "Disruption Case",
    summary: "Unplanned downtime on Line C with material delay.",
    metrics: [
      { id: "m-09", label: "OEE", value: 71, unit: "%", delta: -9 },
      { id: "m-10", label: "OTIF", value: 81, unit: "%", delta: -12 },
      { id: "m-11", label: "Utilization", value: 76, unit: "%", delta: -8 },
      { id: "m-12", label: "Setup Reduction", value: 8, unit: "%", delta: -3 }
    ]
  }
];

export const kpis: Metric[] = [
  { id: "k-01", label: "OEE", value: 78, unit: "%", delta: -2 },
  { id: "k-02", label: "OTIF", value: 88, unit: "%", delta: -4 },
  { id: "k-03", label: "Utilization", value: 84, unit: "%", delta: -3 },
  { id: "k-04", label: "Setup Reduction", value: 12, unit: "%", delta: 1 }
];

export function getAiReplan() {
  const updatedWorkOrders = workOrders.map((wo) =>
    wo.status === "delayed" ? { ...wo, status: "in-progress" } : wo
  );
  const updatedSchedule = scheduleItems.map((item) =>
    item.status === "delayed" ? { ...item, status: "at-risk", startDay: item.startDay + 1 } : item
  );
  const updatedScenarios = scenarios.map((scenario) =>
    scenario.name === "AI Optimized"
      ? {
          ...scenario,
          metrics: scenario.metrics.map((metric) => ({
            ...metric,
            value: metric.value + 2,
            delta: metric.delta + 1
          }))
        }
      : scenario
  );
  return { updatedWorkOrders, updatedSchedule, updatedScenarios };
}
