import { NextResponse } from "next/server";
import { mockPaymentGateway } from "@/lib/external-mocks";

export async function POST(req: Request) {
  const body = (await req.json()) as { action: "COURSE_DESIGN_START" | "REPORT_GENERATE" };
  const result = await mockPaymentGateway(body.action);
  return NextResponse.json(result);
}
