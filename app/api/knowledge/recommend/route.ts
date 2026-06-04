import { NextResponse } from "next/server";
import type { FrameworkModule } from "@/lib/framework";
import { recommendByModules } from "@/lib/knowledge-recommend";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = (await req.json()) as {
    scope?: "INTERNAL" | "OPC";
    modules?: FrameworkModule[];
  };
  const scope = body.scope ?? (user.role === "OPC" ? "OPC" : "INTERNAL");
  const modules = Array.isArray(body.modules) ? body.modules : [];
  if (modules.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }
  const recommendations = await recommendByModules(scope, modules);
  return NextResponse.json({ recommendations });
}
