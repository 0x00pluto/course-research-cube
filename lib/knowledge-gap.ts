import { sqlAll } from "@/lib/db";
import type { FrameworkModule } from "@/lib/framework";
import { parseModulesJson } from "@/lib/framework";

export interface KnowledgeGap {
  type: "MODULE" | "CASE" | "TRAINER_TIP";
  label: string;
  reason: string;
}

export async function analyzeKnowledgeGaps(
  scope: "INTERNAL" | "OPC",
  frameworkModules: FrameworkModule[],
  coreProblem: string,
): Promise<KnowledgeGap[]> {
  const approved = await sqlAll<{ category: string; title: string; content: string }>(
    "select category,title,content from knowledge_items where scope=? and review_status='APPROVED'",
    scope,
  );
  const gaps: KnowledgeGap[] = [];
  const corpus = approved.map((k) => `${k.title} ${k.content}`).join(" ").toLowerCase();

  for (const mod of frameworkModules) {
    const keyword = mod.title.slice(0, 4).toLowerCase();
    if (keyword.length >= 2 && !corpus.includes(keyword)) {
      gaps.push({
        type: "MODULE",
        label: mod.title,
        reason: `框架模块「${mod.title}」在知识库中缺少对应功能模块条目`,
      });
    }
  }

  const caseHits = approved.filter((k) => k.category === "CASE").length;
  if (caseHits < 2) {
    gaps.push({ type: "CASE", label: "案例素材", reason: "案例素材库条目不足，建议补充实战案例" });
  }

  const tipHits = approved.filter((k) => k.category === "TRAINER_TIP").length;
  if (tipHits < 1) {
    gaps.push({ type: "TRAINER_TIP", label: "讲师技巧", reason: "缺少授课技巧条目，建议补充互动与节奏建议" });
  }

  if (coreProblem && !corpus.includes(coreProblem.slice(0, 4).toLowerCase())) {
    gaps.push({
      type: "CASE",
      label: coreProblem.slice(0, 20),
      reason: `用户问题「${coreProblem}」缺少匹配案例素材`,
    });
  }

  return gaps;
}

export async function getKnowledgeGapsForCourse(
  courseId: number,
  scope: "INTERNAL" | "OPC",
  frameworkText: string,
  frameworkModulesRaw: string | null,
  coreProblem: string,
): Promise<KnowledgeGap[]> {
  const modules = parseModulesJson(frameworkModulesRaw, frameworkText);
  return analyzeKnowledgeGaps(scope, modules, coreProblem);
}
