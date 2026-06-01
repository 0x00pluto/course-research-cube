import { createCourseAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadCoursesWorkspace } from "@/lib/courses-workspace";
import { AppPanel } from "@/components/app-panel";
import { CourseDesignWizard } from "@/components/course-design-wizard";

export default async function CoursesDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { isOpc, opcPoints, scope, platformSettings } = await loadCoursesWorkspace(user);

  const successMsg = params.ok ? "课程设计已完成，可在「我的课程」查看框架与输出物。" : undefined;

  return (
    <div className="space-y-3">
      {params.error ? (
        <p className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">{params.error}</p>
      ) : null}
      {successMsg ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">{successMsg}</p>
      ) : null}

      <AppPanel description="分步完成课型、学员、问题与四类输入，30 分钟内形成可交付初稿。">
        <CourseDesignWizard
          action={createCourseAction}
          isOpc={isOpc}
          opcPoints={opcPoints}
          scope={scope}
          courseDesignCost={platformSettings.courseDesignCost}
          errorMessage={params.error}
        />
      </AppPanel>
    </div>
  );
}
