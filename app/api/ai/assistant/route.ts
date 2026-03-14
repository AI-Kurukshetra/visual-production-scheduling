import { NextResponse } from "next/server";
import { getAlerts, getDashboard, getResources, getReplanImpactPreview, getScenarios, getWorkOrders } from "@/lib/api/mock-repo";

function normalize(input: string) {
  return input.toLowerCase();
}

function findWorkOrderByCode(code: string) {
  return getWorkOrders().find((order) => order.code.toLowerCase() === code.toLowerCase());
}

function highestUtilizationLine() {
  const resources = getResources();
  const tally = resources.reduce<Record<string, { name: string; total: number; count: number }>>((acc, resource) => {
    const lineName = resource.assignedLine?.name ?? "Unassigned";
    const entry = acc[lineName] ?? { name: lineName, total: 0, count: 0 };
    entry.total += resource.utilization;
    entry.count += 1;
    acc[lineName] = entry;
    return acc;
  }, {});
  const sorted = Object.values(tally).sort((a, b) => b.total / b.count - a.total / a.count);
  return sorted[0];
}

function mostCriticalAlerts() {
  return getAlerts().filter((alert) => alert.severity === "high" && alert.status !== "resolved");
}

function generateAnswer(question: string) {
  const q = normalize(question);

  if (q.includes("why") && q.includes("wo")) {
    const match = q.match(/wo-\d+/i);
    if (match) {
      const order = findWorkOrderByCode(match[0]);
      if (order) {
        return `${order.code} is delayed because progress is ${order.progress}% with a due date of ${order.dueDate}. The assigned line (${order.assignedLine?.name ?? "Unassigned"}) is currently constrained.`;
      }
    }
    return "That work order is delayed due to constrained capacity and low progress relative to the due date.";
  }

  if (q.includes("highest utilization") || q.includes("most utilized")) {
    const line = highestUtilizationLine();
    if (line) {
      const percent = Math.round((line.total / line.count) * 100);
      return `${line.name} has the highest utilization at approximately ${percent}%. Consider load balancing to other lines.`;
    }
  }

  if (q.includes("changed") && q.includes("replan")) {
    const impact = getReplanImpactPreview();
    return `AI replan moved a delayed order to a lower-load line, improving OTIF by ${impact.otifDelta}% and utilization by ${impact.utilizationDelta}%.`;
  }

  if (q.includes("alerts") && (q.includes("critical") || q.includes("most"))) {
    const critical = mostCriticalAlerts();
    if (critical.length === 0) {
      return "There are no high-severity open alerts today.";
    }
    return `High severity alerts: ${critical.map((alert) => `${alert.type} on ${alert.line?.name ?? "unknown line"}`).join(", ")}.`;
  }

  if (q.includes("scenario")) {
    const recommended = getScenarios().find((scenario) => scenario.recommended);
    if (recommended) {
      return `${recommended.name} is recommended with OTIF ${recommended.otif}% and OEE ${recommended.oee}%.`;
    }
  }

  const dashboard = getDashboard();
  return `Currently tracking ${dashboard.alertSummary.total} alerts and ${dashboard.delayedWorkOrders} delayed orders. Ask about work orders, utilization, or alerts for more detail.`;
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = payload as { question?: string };
  if (!data.question || !data.question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const answer = generateAnswer(data.question);

  return NextResponse.json({
    answer,
    mode: hasOpenAi ? "mock" : "mock",
    timestamp: new Date().toISOString()
  });
}
