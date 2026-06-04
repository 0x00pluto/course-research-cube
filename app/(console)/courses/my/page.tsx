import { requireUser } from "@/lib/auth";
import { loadCoursesWorkspace } from "@/lib/courses-workspace";
import { AppPanel } from "@/components/app-panel";
import { CourseMyList } from "@/components/course-my-list";

export default async function CoursesMyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; cloned?: string; released?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { courses, detailMap, outputMap, gapsMap, canEdit } = await loadCoursesWorkspace(user);

  const successMsg = params.saved
    ? "框架已保存，输出物已重新生成。"
    : params.cloned
      ? "已基于历史版本创建新课程，请编辑后发布。"
      : params.released
        ? "课程已发布交付，输出物可下载。"
        : undefined;

  return (
    <div className="space-y-3">
      {params.error ? (
        <p className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">{params.error}</p>
      ) : null}
      {successMsg ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">{successMsg}</p>
      ) : null}

      <AppPanel description="编辑框架、查看/下载输出物、基于旧版迭代。">
        <CourseMyList courses={courses} detailMap={detailMap} outputMap={outputMap} gapsMap={gapsMap} canEdit={canEdit} />
      </AppPanel>
    </div>
  );
}
