import { scheduleItems as mockScheduleItems } from "@/lib/mock";
import type { ScheduleItem } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function mapStatus(status: string): ScheduleItem["status"] {
  switch (status) {
    case "blocked":
      return "at-risk";
    case "canceled":
      return "delayed";
    case "complete":
      return "on-time";
    default:
      return "on-time";
  }
}

function diffDays(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export async function getScheduledTasks(): Promise<ScheduleItem[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockScheduleItems;
  }

  try {
    const res = await supabase
      .from("scheduled_tasks")
      .select("id,work_order_id,production_line_id,start_time,end_time,status")
      .order("start_time", { ascending: true })
      .limit(60);

    if (res.error || !isNonEmptyArray(res.data)) {
      return mockScheduleItems;
    }

    const rows = res.data;
    const baseDate = new Date(rows[0].start_time);

    const items = rows.map((row: any) => {
      const start = new Date(row.start_time);
      const end = new Date(row.end_time);
      const startDay = diffDays(baseDate, start) + 1;
      const durationDays = Math.max(1, diffDays(start, end) || 1);

      return {
        id: row.id,
        workOrderId: row.work_order_id,
        lineId: row.production_line_id,
        startDay,
        durationDays,
        label: row.work_order_id,
        status: mapStatus(row.status)
      } as ScheduleItem;
    });

    return items.length > 0 ? items : mockScheduleItems;
  } catch {
    return mockScheduleItems;
  }
}
