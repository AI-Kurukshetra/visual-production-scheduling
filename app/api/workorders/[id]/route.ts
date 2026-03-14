import { NextResponse } from "next/server";
import { updateWorkOrder } from "@/lib/api/mock-repo";
import type { WorkOrderPriority, WorkOrderStatus } from "@/lib/api/types";

function isPriority(value: string): value is WorkOrderPriority {
  return ["low", "medium", "high", "critical"].includes(value);
}

function isStatus(value: string): value is WorkOrderStatus {
  return ["scheduled", "in-progress", "delayed", "complete", "canceled"].includes(value);
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = payload as {
    status?: string;
    priority?: string;
    dueDate?: string;
    assignedLineId?: string | null;
    progress?: number;
  };

  if (data.status && !isStatus(data.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (data.priority && !isPriority(data.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  const updated = updateWorkOrder(context.params.id, {
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    assignedLineId: data.assignedLineId,
    progress: data.progress
  });

  if (!updated) {
    return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
