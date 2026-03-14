export type Facility = {
  id: string;
  name: string;
  location: string | null;
  created_at: string;
};

export type ProductionLine = {
  id: string;
  facility_id: string;
  name: string;
  throughput_per_hour: number | null;
  created_at: string;
};

export type Machine = {
  id: string;
  production_line_id: string;
  name: string;
  status: MachineStatus;
  utilization: number;
  created_at: string;
};

export type Worker = {
  id: string;
  facility_id: string;
  name: string;
  skill: string | null;
  availability: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  family: string | null;
  lead_time_days: number | null;
  created_at: string;
};

export type WorkOrder = {
  id: string;
  code: string;
  facility_id: string;
  product_id: string;
  quantity: number;
  priority: WorkOrderPriority;
  due_date: string;
  progress: number;
  status: WorkOrderStatus;
  assigned_line_id: string | null;
  created_at: string;
};

export type ScheduledTask = {
  id: string;
  work_order_id: string;
  production_line_id: string;
  machine_id: string | null;
  start_time: string;
  end_time: string;
  status: TaskStatus;
  created_at: string;
};

export type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  related_work_order_id: string | null;
  related_line_id: string | null;
  created_at: string;
};

export type Scenario = {
  id: string;
  name: string;
  oee: number;
  otif: number;
  utilization: number;
  setup_reduction: number;
  summary: string | null;
  created_at: string;
};

export type MetricSnapshot = {
  id: string;
  facility_id: string;
  scenario_id: string | null;
  oee: number;
  otif: number;
  utilization: number;
  setup_reduction: number;
  captured_at: string;
};

export type Tables = {
  facilities: Facility;
  production_lines: ProductionLine;
  machines: Machine;
  workers: Worker;
  products: Product;
  work_orders: WorkOrder;
  scheduled_tasks: ScheduledTask;
  alerts: Alert;
  scenarios: Scenario;
  metric_snapshots: MetricSnapshot;
};

export type MachineStatus = "running" | "idle" | "maintenance" | "down";
export type WorkOrderStatus = "scheduled" | "in-progress" | "delayed" | "complete" | "canceled";
export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "planned" | "in-progress" | "blocked" | "complete" | "canceled";
export type AlertType = "material" | "maintenance" | "delay" | "quality" | "safety";
export type AlertSeverity = "low" | "medium" | "high";
export type AlertStatus = "open" | "acknowledged" | "resolved";
