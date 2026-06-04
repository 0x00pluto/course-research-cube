import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { getManagementAnalytics } from "@/lib/services";
import { AppPanel, StatCard } from "@/components/app-panel";

export default async function AnalyticsPage() {
  const user = await requireRoles(["MANAGER", "ADMIN"]);
  const data = await getManagementAnalytics(user);

  return (
    <div className="space-y-3">
      <AppPanel description={`${user.role === "ADMIN" ? "全平台" : "内部"}课程质量趋势与课型对比概览。`}>
        {user.role === "ADMIN" && data.internalVsOpc.length > 0 ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {data.internalVsOpc.map((row) => (
              <StatCard
                key={row.scope}
                label={`${row.scope === "INTERNAL" ? "内部" : "OPC"} 课程数`}
                value={`${row.courses} 门 · 均分 ${Number(row.avg_score).toFixed(1)}`}
              />
            ))}
          </div>
        ) : null}
      </AppPanel>

      <AppPanel title="按课型对比">
        <div className="space-y-2">
          {data.byCourseType.length === 0 ? (
            <p className="text-[13px] text-[#8f959e]">暂无数据。</p>
          ) : (
            data.byCourseType.map((row) => (
              <div key={row.course_type} className="flex flex-wrap items-center justify-between rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]">
                <span className="font-medium text-[#1f2329]">{row.course_type}</span>
                <span className="text-[#646a73]">
                  {row.course_count} 门 · 反馈 {row.feedback_count} 条 · 均分 {Number(row.avg_score).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </AppPanel>

      <AppPanel title="多期趋势（按月）">
        <div className="space-y-2">
          {data.byPeriod.map((row) => (
            <div key={row.period} className="flex justify-between rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]">
              <span className="text-[#1f2329]">{row.period}</span>
              <span className="text-[#646a73]">
                新增 {row.course_count} 门 · 均分 {Number(row.avg_score).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Link href="/feedback/analysis" className="mt-3 inline-block text-[13px] text-[#3370ff]">
          查看反馈明细 →
        </Link>
      </AppPanel>
    </div>
  );
}
