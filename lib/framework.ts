export interface FrameworkModule {
  id: string;
  title: string;
  duration: string;
  content: string;
}

const MODULE_LINE = /^(\d+)[.)]\s*(.+?)(?:[（(](\d+分钟)[）)])?\s*(?:[-：:]\s*(.+))?$/;

export function parseFramework(text: string): FrameworkModule[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const modules: FrameworkModule[] = [];
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    const match = line.match(MODULE_LINE);
    if (match) {
      modules.push({
        id: `m-${match[1]}`,
        title: match[2].trim(),
        duration: match[3] ?? "15分钟",
        content: match[4]?.trim() ?? "",
      });
      continue;
    }
    if (modules.length > 0) {
      modules[modules.length - 1].content += (modules[modules.length - 1].content ? "\n" : "") + line;
    }
  }
  if (modules.length === 0) {
    modules.push({ id: "m-1", title: "课程主体", duration: "60分钟", content: text });
  }
  return modules;
}

export function serializeFramework(modules: FrameworkModule[]): string {
  return modules
    .map((m, i) => `${i + 1}) ${m.title}（${m.duration}）${m.content ? `\n   ${m.content}` : ""}`)
    .join("\n");
}

export function parseModulesJson(raw: string | null | undefined, fallbackText: string): FrameworkModule[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as FrameworkModule[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* fall through */
    }
  }
  return parseFramework(fallbackText);
}

export const DESIGN_STEPS = [
  { key: "type", label: "选择课型", hint: "确定课程时长与结构模板" },
  { key: "persona", label: "目标学员", hint: "匹配受众画像与设计提示" },
  { key: "problem", label: "用户问题", hint: "明确核心痛点作为设计主轴" },
  { key: "inputs", label: "四类输入", hint: "市场、洞察、产品、技巧四维度" },
  { key: "generate", label: "生成方案", hint: "AI 推荐框架并产出三类交付物" },
] as const;

export const DESIGN_TARGET_MINUTES = 30;

export function calcDesignProgress(stepIndex: number): { percent: number; remaining: string[] } {
  const percent = Math.round(((stepIndex + 1) / DESIGN_STEPS.length) * 100);
  const remaining = DESIGN_STEPS.slice(stepIndex + 1).map((s) => s.label);
  return { percent, remaining };
}
