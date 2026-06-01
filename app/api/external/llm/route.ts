import { NextResponse } from "next/server";
import { mockLLMGenerateFramework } from "@/lib/external-mocks";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    learnerType: string;
    coreProblem: string;
    marketInfo: string;
    userInsight: string;
    productEmbedding: string;
    trainerTips: string;
  };
  const framework = await mockLLMGenerateFramework(body);
  return NextResponse.json({ framework, provider: "mock-llm" });
}
