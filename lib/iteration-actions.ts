export interface IterationAction {
  module: string;
  action: string;
  priority: "high" | "medium";
}

export function buildIterationActions(weakModules: string[], avgScore: number): IterationAction[] {
  const actions: IterationAction[] = weakModules.map((mod) => ({
    module: mod,
    action: `优化「${mod}」的练习说明、案例贴近度与课堂互动节奏`,
    priority: "high" as const,
  }));
  if (avgScore < 3.5) {
    actions.push({
      module: "整体",
      action: "综合评分偏低，建议组织停开讨论或大幅重构课型与模块结构",
      priority: "high",
    });
  } else if (avgScore < 4 && weakModules.length === 0) {
    actions.push({
      module: "整体",
      action: "整体表现待观察，可补充问卷样本后再次评估是否续开",
      priority: "medium",
    });
  }
  if (actions.length === 0) {
    actions.push({
      module: "整体",
      action: "保持当前模块结构，下期可强化案例演练与课后作业闭环",
      priority: "medium",
    });
  }
  return actions;
}

export function parseIterationActions(raw: string | null | undefined): IterationAction[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as IterationAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeIterationActions(actions: IterationAction[]) {
  return JSON.stringify(actions);
}
