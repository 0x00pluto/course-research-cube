import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRoles } from "@/lib/auth";
import { parseSectionSources } from "@/lib/output-sources";
import { parseIterationActions } from "@/lib/iteration-actions";
import { getCourseDetailForAdmin, getPlatformSettings } from "@/lib/services";
import { AppPanel } from "@/components/app-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseDetailPage(props: Props) {
  const { id } = await props.params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) notFound();

  const user = await requireRoles(["ADMIN", "MANAGER"]);
  const detail = getCourseDetailForAdmin(user, courseId);
  if (!detail) notFound();

  const { course, output, sectionSources, feedbacks, reports, shareLinks } = detail;
  const settings = getPlatformSettings();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <Link href="/admin" className="text-[#3370ff]">
          ← 返回管理后台
        </Link>
        <span className="text-[#8f959e]">管理员查看 · 不改变课程归属</span>
      </div>

      <AppPanel
        title={`课程 #${courseId} · ${String(course.title)}`}
        description={`归属：${String(course.owner_name)}（${String(course.owner_role)}）· ${String(course.scope)} · ${String(course.status)} · v${String(course.version)}`}
      >
        <div className="grid gap-3 md:grid-cols-2 text-[12px] text-[#646a73]">
          <p>课型：{String(course.course_type)}</p>
          <p>学员：{String(course.learner_type)}</p>
          <p className="md:col-span-2">核心问题：{String(course.core_problem)}</p>
        </div>
      </AppPanel>

      <AppPanel title="课程框架">
        <pre className="whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[12px] text-[#646a73]">{String(course.framework)}</pre>
      </AppPanel>

      <AppPanel title="四类输入">
        <div className="space-y-2 text-[12px] text-[#646a73]">
          <p>
            <span className="font-medium text-[#1f2329]">市场竞品：</span>
            {String(course.market_info)}
          </p>
          <p>
            <span className="font-medium text-[#1f2329]">用户洞察：</span>
            {String(course.user_insight)}
          </p>
          <p>
            <span className="font-medium text-[#1f2329]">产品植入：</span>
            {String(course.product_embedding)}
          </p>
          <p>
            <span className="font-medium text-[#1f2329]">授课技巧：</span>
            {String(course.trainer_tips)}
          </p>
        </div>
      </AppPanel>

      {output ? (
        <AppPanel title="输出物（大纲 / 练习册 / 课件包）">
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="font-medium text-[#1f2329]">课程大纲</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[#646a73]">{String(output.outline)}</pre>
            </div>
            <div>
              <p className="font-medium text-[#1f2329]">练习册</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[#646a73]">{String(output.workbook)}</pre>
            </div>
            <div>
              <p className="font-medium text-[#1f2329]">课件包</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[#646a73]">{String(output.deck_package)}</pre>
            </div>
            {sectionSources.length > 0 ? (
              <details>
                <summary className="cursor-pointer text-[#3370ff]">分段来源追溯</summary>
                <div className="mt-2 space-y-1">
                  {sectionSources.map((s, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span>
                        {s.deliverable} · {s.section}
                      </span>
                      <span>
                        {s.source_kind} — {s.note}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </AppPanel>
      ) : null}

      <AppPanel title={`反馈记录（${feedbacks.length}）`}>
        {feedbacks.length === 0 ? (
          <p className="text-[13px] text-[#8f959e]">暂无反馈。</p>
        ) : (
          <div className="space-y-2">
            {feedbacks.map((f) => {
              const row = f as {
                id: number;
                module_name: string;
                score: number;
                content: string;
                review_status: string;
                feedback_type: string;
              };
              return (
                <div key={row.id} className="rounded-md border border-[#eef0f3] p-3 text-[12px]">
                  <span className="font-medium">
                    {row.module_name} · {row.score} 分 · {row.review_status}
                  </span>
                  <p className="mt-1 text-[#646a73]">[{row.feedback_type}] {row.content}</p>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-[11px] text-[#8f959e]">
          质量趋势展示门槛：至少 {settings.minFeedbackForTrend} 条已审核反馈
        </p>
      </AppPanel>

      <AppPanel title={`分析报告（${reports.length}）`}>
        {reports.length === 0 ? (
          <p className="text-[13px] text-[#8f959e]">暂无报告。</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const row = r as {
                id: number;
                report_text: string;
                summary_score: number;
                iteration_actions: string | null;
                created_at: string;
              };
              const actions = parseIterationActions(row.iteration_actions);
              return (
                <div key={row.id} className="rounded-md border border-[#eef0f3] p-3 text-[12px]">
                  <p className="font-medium text-[#1f2329]">
                    报告 #{row.id} · 评分 {Number(row.summary_score).toFixed(2)} · {row.created_at}
                  </p>
                  {actions.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-[#646a73]">
                      {actions.map((a, i) => (
                        <li key={i}>
                          [{a.priority}] {a.module}：{a.action}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-2 text-[11px]">{row.report_text}</pre>
                </div>
              );
            })}
          </div>
        )}
      </AppPanel>

      {shareLinks.length > 0 ? (
        <AppPanel title="分享链接">
          <div className="space-y-2 text-[12px]">
            {shareLinks.map((l) => {
              const row = l as { id: number; token: string; is_active: number; expires_at: string | null };
              return (
                <div key={row.id} className="flex flex-wrap items-center gap-2">
                  <Link href={`/share/${row.token}`} className="text-[#3370ff]">
                    /share/{row.token.slice(0, 8)}…
                  </Link>
                  <span className="text-[#8f959e]">{row.is_active ? "有效" : "已撤销"}</span>
                </div>
              );
            })}
          </div>
        </AppPanel>
      ) : null}
    </div>
  );
}
