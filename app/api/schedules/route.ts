import { NextResponse } from "next/server";
import { getSchedules } from "@/lib/api/mock-repo";

export async function GET() {
  return NextResponse.json(getSchedules());
}
