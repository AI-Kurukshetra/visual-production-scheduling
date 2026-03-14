"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import type { Metric, Scenario } from "@/lib/types";

function ScenarioMetric({ metric }: { metric: Metric }) {
  const trend = metric.delta >= 0 ? "text-emerald-600" : "text-rose-600";
  const sign = metric.delta >= 0 ? "+" : "";
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-lg font-semibold text-slate-900">
          {metric.value}
          <span className="text-xs text-slate-400">{metric.unit}</span>
        </p>
        <span className={`text-xs font-medium ${trend}`}>
          {sign}
          {metric.delta}
          {metric.unit}
        </span>
      </div>
    </div>
  );
}

export function ScenarioSelector({ scenarios }: { scenarios: Scenario[] }) {
  const tabs = scenarios.map((scenario) => ({ label: scenario.name, value: scenario.id }));
  const [active, setActive] = useState(tabs[0]?.value ?? "");

  const scenario = useMemo(
    () => scenarios.find((item) => item.id === active) ?? scenarios[0],
    [active, scenarios]
  );

  if (!scenario) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scenario Selector</p>
          <p className="text-lg font-semibold text-slate-900">{scenario.name}</p>
        </div>
        <Tabs tabs={tabs} value={active} onChange={setActive} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{scenario.summary}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scenario.metrics.map((metric) => (
          <ScenarioMetric key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
