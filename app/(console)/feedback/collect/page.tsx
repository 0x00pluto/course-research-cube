import { addFeedbackAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadFeedbackWorkspace } from "@/lib/feedback-workspace";
import { AppPanel, btnSecondary, inputCls } from "@/components/app-panel";

export default async function FeedbackCollectPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { data } = await loadFeedbackWorkspace(user);

  return (
    <div className="space-y-3">
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">反馈已提交，可在「反馈列表」查看。</p>
      ) : null}

      {data.courses.length === 0 ? (
        <p className="text-[13px] text-[#8f959e]">暂无课程，请先完成课程设计。</p>
      ) : (
        <AppPanel description="记录课后口头反馈或线下收集的评分与意见，提交后进入待审核。">
          <form action={addFeedbackAction} className="grid gap-2 md:grid-cols-2">
            <select name="courseId" className={inputCls}>
              {data.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.id} - {course.title}
                </option>
              ))}
            </select>
            <select name="feedbackType" className={inputCls}>
              <option value="SURVEY">问卷反馈</option>
              <option value="ORAL">口头反馈</option>
            </select>
            <input name="moduleName" placeholder="模块名称（如：整体）" defaultValue="整体" className={inputCls} />
            <input name="score" type="number" min="1" max="5" defaultValue="5" placeholder="评分 1-5" className={inputCls} />
            <textarea name="content" required placeholder="反馈内容" className={`${inputCls} md:col-span-2`} rows={4} />
            <button className={`${btnSecondary} md:col-span-2`} type="submit">
              提交反馈
            </button>
          </form>
        </AppPanel>
      )}
    </div>
  );
}
