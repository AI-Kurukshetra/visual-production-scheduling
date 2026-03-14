import type {
  AiRecommendation,
  Facility,
  ProductionLine,
  Resource,
  ScheduleItem,
  WorkOrder
} from "@/lib/api/types";

type MaterialInventory = {
  id: string;
  name: string;
  onHand: number;
  threshold: number;
  lineId: string;
};

type RecommendationContext = {
  facilities: Facility[];
  workOrders: WorkOrder[];
  resources: Resource[];
  schedules: ScheduleItem[];
  recommendationsSeed: AiRecommendation[];
  materialInventory: MaterialInventory[];
  today: string;
};

function daysBetween(today: string, dueDate: string) {
  const start = new Date(today).getTime();
  const end = new Date(dueDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 999;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function findLine(lines: ProductionLine[], id: string) {
  return lines.find((line) => line.id === id);
}

function pickAlternateLine(lines: ProductionLine[], currentLineId: string, resources: Resource[]) {
  const utilizationByLine = lines.map((line) => {
    const lineResources = resources.filter((resource) => resource.assignedLine?.id === line.id);
    const avg = lineResources.length
      ? lineResources.reduce((sum, resource) => sum + resource.utilization, 0) / lineResources.length
      : 0.4;
    return { line, utilization: avg };
  });
  const candidates = utilizationByLine.filter((item) => item.line.id !== currentLineId);
  return candidates.sort((a, b) => a.utilization - b.utilization)[0]?.line ?? lines[0];
}

function productFamily(name: string) {
  return name.split(" ")[0]?.toLowerCase() ?? name.toLowerCase();
}

export function generateAiRecommendations(context: RecommendationContext): AiRecommendation[] {
  const { facilities, workOrders, resources, schedules, recommendationsSeed, today, materialInventory } = context;
  const lines = facilities[0]?.lines ?? [];
  const recommendations: AiRecommendation[] = [];

  const maintenanceLineIds = new Set(
    resources
      .filter((resource) => resource.status === "maintenance" || resource.status === "down")
      .map((resource) => resource.assignedLine?.id)
  );

  const maintenanceLineId = Array.from(maintenanceLineIds).find(Boolean);
  if (maintenanceLineId) {
    const line = findLine(lines, maintenanceLineId);
    const delayedOrder = workOrders.find((order) => order.assignedLine?.id === maintenanceLineId);
    const alternate = pickAlternateLine(lines, maintenanceLineId, resources);
    if (line && delayedOrder) {
      recommendations.push({
        id: "rec-maintenance",
        title: "Reassign work due to maintenance",
        action: `Move ${delayedOrder.code} off ${line.name} to ${alternate.name} while maintenance clears.`,
        impact: "Avoids 1 shift of downtime",
        eta: "Today",
        confidence: 0.81
      });
    }
  }

  const atRisk = workOrders.find((order) => daysBetween(today, order.dueDate) <= 2 && order.progress < 50);
  if (atRisk) {
    recommendations.push({
      id: "rec-delay-risk",
      title: "Flag delay risk",
      action: `${atRisk.code} is due in ${daysBetween(today, atRisk.dueDate)} days with only ${atRisk.progress}% progress.`,
      impact: "Escalate expediting",
      eta: "48 hrs",
      confidence: 0.77
    });
  }

  const groupedByLine = schedules
    .slice()
    .sort((a, b) => a.startDay - b.startDay)
    .reduce<Record<string, ScheduleItem[]>>((acc, item) => {
      acc[item.lineId] = acc[item.lineId] ? [...acc[item.lineId], item] : [item];
      return acc;
    }, {});

  Object.entries(groupedByLine).forEach(([lineId, items]) => {
    for (let i = 0; i < items.length - 1; i += 1) {
      const current = workOrders.find((order) => order.code === items[i].workOrderCode);
      const next = workOrders.find((order) => order.code === items[i + 1].workOrderCode);
      if (!current || !next) continue;
      if (productFamily(current.product.name) === productFamily(next.product.name)) {
        const line = findLine(lines, lineId);
        recommendations.push({
          id: `rec-setup-${lineId}`,
          title: "Group similar products to reduce setup",
          action: `Batch ${current.code} and ${next.code} on ${line?.name ?? "this line"} to reduce changeovers.`,
          impact: "Setup -10%",
          eta: "This week",
          confidence: 0.72
        });
        break;
      }
    }
  });

  const hotResource = resources.find((resource) => resource.utilization >= 0.85);
  if (hotResource) {
    recommendations.push({
      id: "rec-load-balance",
      title: "Balance overloaded resource",
      action: `${hotResource.name} is at ${Math.round(hotResource.utilization * 100)}% utilization. Shift work to a lower-load line.`,
      impact: "Utilization variance -8%",
      eta: "Next shift",
      confidence: 0.74
    });
  }

  const shortage = materialInventory.find((item) => item.onHand < item.threshold);
  if (shortage) {
    const line = findLine(lines, shortage.lineId);
    recommendations.push({
      id: "rec-shortage",
      title: "Material shortage detected",
      action: `${shortage.name} on-hand is ${shortage.onHand} (< ${shortage.threshold}). Review ${line?.name ?? "impacted line"}.`,
      impact: "Avoid line stoppage",
      eta: "24 hrs",
      confidence: 0.8
    });
  }

  const fallback = recommendationsSeed.filter((seed) => !recommendations.some((rec) => rec.title === seed.title));
  return [...recommendations, ...fallback].slice(0, 5);
}
