import { facility as mockFacility } from "@/lib/mock";
import type { Facility, ProductionLine } from "@/lib/types";
import { getSupabaseOrNull, isNonEmptyArray } from "@/lib/data/supabase-utils";

type MachineRow = {
  id: string;
  name: string;
  status: any;
  utilization: number;
  production_line_id: string;
};

export async function getFacilitySnapshot(): Promise<Facility> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return mockFacility;
  }

  try {
    const facilityRes = await supabase.from("facilities").select("id,name,location").limit(1).single();
    if (facilityRes.error || !facilityRes.data) {
      return mockFacility;
    }

    const facility = facilityRes.data;
    const linesRes = await supabase
      .from("production_lines")
      .select("id,name,throughput_per_hour")
      .eq("facility_id", facility.id)
      .order("name", { ascending: true });

    const lines = linesRes.error || !isNonEmptyArray(linesRes.data) ? [] : linesRes.data;
    const lineIds = lines.map((line) => line.id);

    let machines: MachineRow[] = [];
    if (lineIds.length > 0) {
      const machinesRes = await supabase
        .from("machines")
        .select("id,name,status,utilization,production_line_id")
        .in("production_line_id", lineIds);

      if (!machinesRes.error && isNonEmptyArray(machinesRes.data)) {
        machines = machinesRes.data.map((machine: any) => ({
          id: machine.id,
          name: machine.name,
          status: machine.status,
          utilization: Number(machine.utilization ?? 0),
          production_line_id: machine.production_line_id
        }));
      }
    }

    const productionLines: ProductionLine[] = lines.map((line: any) => ({
      id: line.id,
      name: line.name,
      throughputPerHour: line.throughput_per_hour ?? 0,
      machines: machines
        .filter((machine) => line.id === machine.production_line_id)
        .map((machine) => ({
          id: machine.id,
          name: machine.name,
          status: machine.status,
          utilization: machine.utilization
        }))
    }));

    if (!isNonEmptyArray(productionLines)) {
      return mockFacility;
    }

    return {
      id: facility.id,
      name: facility.name,
      location: facility.location ?? "",
      lines: productionLines
    };
  } catch {
    return mockFacility;
  }
}
