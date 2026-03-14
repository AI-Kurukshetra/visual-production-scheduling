import { NextResponse } from "next/server";
import { getFacilities } from "@/lib/api/mock-repo";

export async function GET() {
  return NextResponse.json(getFacilities());
}
