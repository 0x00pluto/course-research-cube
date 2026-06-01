import { NextResponse } from "next/server";
import { mockMarketDataFeed } from "@/lib/external-mocks";

export async function POST(req: Request) {
  const body = (await req.json()) as { problem: string };
  const trend = await mockMarketDataFeed(body.problem);
  return NextResponse.json(trend);
}
