export type MachineStatus = "running" | "idle" | "maintenance" | "down";
export type WorkOrderStatus = "scheduled" | "in-progress" | "delayed" | "complete" | "canceled";
export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type AlertType = "material" | "maintenance" | "delay" | "quality" | "safety";
export type AlertSeverity = "low" | "medium" | "high";

export type Facility = {
  id: string;
  name: string;
  location: string;
  lines: ProductionLine[];
};

export type ProductionLine = {
  id: string;
  name: string;
  throughputPerHour: number;
  machines: Machine[];
};

export type Machine = {
  id: string;
  name: string;
  status: MachineStatus;
  utilization: number;
};

export type Worker = {
  id: string;
  name: string;
  skill: string;
  availability: number;
};

export type Product = {
  id: string;
  name: string;
  family: string;
  leadTimeDays: number;
};

export type WorkOrder = {
  id: string;
  product: Product;
  quantity: number;
  dueDate: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  lineId: string;
  operations: Operation[];
};

export type Operation = {
  id: string;
  name: string;
  durationHours: number;
  setupHours: number;
  resourceIds: string[];
};

export type Resource = {
  id: string;
  name: string;
  type: "machine" | "labor" | "tooling" | "material";
  utilization: number;
  status: "available" | "constrained" | "down";
};

export type Inventory = {
  id: string;
  item: string;
  onHand: number;
  safetyStock: number;
  status: "ok" | "low" | "short";
};

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: string;
};

export type ScheduleItem = {
  id: string;
  workOrderId: string;
  lineId: string;
  startDay: number;
  durationDays: number;
  label: string;
  status: "on-time" | "at-risk" | "delayed";
};

export type Scenario = {
  id: string;
  name: "Base Plan" | "AI Optimized" | "Disruption Case";
  summary: string;
  metrics: Metric[];
};

export type Metric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta: number;
};
