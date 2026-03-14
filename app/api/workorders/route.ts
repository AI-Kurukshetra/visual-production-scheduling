import { NextResponse } from "next/server";
import { createWorkOrder, getWorkOrders } from "@/lib/api/mock-repo";
import type { WorkOrderPriority, WorkOrderStatus } from "@/lib/api/types";

function isPriority(value: string): value is WorkOrderPriority {
  return ["low", "medium", "high", "critical"].includes(value);
}

function isStatus(value: string): value is WorkOrderStatus {
  return ["scheduled", "in-progress", "delayed", "complete", "canceled"].includes(value);
}

export async function GET() {
  return NextResponse.json(getWorkOrders());
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

  const data = payload as {
    code?: string;
    productName?: string;
    productSku?: string;
    quantity?: number;
    priority?: string;
    status?: string;
    dueDate?: string;
    assignedLineId?: string | null;
  };

  if (!data.productName || !data.quantity || !data.dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!data.priority || !isPriority(data.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  if (data.status && !isStatus(data.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const created = createWorkOrder({
    code: data.code,
    productName: data.productName,
    productSku: data.productSku,
    quantity: Number(data.quantity),
    priority: data.priority,
    status: data.status ?? "scheduled",
    dueDate: data.dueDate,
    assignedLineId: data.assignedLineId ?? null
  });

  return NextResponse.json(created, { status: 201 });
}
