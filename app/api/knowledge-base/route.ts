import { getArticles, getCrops, getPestsDiseases } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const [crops, pests, articles] = await Promise.all([
    getCrops(),
    getPestsDiseases(),
    getArticles()
  ]);

  return NextResponse.json({ crops, pests, articles });
}
