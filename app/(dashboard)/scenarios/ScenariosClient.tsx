"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ScenarioName = "Base Plan" | "AI Optimized" | "Disruption Case";

type Scenario = {
  id: string;
  name: ScenarioName;
  summary: string;
  oee: number;
  otif: number;
  utilization: number;
  setupReduction: number;
  highlights: string[];
};

type MetricKey = "oee" | "otif" | "utilization" | "setupReduction";

type MetricCard = {
  key: MetricKey;
  label: string;
  unit: string;
};

const scenarios: Scenario[] = [
  {
    id: "sc-base",
    name: "Base Plan",
    summary: "Current committed plan using standard sequencing and staffing. Stable but exposed to Line B delays.",
    oee: 85.1,
    otif: 92.4,
    utilization: 80.9,
    setupReduction: 9.2,
    highlights: ["Stable staffing", "Moderate buffers", "Line B is constrained"]
  },
  {
    id: "sc-ai",
    name: "AI Optimized",
    summary: "AI sequencing minimizes changeovers and balances critical orders across lines.",
    oee: 88.8,
    otif: 95.1,
    utilization: 84.6,
    setupReduction: 13.8,
    highlights: ["Balanced load", "Reduced setup", "Best OTIF projection"]
  },
  {
    id: "sc-disruption",
    name: "Disruption Case",
    summary: "Supplier delay and reduced staffing on Line B impact throughput and delivery risk.",
    oee: 80.2,
    otif: 88.3,
    utilization: 76.4,
    setupReduction: 6.1,
    highlights: ["Supplier delay", "Labor shortfall", "Higher late order risk"]
  }
];

const metricCards: MetricCard[] = [
  { key: "oee", label: "OEE", unit: "%" },
  { key: "otif", label: "OTIF", unit: "%" },
  { key: "utilization", label: "Utilization", unit: "%" },
  { key: "setupReduction", label: "Setup Reduction", unit: "%" }
];

const chartColors: Record<ScenarioName, string> = {
  "Base Plan": "#94a3b8",
  "AI Optimized": "#2563eb",
  "Disruption Case": "#f97316"
};

export function ScenariosClient() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[1].id);
  const [activePlanId, setActivePlanId] = useState("sc-base");

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0],
    [activeScenarioId]
  );

  const recommendedScenario = scenarios.find((scenario) => scenario.name === "AI Optimized") ?? scenarios[1];

  function promotePlan() {
    setActivePlanId(activeScenario.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Scenario Planning</h1>
          <p className="mt-1 text-sm text-slate-500">Compare performance tradeoffs and select the best plan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Recommended: {recommendedScenario.name}</Badge>
          <Button onClick={promotePlan}>Promote to Active Plan</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setActiveScenarioId(scenario.id)}
            className={cn(
              "rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)] transition",
              activeScenarioId === scenario.id && "border-slate-300 shadow-lg"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scenario</p>
                <p className="text-lg font-semibold text-slate-900">{scenario.name}</p>
              </div>
              <div className="space-y-2 text-right">
                {scenario.id === recommendedScenario.id ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Best</Badge>
                ) : null}
                {scenario.id === activePlanId ? (
                  <Badge className="border-slate-200 bg-slate-50 text-slate-700">Active</Badge>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{scenario.summary}</p>
            <div className="mt-4 grid gap-2 text-xs text-slate-500">
              {scenario.highlights.map((highlight) => (
                <div key={highlight} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {highlight}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.key} className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
              <CardTitle className="text-2xl">
                {activeScenario[metric.key].toFixed(1)}{metric.unit}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between text-xs text-slate-500">
                    <span>{scenario.name}</span>
                    <span className="font-medium text-slate-700">
                      {scenario[metric.key].toFixed(1)}{metric.unit}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarios.map((scenario) => ({ name: scenario.name, value: scenario[metric.key] }))}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, metric.label]}
                      contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {scenarios.map((scenario) => (
                        <Cell key={scenario.id} fill={chartColors[scenario.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scenario Summary</p>
            <CardTitle>{activeScenario.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-3 text-sm text-slate-600">
            <p>{activeScenario.summary}</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recommended Action</p>
              <p className="mt-2 text-sm text-slate-700">
                {activeScenario.name === "AI Optimized"
                  ? "Promote AI Optimized to active plan to capture OTIF and setup improvements."
                  : "Review constraints and confirm staffing before promotion."}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recommended Scenario</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{recommendedScenario.name}</p>
              <p className="mt-1 text-xs text-slate-500">Highest OTIF with balanced utilization.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active Plan</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {scenarios.find((scenario) => scenario.id === activePlanId)?.name ?? "-"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Last updated today.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
