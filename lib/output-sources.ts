import type { FrameworkModule } from "@/lib/framework";
import type { KnowledgeGap } from "@/lib/knowledge-gap";
import type { SourceKind } from "@/lib/types";

export interface SectionSource {
  deliverable: "outline" | "workbook" | "deck";
  section: string;
  source_kind: SourceKind;
  note: string;
}

export function buildSectionSources(
  modules: FrameworkModule[],
  gaps: KnowledgeGap[],
  hasKnowledgeMatch: boolean,
): SectionSource[] {
  const gapLabels = new Set(gaps.map((g) => g.label));
  const sources: SectionSource[] = [];

  for (const mod of modules) {
    const blocked = gapLabels.has(mod.title) || gaps.some((g) => mod.title.includes(g.label));
    sources.push({
      deliverable: "outline",
      section: mod.title,
      source_kind: blocked ? "AI_GENERATED" : hasKnowledgeMatch ? "KNOWLEDGE" : "AI_GENERATED",
      note: blocked ? "缺少知识库支撑，交付前需补充" : "已匹配知识库/AI 生成",
    });
    sources.push({
      deliverable: "workbook",
      section: `${mod.title}·练习`,
      source_kind: blocked ? "AI_GENERATED" : "MANUAL",
      note: blocked ? "练习步骤待补充案例后发布" : "含步骤与作业要求",
    });
    sources.push({
      deliverable: "deck",
      section: `${mod.title}·课件页`,
      source_kind: "AI_GENERATED",
      note: "课件素材页，需二次组装 PPT",
    });
  }

  return sources;
}

export function hasBlockingSources(sources: SectionSource[], gaps: KnowledgeGap[]) {
  return gaps.length > 0 || sources.some((s) => s.note.includes("交付前需补充") || s.note.includes("待补充"));
}

export function parseSectionSources(raw: string | null): SectionSource[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SectionSource[];
  } catch {
    return [];
  }
}
