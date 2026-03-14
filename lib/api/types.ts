export type WorkOrderStatus = "scheduled" | "in-progress" | "delayed" | "complete" | "canceled";
export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type ResourceStatus = "available" | "busy" | "maintenance" | "down";
export type ResourceType = "machine" | "workforce";
export type AlertSeverity = "high" | "medium" | "low";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type AlertType =
  | "material shortage"
  | "machine downtime"
  | "maintenance conflict"
  | "schedule delay risk"
  | "resource bottleneck"
  | "quality hold";

export type ProductionLine = {
  id: string;
  name: string;
  code: string;
  throughputPerHour: number;
};

export type Facility = {
  id: string;
  name: string;
  location: string;
  lines: ProductionLine[];
};

export type Product = {
  id: string;
  name: string;
  sku: string;
};

export type WorkOrder = {
  id: string;
  code: string;
  product: Product;
  quantity: number;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  progress: number;
  dueDate: string;
  assignedLine: ProductionLine | null;
};

export type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  utilization: number;
  assignedLine: ProductionLine | null;
  availability: string;
};

export type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  line: ProductionLine | null;
  workOrderCode: string | null;
  createdAt: string;
  recommendedAction: string;
};

export type ScheduleItem = {
  id: string;
  workOrderCode: string;
  lineId: string;
  startDay: number;
  durationDays: number;
  status: "on-time" | "at-risk" | "delayed";
};

export type Scenario = {
  id: string;
  name: "Base Plan" | "AI Optimized" | "Disruption Case";
  summary: string;
  oee: number;
  otif: number;
  utilization: number;
  setupReduction: number;
  recommended: boolean;
};

export type KpiMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta: number;
};

export type UtilizationPoint = {
  day: string;
  utilization: number;
};

export type DashboardPayload = {
  facility: Facility;
  kpis: KpiMetric[];
  utilization: UtilizationPoint[];
  delayedWorkOrders: number;
  alertSummary: {
    total: number;
    high: number;
    open: number;
  };
};

export type AiRecommendation = {
  id: string;
  title: string;
  action: string;
  impact: string;
  eta: string;
  confidence: number;
};
