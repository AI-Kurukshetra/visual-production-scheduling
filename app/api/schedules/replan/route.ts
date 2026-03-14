import { NextResponse } from "next/server";
import { replanSchedule } from "@/lib/api/mock-repo";

export async function POST() {
  return NextResponse.json(replanSchedule());
}
