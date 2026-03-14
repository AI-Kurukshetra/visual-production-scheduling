import { alerts as mockAlerts } from "@/lib/mock";
import type { Alert } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

export async function getAlerts(): Promise<Alert[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockAlerts;
  }

  try {
    const res = await supabase
      .from("alerts")
      .select("id,type,severity,message,created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (res.error || !isNonEmptyArray(res.data)) {
      return mockAlerts;
    }

    return res.data.map((row: any) => ({
      id: row.id,
      type: row.type,
      title: row.message,
      description: "",
      severity: row.severity,
      createdAt: formatDate(row.created_at)
    }));
  } catch {
    return mockAlerts;
  }
}
