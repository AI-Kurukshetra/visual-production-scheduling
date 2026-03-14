import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Metric } from "@/lib/types";

export function KpiCard({ metric }: { metric: Metric }) {
  const isPositive = metric.delta >= 0;
  const trend = isPositive ? "text-emerald-600" : "text-rose-600";
  const sign = isPositive ? "+" : "";

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.25)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-100 blur-2xl" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold text-slate-900">
            {metric.value}
            <span className="text-lg text-slate-400">{metric.unit}</span>
          </p>
          <Badge className={`${trend} border-slate-200 bg-slate-50`}>
            {sign}
            {metric.delta}
            {metric.unit}
          </Badge>
        </div>
        <p className="text-xs text-slate-400">vs last week</p>
      </div>
    </Card>
  );
}
