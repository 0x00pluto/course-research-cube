import { sqlAll } from "@/lib/db";
import { getPlatformSettings, getUserPoints, listCourses } from "@/lib/services";
import type { SessionUser, TenantScope } from "@/lib/types";

export type CourseDetailRow = {
  id: number;
  framework: string;
  framework_modules: string | null;
  core_problem: string;
  scope: "INTERNAL" | "OPC";
  status: string;
};

export type CourseOutputRow = {
  course_id: number;
  outline: string;
  workbook: string;
  deck_package: string;
  source_kind: string;
  risk_notice: string;
  section_sources: string | null;
};

export async function loadCoursesWorkspace(user: SessionUser) {
  const courses = listCourses(user);
  const scope: TenantScope = user.role === "OPC" ? "OPC" : "INTERNAL";
  const platformSettings = getPlatformSettings();
  const courseIds = courses.map((c) => c.id);

  const details =
    courseIds.length > 0
      ? sqlAll<CourseDetailRow>(
          `select id,framework,framework_modules,core_problem,scope,status from courses where id in (${courseIds.join(",")})`,
        )
      : [];

  const outputs =
    courseIds.length > 0
      ? sqlAll<CourseOutputRow>(
          `select course_id,outline,workbook,deck_package,source_kind,risk_notice,section_sources from course_outputs where course_id in (${courseIds.join(",")})`,
        )
      : [];

  const isOpc = user.role === "OPC";
  const opcPoints = isOpc ? getUserPoints(user.id) : 0;
  const canEdit = user.role === "INTERNAL" || user.role === "OPC" || user.role === "ADMIN";

  return {
    courses,
    detailMap: new Map(details.map((d) => [d.id, d])),
    outputMap: new Map(outputs.map((o) => [o.course_id, o])),
    scope,
    platformSettings,
    isOpc,
    opcPoints,
    canEdit,
  };
}
