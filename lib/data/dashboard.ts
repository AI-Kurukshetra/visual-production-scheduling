import { kpis as mockKpis } from "@/lib/mock";
import type { Metric } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function buildMetrics(current: any, previous?: any): Metric[] {
  const delta = (key: string) => Number(current?.[key] ?? 0) - Number(previous?.[key] ?? current?.[key] ?? 0);

  return [
    { id: "kpi-oee", label: "OEE", value: Number(current?.oee ?? 0), unit: "%", delta: delta("oee") },
    { id: "kpi-otif", label: "OTIF", value: Number(current?.otif ?? 0), unit: "%", delta: delta("otif") },
    { id: "kpi-util", label: "Utilization", value: Number(current?.utilization ?? 0), unit: "%", delta: delta("utilization") },
    { id: "kpi-setup", label: "Setup Reduction", value: Number(current?.setup_reduction ?? 0), unit: "%", delta: delta("setup_reduction") }
  ];
}

export async function getDashboardMetrics(): Promise<Metric[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockKpis;
  }

  try {
    const facilityRes = await supabase.from("facilities").select("id").limit(1).single();
    if (facilityRes.error || !facilityRes.data) {
      return mockKpis;
    }

    const snapshotRes = await supabase
      .from("metric_snapshots")
      .select("oee,otif,utilization,setup_reduction,captured_at")
      .eq("facility_id", facilityRes.data.id)
      .order("captured_at", { ascending: false })
      .limit(2);

    if (snapshotRes.error || !isNonEmptyArray(snapshotRes.data)) {
      return mockKpis;
    }

    const current = snapshotRes.data[0];
    const previous = snapshotRes.data.length > 1 ? snapshotRes.data[1] : undefined;
    const metrics = buildMetrics(current, previous);

    return metrics.some((metric) => metric.value > 0) ? metrics : mockKpis;
  } catch {
    return mockKpis;
  }
}
