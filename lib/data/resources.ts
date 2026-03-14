import { resources as mockResources } from "@/lib/mock";
import type { Resource } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

function mapMachineStatus(status: string): Resource["status"] {
  if (status === "down") return "down";
  if (status === "maintenance") return "constrained";
  return "available";
}

function mapWorkerStatus(availability: number): Resource["status"] {
  if (availability < 0.4) return "constrained";
  return "available";
}

export async function getResources(): Promise<Resource[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockResources;
  }

  try {
    const machinesRes = await supabase
      .from("machines")
      .select("id,name,status,utilization")
      .order("name", { ascending: true });

    const workersRes = await supabase
      .from("workers")
      .select("id,name,availability")
      .order("name", { ascending: true });

    const machineResources: Resource[] = !machinesRes.error && isNonEmptyArray(machinesRes.data)
      ? machinesRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          type: "machine",
          utilization: Number(row.utilization ?? 0),
          status: mapMachineStatus(row.status)
        }))
      : [];

    const workerResources: Resource[] = !workersRes.error && isNonEmptyArray(workersRes.data)
      ? workersRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          type: "labor",
          utilization: Number(row.availability ?? 0),
          status: mapWorkerStatus(Number(row.availability ?? 0))
        }))
      : [];

    const combined = [...machineResources, ...workerResources];
    return combined.length > 0 ? combined : mockResources;
  } catch {
    return mockResources;
  }
}
