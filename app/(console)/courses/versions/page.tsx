import { createVersionComparisonAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadCoursesWorkspace } from "@/lib/courses-workspace";
import { AppPanel, btnSecondary, inputCls } from "@/components/app-panel";

export default async function CoursesVersionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { courses } = await loadCoursesWorkspace(user);

  return (
    <div className="space-y-3">
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">版本对比已记录。</p>
      ) : null}

      <AppPanel description="记录课程版本差异，辅助迭代复用。">
        {courses.length === 0 ? (
          <p className="text-[13px] text-[#8f959e]">暂无课程，请先在「发起设计」创建课程。</p>
        ) : (
          <form action={createVersionComparisonAction} className="grid gap-2 md:grid-cols-2">
            <select name="courseId" className={inputCls}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.id} - {course.title}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input name="baseVersion" defaultValue="1" placeholder="基准版本" className={inputCls} />
              <input name="targetVersion" defaultValue="2" placeholder="目标版本" className={inputCls} />
            </div>
            <textarea name="diffText" required placeholder="版本差异说明" className={`${inputCls} md:col-span-2`} rows={3} />
            <button className={`${btnSecondary} md:col-span-2`} type="submit">
              记录版本对比
            </button>
          </form>
        )}
      </AppPanel>
    </div>
  );
}
