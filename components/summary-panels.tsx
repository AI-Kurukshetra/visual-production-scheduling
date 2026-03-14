import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Alert, WorkOrder } from "@/lib/types";

const severityClass: Record<Alert["severity"], string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-rose-600"
};

const priorityClass: Record<WorkOrder["priority"], string> = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-rose-600",
  critical: "text-rose-700"
};

export function AlertSummaryPanel({ alerts }: { alerts: Alert[] }) {
  const high = alerts.filter((alert) => alert.severity === "high").length;
  const medium = alerts.filter((alert) => alert.severity === "medium").length;
  const recent = alerts.slice(0, 3);

  return (
    <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alert Summary</p>
          <CardTitle>Exceptions & Risks</CardTitle>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-700">{alerts.length} Active</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <p className="text-xs text-slate-400">High Severity</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{high}</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Medium Severity</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{medium}</p>
          </div>
        </div>
        <div className="space-y-3">
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400">No active alerts.</p>
          ) : (
            recent.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{alert.type}</p>
                  <span className={`text-xs font-medium uppercase ${severityClass[alert.severity]}`}>{alert.severity}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-1 text-xs text-slate-500">{alert.description}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DelayedWorkOrdersTable({ workOrders }: { workOrders: WorkOrder[] }) {
  const delayed = workOrders.filter((wo) => wo.status === "delayed");

  return (
    <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Delayed Work Orders</p>
          <CardTitle>At-Risk Deliveries</CardTitle>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-rose-600">{delayed.length} Delayed</Badge>
      </CardHeader>
      <CardContent>
        {delayed.length === 0 ? (
          <p className="text-sm text-slate-400">All work orders are on track.</p>
        ) : (
          <div className="rounded-xl border border-slate-200/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayed.slice(0, 6).map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium text-slate-900">{wo.id}</TableCell>
                    <TableCell className="text-slate-600">{wo.product.name}</TableCell>
                    <TableCell className="text-slate-600">{wo.dueDate}</TableCell>
                    <TableCell className={`font-medium ${priorityClass[wo.priority]}`}>{wo.priority}</TableCell>
                    <TableCell>
                      <Badge className="border-rose-200 bg-rose-50 text-rose-600">Delayed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { AlertSummaryPanel as AlertSummary, DelayedWorkOrdersTable as DelayedWorkOrdersSummary };
