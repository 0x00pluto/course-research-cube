import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCourseOutput } from "@/lib/services";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;
  const courseId = Number(id);
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as "outline" | "workbook" | "deck" | null;

  if (!type || !["outline", "workbook", "deck"].includes(type)) {
    return NextResponse.json({ error: "无效类型" }, { status: 400 });
  }

  try {
    const file = getCourseOutput(user, courseId, type);
    return new NextResponse(file.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "下载失败";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
