import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/api/mock-repo";

export async function GET() {
  return NextResponse.json(getDashboard());
}
