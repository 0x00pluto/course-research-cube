import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { loadFeedbackWorkspace } from "@/lib/feedback-workspace";
import { AppPanel } from "@/components/app-panel";

export default async function FeedbackAnalysisPage() {
  const user = await requireUser();
  const { data, moduleAnalysis, minFeedbackForTrend, surveys } = await loadFeedbackWorkspace(user);
  const surveyResponses = surveys.reduce((s, x) => s + Number((x as { response_count: number }).response_count), 0);

  return (
    <div className="space-y-3">
      {data.scoreTrend.length > 0 ? (
        <AppPanel
          description={`根据已审核反馈汇总评分，帮助判断课程是否续开。至少需 ${minFeedbackForTrend} 条有效反馈后才显示评分结论。`}
        >
          <div className="space-y-2">
            {data.scoreTrend.map((t) => (
              <div key={t.courseId} className="flex items-center justify-between rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]">
                <span className="truncate text-[#1f2329]">{t.title}</span>
                <span className="shrink-0 text-[#646a73]">
                  {t.meetsThreshold ? (
                    <>
                      均分 {Number(t.avgScore).toFixed(1)} · {t.feedbackCount} 条反馈
                      {Number(t.avgScore) < 3.5 ? (
                        <span className="ml-2 text-[#ff7d00]">建议停开讨论</span>
                      ) : Number(t.avgScore) >= 4 ? (
                        <span className="ml-2 text-[#00b42a]">表现良好，可续开</span>
                      ) : (
                        <span className="ml-2 text-[#8f959e]">继续观察</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#8f959e]">
                      反馈 {t.feedbackCount}/{minFeedbackForTrend} 条，样本不足暂不评分
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </AppPanel>
      ) : (
        <p className="text-[13px] text-[#8f959e]">暂无足够反馈数据，请先收集并审核学员反馈。</p>
      )}

      {moduleAnalysis.length > 0 ? (
        <AppPanel description="按课程模块查看评分，低分模块可优先安排优化。">
          <div className="space-y-2">
            {moduleAnalysis.map((m) => (
              <div key={`${m.course_id}-${m.module_name}`} className="rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#1f2329]">
                    {m.course_title} · {m.module_name}
                  </span>
                  <span className={Number(m.avg_score) < 4 ? "text-[#ff7d00]" : "text-[#00b42a]"}>
                    均分 {Number(m.avg_score).toFixed(1)} · {m.cnt} 条
                  </span>
                </div>
                {Number(m.avg_score) < 4 ? (
                  <p className="mt-1 text-[12px] text-[#646a73]">
                    建议优化该模块的练习与互动设计。
                    <Link href="/courses/my" className="ml-2 text-[#3370ff]">
                      去编辑课程
                    </Link>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </AppPanel>
      ) : null}

      {surveyResponses > 0 ? (
        <p className="text-[12px] text-[#8f959e]">当前问卷累计回收 {surveyResponses} 份，已纳入上述分析。</p>
      ) : null}
    </div>
  );
}
