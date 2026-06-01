import Link from "next/link";
import { createSurveyAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadFeedbackWorkspace } from "@/lib/feedback-workspace";
import { AppPanel, btnPrimary, inputCls } from "@/components/app-panel";

export default async function FeedbackSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { data, canSurvey, surveys } = await loadFeedbackWorkspace(user);

  return (
    <div className="space-y-3">
      {params.error ? (
        <p className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">{params.error}</p>
      ) : null}
      {params.survey ? (
        <div className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">
          问卷已创建，可将以下链接发给学员填写：
          <Link href={`/survey/${params.survey}`} className="ml-2 font-medium text-[#3370ff]">
            /survey/{params.survey}
          </Link>
        </div>
      ) : null}

      {!canSurvey ? (
        <p className="text-[13px] text-[#8f959e]">当前角色无法发起问卷。</p>
      ) : data.courses.length === 0 ? (
        <p className="text-[13px] text-[#8f959e]">请先创建课程后再发起问卷。</p>
      ) : (
        <AppPanel description="选择课程生成填报链接，学员提交后将进入反馈库等待审核。">
          <form action={createSurveyAction} className="flex flex-wrap gap-2">
            <select name="courseId" className={`${inputCls} min-w-[200px] flex-1`}>
              {data.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.id} - {course.title}
                </option>
              ))}
            </select>
            <button type="submit" className={btnPrimary}>
              发起问卷并获取链接
            </button>
          </form>
          {surveys.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-[13px] font-medium text-[#1f2329]">已发起的问卷</p>
              {surveys.map((s) => {
                const row = s as { token: string; course_title: string; response_count: number; title: string };
                return (
                  <div
                    key={row.token}
                    className="flex flex-wrap items-center justify-between rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]"
                  >
                    <span className="text-[#646a73]">
                      {row.course_title} · {row.title} · 已回收 {row.response_count} 份
                    </span>
                    <Link href={`/survey/${row.token}`} className="text-[#3370ff]">
                      打开填报页
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : null}
        </AppPanel>
      )}
    </div>
  );
}
