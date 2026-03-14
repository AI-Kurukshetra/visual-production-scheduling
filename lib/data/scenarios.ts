import { scenarios as mockScenarios } from "@/lib/mock";
import type { Metric, Scenario } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function buildMetrics(row: any): Metric[] {
  return [
    { id: `${row.id}-oee`, label: "OEE", value: Number(row.oee ?? 0), unit: "%", delta: 0 },
    { id: `${row.id}-otif`, label: "OTIF", value: Number(row.otif ?? 0), unit: "%", delta: 0 },
    { id: `${row.id}-util`, label: "Utilization", value: Number(row.utilization ?? 0), unit: "%", delta: 0 },
    { id: `${row.id}-setup`, label: "Setup Reduction", value: Number(row.setup_reduction ?? 0), unit: "%", delta: 0 }
  ];
}

export async function getScenarios(): Promise<Scenario[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockScenarios;
  }

  try {
    const res = await supabase
      .from("scenarios")
      .select("id,name,summary,oee,otif,utilization,setup_reduction")
      .order("name", { ascending: true });

    if (res.error || !isNonEmptyArray(res.data)) {
      return mockScenarios;
    }

    return res.data.map((row: any) => ({
      id: row.id,
      name: row.name,
      summary: row.summary ?? "",
      metrics: buildMetrics(row)
    })) as Scenario[];
  } catch {
    return mockScenarios;
  }
}
