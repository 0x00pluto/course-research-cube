import { sqlAll, sqlRun } from "@/lib/db";

export interface PlatformSettings {
  minFeedbackForTrend: number;
  courseDesignCost: number;
  reportGenerateCost: number;
}

const DEFAULTS: PlatformSettings = {
  minFeedbackForTrend: 3,
  courseDesignCost: 5,
  reportGenerateCost: 3,
};

function parseIntSetting(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const rows = await sqlAll<{ key: string; value: string }>("select key, value from platform_settings");
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    minFeedbackForTrend: parseIntSetting(map.min_feedback_for_trend, DEFAULTS.minFeedbackForTrend),
    courseDesignCost: parseIntSetting(map.course_design_cost, DEFAULTS.courseDesignCost),
    reportGenerateCost: parseIntSetting(map.report_generate_cost, DEFAULTS.reportGenerateCost),
  };
}

export async function updatePlatformSettings(
  userId: number,
  input: Partial<PlatformSettings>,
) {
  const entries: Array<[string, number]> = [];
  if (input.minFeedbackForTrend != null) {
    entries.push(["min_feedback_for_trend", input.minFeedbackForTrend]);
  }
  if (input.courseDesignCost != null) {
    entries.push(["course_design_cost", input.courseDesignCost]);
  }
  if (input.reportGenerateCost != null) {
    entries.push(["report_generate_cost", input.reportGenerateCost]);
  }
  for (const [key, value] of entries) {
    await sqlRun(
      `insert into platform_settings(key, value, updated_by, updated_at)
       values (?,?,?,datetime('now'))
       on conflict(key) do update set value=excluded.value, updated_by=excluded.updated_by, updated_at=datetime('now')`,
      key,
      String(value),
      userId,
    );
  }
}

export async function listPlatformSettingsRows() {
  return sqlAll<{ key: string; value: string; updated_at: string }>(
    "select key, value, updated_at from platform_settings order by key",
  );
}
