import type { ProductionLine, ScheduleItem, WorkOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type MaintenanceWindow = {
  id: string;
  lineId: string;
  startDay: number;
  durationDays: number;
  label: string;
};

type ViewMode = "days" | "shifts";

function buildColumns(view: ViewMode) {
  if (view === "days") {
    return days;
  }
  return days.flatMap((day) => [`${day} A`, `${day} B`]);
}

function getSlotMeta(view: ViewMode) {
  const slotsPerDay = view === "days" ? 1 : 2;
  return { slotsPerDay, totalSlots: buildColumns(view).length };
}

type GanttProps = {
  items: ScheduleItem[];
  lines: ProductionLine[];
  maintenance: MaintenanceWindow[];
  view: ViewMode;
  onSelectItem?: (item: ScheduleItem) => void;
  selectedItemId?: string | null;
  workOrdersById: Record<string, WorkOrder | undefined>;
  lineUtilization: Record<string, number>;
};

export function Gantt({
  items,
  lines,
  maintenance,
  view,
  onSelectItem,
  selectedItemId,
  workOrdersById,
  lineUtilization,
}: GanttProps) {
  const columns = buildColumns(view);
  const { slotsPerDay, totalSlots } = getSlotMeta(view);

  return (
    <div className="space-y-4">
      <div
        className="grid items-center gap-2 text-xs text-slate-400"
        style={{ gridTemplateColumns: `220px repeat(${totalSlots}, minmax(0, 1fr))` }}
      >
        <div className="pl-2">Line / Utilization</div>
        {columns.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {lines.map((line) => {
          const utilization = Math.round((lineUtilization[line.id] ?? 0) * 100);
          const rowItems = items.filter((item) => item.lineId === line.id);
          const rowMaintenance = maintenance.filter((item) => item.lineId === line.id);

          return (
            <div
              key={line.id}
              className="grid items-stretch gap-2"
              style={{ gridTemplateColumns: `220px repeat(${totalSlots}, minmax(0, 1fr))` }}
            >
              <div className="space-y-2 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{line.name}</p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Utilization</span>
                    <span className="text-slate-700">{utilization}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        utilization >= 85 && "bg-rose-500",
                        utilization >= 70 && utilization < 85 && "bg-amber-400",
                        utilization < 70 && "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="relative h-16 rounded-xl border border-slate-200/70 bg-white"
                style={{ gridColumn: `2 / span ${totalSlots}` }}
              >
                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))` }}
                >
                  {columns.map((_, index) => (
                    <div
                      key={`${line.id}-cell-${index}`}
                      className={cn(
                        "border-r border-slate-100",
                        index === totalSlots - 1 && "border-r-0"
                      )}
                    />
                  ))}
                </div>

                <div
                  className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))` }}
                >
                  {rowMaintenance.map((mw) => {
                    const startSlot = (mw.startDay - 1) * slotsPerDay + 1;
                    const durationSlots = mw.durationDays * slotsPerDay;

                    return (
                      <div
                        key={mw.id}
                        className="z-0 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500"
                        style={{ gridColumn: `${startSlot} / span ${durationSlots}` }}
                      >
                        {mw.label}
                      </div>
                    );
                  })}

                  {rowItems.map((entry) => {
                    const startSlot = (entry.startDay - 1) * slotsPerDay + 1;
                    const durationSlots = entry.durationDays * slotsPerDay;
                    const order = workOrdersById[entry.workOrderId];
                    const priority = order?.priority ?? "medium";

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelectItem?.(entry)}
                        className={cn(
                          "z-10 flex h-12 flex-col items-start justify-center gap-1 rounded-lg border px-2 py-1 text-left text-[11px] font-semibold transition shadow-sm",
                          entry.status === "on-time" &&
                            "border-emerald-200 bg-emerald-50 text-emerald-700",
                          entry.status === "at-risk" &&
                            "border-amber-200 bg-amber-50 text-amber-700",
                          entry.status === "delayed" &&
                            "border-rose-200 bg-rose-50 text-rose-700",
                          selectedItemId === entry.id && "ring-2 ring-slate-300"
                        )}
                        style={{ gridColumn: `${startSlot} / span ${durationSlots}` }}
                      >
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          {priority}
                        </span>
                        <span>{order?.id ?? entry.label}</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {order?.product.name ?? ""} · {entry.durationDays}d
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

