import { NextResponse } from "next/server";
import { getAiRecommendations } from "@/lib/api/mock-repo";

export async function POST() {
  return NextResponse.json(getAiRecommendations());
}
