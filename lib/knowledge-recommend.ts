import { sqlAll } from "@/lib/db";
import type { FrameworkModule } from "@/lib/framework";

export interface KnowledgeRecommendation {
  moduleTitle: string;
  cases: Array<{ id: number; title: string; content: string; source_kind: string }>;
  tips: Array<{ id: number; title: string; content: string; source_kind: string }>;
}

function matchScore(text: string, keyword: string) {
  const k = keyword.slice(0, 4).toLowerCase();
  if (k.length < 2) return 0;
  return text.toLowerCase().includes(k) ? 1 : 0;
}

export function recommendByModules(scope: "INTERNAL" | "OPC", modules: FrameworkModule[]): KnowledgeRecommendation[] {
  const items = sqlAll<{ id: number; category: string; title: string; content: string; source_kind: string }>(
    "select id,category,title,content,source_kind from knowledge_items where scope=? and review_status='APPROVED'",
    scope,
  );

  return modules.map((mod) => {
    const cases = items
      .filter((i) => i.category === "CASE")
      .map((i) => ({ ...i, score: matchScore(`${i.title} ${i.content}`, mod.title) }))
      .filter((i) => i.score > 0)
      .slice(0, 3);
    if (cases.length === 0) {
      items
        .filter((i) => i.category === "CASE")
        .slice(0, 2)
        .forEach((i) => cases.push({ ...i, score: 0 }));
    }

    const tips = items
      .filter((i) => i.category === "TRAINER_TIP")
      .map((i) => ({ ...i, score: matchScore(`${i.title} ${i.content}`, mod.title) }))
      .filter((i) => i.score > 0)
      .slice(0, 2);
    if (tips.length === 0) {
      items
        .filter((i) => i.category === "TRAINER_TIP")
        .slice(0, 1)
        .forEach((i) => tips.push({ ...i, score: 0 }));
    }

    return {
      moduleTitle: mod.title,
      cases: cases.map(({ id, title, content, source_kind }) => ({ id, title, content, source_kind })),
      tips: tips.map(({ id, title, content, source_kind }) => ({ id, title, content, source_kind })),
    };
  });
}
