import { workOrders as mockWorkOrders } from "@/lib/mock";
import type { WorkOrder } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockWorkOrders;
  }

  try {
    const res = await supabase
      .from("work_orders")
      .select("id,quantity,due_date,priority,status,assigned_line_id,product:products(id,name,family,lead_time_days)")
      .order("due_date", { ascending: true })
      .limit(40);

    if (res.error || !isNonEmptyArray(res.data)) {
      return mockWorkOrders;
    }

    return res.data.map((row: any) => ({
      id: row.id,
      product: {
        id: row.product?.id ?? "",
        name: row.product?.name ?? "Unknown",
        family: row.product?.family ?? "",
        leadTimeDays: row.product?.lead_time_days ?? 0
      },
      quantity: row.quantity ?? 0,
      dueDate: formatDate(row.due_date),
      priority: row.priority,
      status: row.status,
      lineId: row.assigned_line_id ?? "",
      operations: []
    }));
  } catch {
    return mockWorkOrders;
  }
}
