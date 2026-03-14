"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResourceType = "machine" | "workforce";
type ResourceStatus = "available" | "busy" | "maintenance" | "down";

type ResourceItem = {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  utilization: number;
  line: string;
  availability: string;
};

type Recommendation = {
  id: string;
  title: string;
  detail: string;
  impact: string;
};

const resources: ResourceItem[] = [
  {
    id: "res-01",
    name: "CNC-11",
    type: "machine",
    status: "busy",
    utilization: 0.88,
    line: "Line A - Precision",
    availability: "Next slot in 2 hrs"
  },
  {
    id: "res-02",
    name: "CNC-14",
    type: "machine",
    status: "maintenance",
    utilization: 0.42,
    line: "Line A - Precision",
    availability: "Maintenance until 4 PM"
  },
  {
    id: "res-03",
    name: "Assy Cell 4",
    type: "machine",
    status: "busy",
    utilization: 0.76,
    line: "Line B - Assembly",
    availability: "Next slot in 1 hr"
  },
  {
    id: "res-04",
    name: "Paint Booth 2",
    type: "machine",
    status: "available",
    utilization: 0.31,
    line: "Line D - Finishing",
    availability: "Available now"
  },
  {
    id: "res-05",
    name: "QA Inspector - Lin",
    type: "workforce",
    status: "busy",
    utilization: 0.91,
    line: "Line B - Assembly",
    availability: "Free in 45 mins"
  },
  {
    id: "res-06",
    name: "Maintenance Tech - Perez",
    type: "workforce",
    status: "maintenance",
    utilization: 0.6,
    line: "Line C - Packaging",
    availability: "On call"
  },
  {
    id: "res-07",
    name: "Material Handler - Kira",
    type: "workforce",
    status: "available",
    utilization: 0.38,
    line: "Line C - Packaging",
    availability: "Available now"
  },
  {
    id: "res-08",
    name: "Robotic Arm 7",
    type: "machine",
    status: "down",
    utilization: 0.12,
    line: "Line C - Packaging",
    availability: "Part replacement pending"
  }
];

const recommendations: Recommendation[] = [
  {
    id: "rec-01",
    title: "Shift QA inspector to reduce queue",
    detail: "Move Lin to Line A for the next 3 hours to clear inspection backlog.",
    impact: "Inspection WIP -18%"
  },
  {
    id: "rec-02",
    title: "Reassign work order to healthier line",
    detail: "Move WO-1041 from Line B to Line D while Assy Cell 4 is constrained.",
    impact: "OTIF +2.4%"
  },
  {
    id: "rec-03",
    title: "Group work orders to reduce setup time",
    detail: "Batch Valve Housing and Actuator Frame to reduce setup by 1.5 hrs.",
    impact: "Setup -12%"
  }
];

const typeFilters: Array<ResourceType | "all"> = ["all", "machine", "workforce"];
const statusFilters: Array<ResourceStatus | "all"> = ["all", "available", "busy", "maintenance", "down"];

const statusTone: Record<ResourceStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  busy: "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-slate-200 bg-slate-100 text-slate-600",
  down: "border-rose-200 bg-rose-50 text-rose-700"
};

export function ResourcesClient() {
  const [filters, setFilters] = useState({ type: "all", status: "all" });

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      if (filters.type !== "all" && resource.type !== filters.type) return false;
      if (filters.status !== "all" && resource.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">SmartSched AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Resources</h1>
          <p className="mt-1 text-sm text-slate-500">Capacity, staffing, and machine health across lines.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-slate-200 bg-slate-50 text-slate-700">{filteredResources.length} active</Badge>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resource Filters</p>
              <CardTitle>Machines & Workforce</CardTitle>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              {typeFilters.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1 font-medium",
                    filters.type === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  )}
                  onClick={() => setFilters((prev) => ({ ...prev, type: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              {statusFilters.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1 font-medium",
                    filters.status === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  )}
                  onClick={() => setFilters((prev) => ({ ...prev, status: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{resource.name}</p>
                    <p className="text-xs text-slate-500">{resource.type === "machine" ? "Machine" : "Workforce"}</p>
                  </div>
                  <Badge className={cn("border", statusTone[resource.status])}>{resource.status}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Assigned Line</span>
                    <span className="text-slate-700">{resource.line}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability</span>
                    <span className="text-slate-700">{resource.availability}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Utilization</span>
                    <span className="text-slate-700">{Math.round(resource.utilization * 100)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        resource.utilization >= 0.8 && "bg-rose-500",
                        resource.utilization >= 0.6 && resource.utilization < 0.8 && "bg-amber-400",
                        resource.utilization < 0.6 && "bg-emerald-500"
                      )}
                      style={{ width: `${Math.round(resource.utilization * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.2)]">
        <CardHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Recommendations</p>
            <CardTitle>Suggested Capacity Moves</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
              <p className="mt-2 text-xs text-slate-500">{rec.detail}</p>
              <Badge className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700">{rec.impact}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
