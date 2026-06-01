import Link from "next/link";
import { cloneCourseAction, createShareAction } from "@/app/actions";
import { parseIterationActions } from "@/lib/iteration-actions";

type ReportRow = {
  id: number;
  course_id: number;
  title: string;
  report_text: string;
  summary_score: number;
  iteration_actions: string | null;
  created_at: string;
};

export function ReportList({
  reports,
  canShare,
  canClone,
}: {
  reports: ReportRow[];
  canShare: boolean;
  canClone: boolean;
}) {
  if (reports.length === 0) {
    return <p className="text-[13px] text-[#8f959e]">暂无报告，请先选择课程并生成。</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((row) => {
        const actions = parseIterationActions(row.iteration_actions);
        return (
          <div key={row.id} className="rounded-md border border-[#eef0f3] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14px] font-medium text-[#1f2329]">
                报告 #{row.id} · {row.title}
              </h3>
              <span className="text-[13px] text-[#3370ff]">综合评分 {Number(row.summary_score).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8f959e]">课程 #{row.course_id} · {row.created_at}</p>
            {actions.length > 0 ? (
              <div className="mt-3 rounded-md border border-[#e8f3ff] bg-[#fafbfc] p-3">
                <p className="text-[12px] font-medium text-[#3370ff]">迭代优化建议</p>
                <ul className="mt-2 space-y-1 text-[12px] text-[#646a73]">
                  {actions.map((a, i) => (
                    <li key={i}>
                      <span className={a.priority === "high" ? "text-[#ff7d00]" : "text-[#8f959e]"}>[{a.priority}]</span>{" "}
                      {a.module}：{a.action}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <details className="mt-2">
              <summary className="cursor-pointer text-[13px] text-[#3370ff]">查看完整报告正文</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[12px] text-[#646a73]">
                {row.report_text}
              </pre>
            </details>
            <div className="mt-2 flex flex-wrap gap-3">
              {canShare ? (
                <form action={createShareAction}>
                  <input type="hidden" name="reportId" value={String(row.id)} />
                  <button className="text-[13px] text-[#3370ff]" type="submit">
                    生成分享链接
                  </button>
                </form>
              ) : null}
              <Link href="/courses/my" className="text-[13px] text-[#3370ff]">
                编辑当前课程
              </Link>
              {canClone ? (
                <form action={cloneCourseAction}>
                  <input type="hidden" name="courseId" value={String(row.course_id)} />
                  <button type="submit" className="text-[13px] text-[#3370ff]">
                    基于此发起新版设计
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
