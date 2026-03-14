"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type WorkOrderStatus = "scheduled" | "in-progress" | "delayed" | "complete" | "canceled";
type WorkOrderPriority = "low" | "medium" | "high" | "critical";

type WorkOrder = {
  id: string;
  product: string;
  quantity: number;
  line: string;
  priority: WorkOrderPriority;
  dueDate: string;
  progress: number;
  status: WorkOrderStatus;
};

type FormState = {
  id: string;
  product: string;
  quantity: string;
  line: string;
  priority: WorkOrderPriority;
  dueDate: string;
  status: WorkOrderStatus;
};

const initialOrders: WorkOrder[] = [
  {
    id: "WO-1041",
    product: "Control Board X12",
    quantity: 420,
    line: "Line B - Assembly",
    priority: "critical",
    dueDate: "2026-03-18",
    progress: 42,
    status: "delayed"
  },
  {
    id: "WO-1038",
    product: "Servo Assembly",
    quantity: 180,
    line: "Line A - Precision",
    priority: "high",
    dueDate: "2026-03-19",
    progress: 64,
    status: "in-progress"
  },
  {
    id: "WO-1052",
    product: "Valve Housing",
    quantity: 260,
    line: "Line C - Packaging",
    priority: "medium",
    dueDate: "2026-03-20",
    progress: 28,
    status: "scheduled"
  },
  {
    id: "WO-1060",
    product: "Actuator Frame",
    quantity: 120,
    line: "Line B - Assembly",
    priority: "high",
    dueDate: "2026-03-22",
    progress: 18,
    status: "delayed"
  },
  {
    id: "WO-1068",
    product: "Pressure Manifold",
    quantity: 90,
    line: "Line A - Precision",
    priority: "low",
    dueDate: "2026-03-24",
    progress: 100,
    status: "complete"
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

const lineOptions = ["Line A - Precision", "Line B - Assembly", "Line C - Packaging", "Line D - Finishing"];

const statusTone: Record<WorkOrderStatus, string> = {
  scheduled: "border-slate-200 bg-slate-50 text-slate-700",
  "in-progress": "border-sky-200 bg-sky-50 text-sky-700",
  delayed: "border-rose-200 bg-rose-50 text-rose-700",
  complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  canceled: "border-slate-200 bg-slate-100 text-slate-500"
};

const priorityTone: Record<WorkOrderPriority, string> = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-rose-600",
  critical: "text-rose-700"
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function buildFormState(): FormState {
  return {
    id: "",
    product: "",
    quantity: "",
    line: lineOptions[0],
    priority: "medium",
    dueDate: "",
    status: "scheduled"
  };
}

export function WorkOrdersClient() {
  const [orders, setOrders] = useState<WorkOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "all", priority: "all", line: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(buildFormState());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId) ?? null, [orders, selectedId]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.trim().toLowerCase();
      if (query) {
        const haystack = `${order.id} ${order.product} ${order.line}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.status !== "all" && order.status !== filters.status) return false;
      if (filters.priority !== "all" && order.priority !== filters.priority) return false;
      if (filters.line !== "all" && order.line !== filters.line) return false;
      return true;
    });
  }, [orders, search, filters]);

  function handleSelect(order: WorkOrder) {
    setSelectedId(order.id);
    setDrawerOpen(true);
  }

  function updateSelectedStatus(status: WorkOrderStatus) {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((order) => (order.id === selectedOrder.id ? { ...order, status } : order))
    );
  }

  function updateSelectedLine(line: string) {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((order) => (order.id === selectedOrder.id ? { ...order, line } : order))
    );
  }

  function validateForm(state: FormState) {
    const errors: Record<string, string> = {};
    if (!state.id.trim()) errors.id = "Work order ID is required.";
    if (!state.product.trim()) errors.product = "Product name is required.";
    if (!state.quantity.trim() || Number(state.quantity) <= 0) errors.quantity = "Quantity must be greater than 0.";
    if (!state.dueDate.trim()) errors.dueDate = "Due date is required.";
    return errors;
  }

  function handleCreate() {
    const errors = validateForm(formState);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newOrder: WorkOrder = {
      id: formState.id.trim(),
      product: formState.product.trim(),
      quantity: Number(formState.quantity),
      line: formState.line,
      priority: formState.priority,
      dueDate: formState.dueDate,
      progress: 0,
      status: formState.status
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCreateOpen(false);
    setFormState(buildFormState());
    setFormErrors({});
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Active, scheduled, and delayed production orders.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Work Order</Button>
      </div>

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order Pipeline</p>
              <CardTitle>Search & Filter</CardTitle>
            </div>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">{filteredOrders.length} orders</Badge>
          </div>
          <div className="grid gap-3 lg:grid-cols-[2fr,1fr,1fr,1fr]">
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by work order, product, or line"
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
              />
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
              Line
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={filters.line}
                onChange={(event) => setFilters((prev) => ({ ...prev, line: event.target.value }))}
              >
                <option value="all">All Lines</option>
                {lineOptions.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Work Order</TH>
                  <TH>Product</TH>
                  <TH>Qty</TH>
                  <TH>Line</TH>
                  <TH>Priority</TH>
                  <TH>Due Date</TH>
                  <TH>Progress</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody className="divide-slate-200">
                {filteredOrders.map((order) => (
                  <TR
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSelect(order)}
                  >
                    <TD className="font-semibold text-slate-900">{order.id}</TD>
                    <TD className="text-slate-600">{order.product}</TD>
                    <TD className="text-slate-600">{order.quantity}</TD>
                    <TD className="text-slate-600">{order.line}</TD>
                    <TD className={cn("font-medium", priorityTone[order.priority])}>{order.priority}</TD>
                    <TD className="text-slate-600">{formatDate(order.dueDate)}</TD>
                    <TD>
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              order.progress >= 80 && "bg-emerald-500",
                              order.progress >= 40 && order.progress < 80 && "bg-sky-500",
                              order.progress < 40 && "bg-amber-500"
                            )}
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">{order.progress}%</p>
                      </div>
                    </TD>
                    <TD>
                      <Badge className={cn("border", statusTone[order.status])}>{order.status}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Work Order Details</p>
            <p className="text-lg font-semibold text-slate-900">{selectedOrder?.id ?? "Select a row"}</p>
          </div>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>
        <div className="space-y-5 px-6 py-5">
          {selectedOrder ? (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedOrder.product}</p>
                <p className="text-xs text-slate-500">Due {formatDate(selectedOrder.dueDate)}</p>
              </div>
              <div className="grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Priority</span>
                  <span className={cn("font-medium", priorityTone[selectedOrder.priority])}>
                    {selectedOrder.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quantity</span>
                  <span className="font-medium text-slate-900">{selectedOrder.quantity}</span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                  value={selectedOrder.status}
                  onChange={(event) => updateSelectedStatus(event.target.value as WorkOrderStatus)}
                >
                  {statusOptions.filter((status) => status !== "all").map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Assigned Line</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                  value={selectedOrder.line}
                  onChange={(event) => updateSelectedLine(event.target.value)}
                >
                  {lineOptions.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Progress at {selectedOrder.progress}%. Operator update required for next checkpoint.
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a work order to view details.</p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/40 p-4",
          createOpen && "flex"
        )}
      >
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Create Work Order</p>
              <p className="text-lg font-semibold text-slate-900">New Production Order</p>
            </div>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Close
            </Button>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Work Order ID
              <input
                value={formState.id}
                onChange={(event) => setFormState((prev) => ({ ...prev, id: event.target.value }))}
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
              />
              {formErrors.id ? <span className="text-xs text-rose-600">{formErrors.id}</span> : null}
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Product
              <input
                value={formState.product}
                onChange={(event) => setFormState((prev) => ({ ...prev, product: event.target.value }))}
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
              />
              {formErrors.product ? <span className="text-xs text-rose-600">{formErrors.product}</span> : null}
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Quantity
              <input
                value={formState.quantity}
                onChange={(event) => setFormState((prev) => ({ ...prev, quantity: event.target.value }))}
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
              />
              {formErrors.quantity ? <span className="text-xs text-rose-600">{formErrors.quantity}</span> : null}
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Due Date
              <input
                type="date"
                value={formState.dueDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
              />
              {formErrors.dueDate ? <span className="text-xs text-rose-600">{formErrors.dueDate}</span> : null}
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Priority
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={formState.priority}
                onChange={(event) => setFormState((prev) => ({ ...prev, priority: event.target.value as WorkOrderPriority }))}
              >
                {priorityOptions.filter((priority) => priority !== "all").map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Status
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={formState.status}
                onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as WorkOrderStatus }))}
              >
                {statusOptions.filter((status) => status !== "all").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Assigned Line
              <select
                className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700"
                value={formState.line}
                onChange={(event) => setFormState((prev) => ({ ...prev, line: event.target.value }))}
              >
                {lineOptions.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
