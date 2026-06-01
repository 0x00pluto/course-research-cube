import Link from "next/link";
import { createGrowthCardAction, createStrategyInsightAction, updatePlatformSettingsAction } from "@/app/actions";
import { requireRoles } from "@/lib/auth";
import {
  getPlatformSettings,
  listAdminAuditLogs,
  listAdminPanorama,
  listDashboardData,
} from "@/lib/services";
import { AppPanel, btnPrimary, btnSecondary, inputCls } from "@/components/app-panel";
import { sqlAll } from "@/lib/db";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const user = await requireRoles(["ADMIN", "MANAGER"]);
  const settings = getPlatformSettings();
  const tab =
    params.tab === "opc" && user.role === "ADMIN"
      ? "opc"
      : params.tab === "settings"
        ? "settings"
        : params.tab === "audit"
          ? "audit"
          : "internal";

  const data = listDashboardData(user);
  const internalCourses = listAdminPanorama(user, "INTERNAL");
  const opcCourses = user.role === "ADMIN" ? listAdminPanorama(user, "OPC") : [];
  const growthCards = sqlAll<{ id: number; card_text: string; created_at: string }>(
    "select id,card_text,created_at from growth_cards order by id desc",
  );
  const panorama = tab === "opc" ? opcCourses : internalCourses;
  const auditLogs = tab === "audit" ? listAdminAuditLogs(80) : [];

  return (
    <div className="space-y-3">
      {params.saved ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">运营配置已保存。</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin?tab=internal"
          className={`rounded-md px-3 py-1.5 text-[13px] ${tab === "internal" ? "bg-[#3370ff] text-white" : "border border-[#dee0e3] text-[#646a73]"}`}
        >
          内部课程 ({internalCourses.length})
        </Link>
        {user.role === "ADMIN" ? (
          <Link
            href="/admin?tab=opc"
            className={`rounded-md px-3 py-1.5 text-[13px] ${tab === "opc" ? "bg-[#3370ff] text-white" : "border border-[#dee0e3] text-[#646a73]"}`}
          >
            OPC 课程 ({opcCourses.length})
          </Link>
        ) : null}
        <Link
          href="/admin?tab=settings"
          className={`rounded-md px-3 py-1.5 text-[13px] ${tab === "settings" ? "bg-[#3370ff] text-white" : "border border-[#dee0e3] text-[#646a73]"}`}
        >
          运营配置
        </Link>
        <Link
          href="/admin?tab=audit"
          className={`rounded-md px-3 py-1.5 text-[13px] ${tab === "audit" ? "bg-[#3370ff] text-white" : "border border-[#dee0e3] text-[#646a73]"}`}
        >
          操作记录
        </Link>
        <Link href="/analytics" className="ml-auto text-[13px] text-[#3370ff]">
          质量看板 →
        </Link>
      </div>

      {tab === "internal" || tab === "opc" ? (
        <AppPanel
          title="双侧课程全景"
          description="点击课程可查看完整内容（框架、输出物、反馈、报告）。"
        >
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {panorama.length === 0 ? (
              <p className="text-[13px] text-[#8f959e]">暂无课程。</p>
            ) : (
              panorama.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/courses/${c.id}`}
                  className="block rounded-md border border-[#eef0f3] p-3 text-[12px] transition-colors hover:border-[#3370ff]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[#1f2329]">
                      #{c.id} {c.title}
                    </span>
                    <span className="text-[#3370ff]">查看完整内容 →</span>
                  </div>
                  <p className="mt-1 text-[#646a73]">
                    {c.status} · v{c.version} · {c.owner_name} · 反馈 {c.feedback_count} · 报告 {c.report_count} · 均分{" "}
                    {Number(c.avg_score).toFixed(1)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </AppPanel>
      ) : null}

      {tab === "settings" ? (
        <AppPanel title="运营配置" description="最低反馈样本量、OPC 按次扣费额度。仅平台管理员可修改。">
          <form action={updatePlatformSettingsAction} className="grid max-w-md gap-3">
            <label className="text-[12px] text-[#646a73]">
              质量趋势/报告最低样本量（条）
              <input
                name="minFeedbackForTrend"
                type="number"
                min={1}
                max={20}
                defaultValue={settings.minFeedbackForTrend}
                className={`${inputCls} mt-1`}
                disabled={user.role !== "ADMIN"}
              />
            </label>
            <label className="text-[12px] text-[#646a73]">
              课程设计扣费（积分/次）
              <input
                name="courseDesignCost"
                type="number"
                min={1}
                max={100}
                defaultValue={settings.courseDesignCost}
                className={`${inputCls} mt-1`}
                disabled={user.role !== "ADMIN"}
              />
            </label>
            <label className="text-[12px] text-[#646a73]">
              报告生成扣费（积分/次）
              <input
                name="reportGenerateCost"
                type="number"
                min={1}
                max={100}
                defaultValue={settings.reportGenerateCost}
                className={`${inputCls} mt-1`}
                disabled={user.role !== "ADMIN"}
              />
            </label>
            {user.role === "ADMIN" ? (
              <button type="submit" className={btnPrimary}>
                保存配置
              </button>
            ) : (
              <p className="text-[12px] text-[#8f959e]">培训负责人仅可查看，修改请联系平台管理员。</p>
            )}
          </form>
        </AppPanel>
      ) : null}

      {tab === "audit" ? (
        <AppPanel title="管理操作记录（§11.1）" description="记录管理员/负责人查看课程与配置变更。">
          {auditLogs.length === 0 ? (
            <p className="text-[13px] text-[#8f959e]">暂无记录。</p>
          ) : (
            <div className="max-h-[480px] space-y-2 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-[#eef0f3] px-3 py-2 text-[12px]">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-[#1f2329]">
                      {log.user_name} · {log.action}
                    </span>
                    <span className="text-[#8f959e]">{log.created_at}</span>
                  </div>
                  <p className="mt-1 text-[#646a73]">
                    {log.target_type}
                    {log.target_id != null ? ` #${log.target_id}` : ""}
                    {log.detail ? ` · ${log.detail}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AppPanel>
      ) : null}

      {tab === "internal" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <AppPanel title="讲师成长辅导卡（P2）">
            <form action={createGrowthCardAction} className="grid gap-2">
              <textarea name="content" required className={inputCls} placeholder="输入成长建议卡片内容" rows={4} />
              <button className={btnSecondary} type="submit">
                生成成长卡
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {growthCards.map((card) => (
                <div key={card.id} className="rounded-md border border-[#eef0f3] p-3 text-[13px] text-[#646a73]">
                  {card.card_text}
                </div>
              ))}
            </div>
          </AppPanel>

          <AppPanel title="策略洞察维护（P2/P3）">
            <form action={createStrategyInsightAction} className="grid gap-2">
              <select name="scope" className={inputCls}>
                <option value="INTERNAL">内部</option>
                <option value="OPC">OPC</option>
              </select>
              <input name="title" className={inputCls} placeholder="洞察标题" required />
              <textarea name="insight" className={inputCls} placeholder="洞察内容" required rows={4} />
              <button className={btnSecondary} type="submit">
                新增策略洞察
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {data.insights.map((insight) => (
                <div key={String((insight as { id: number }).id)} className="rounded-md border border-[#eef0f3] p-3">
                  <p className="text-[13px] font-medium text-[#1f2329]">{String((insight as { title: string }).title)}</p>
                  <p className="mt-1 text-[12px] text-[#8f959e]">{String((insight as { insight: string }).insight)}</p>
                </div>
              ))}
            </div>
          </AppPanel>
        </div>
      ) : null}
    </div>
  );
}
