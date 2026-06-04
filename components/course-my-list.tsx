import Link from "next/link";
import { cloneCourseAction, releaseCourseAction, updateFrameworkAction } from "@/app/actions";
import type { CourseDetailRow, CourseOutputRow } from "@/lib/courses-workspace";
import { parseModulesJson } from "@/lib/framework";
import type { KnowledgeGap } from "@/lib/knowledge-gap";
import { parseSectionSources } from "@/lib/output-sources";
import type { CourseSummary } from "@/lib/types";
import { formatCourseStatus, formatScope, formatSourceKind } from "@/lib/display-labels";
import { btnPrimary } from "@/components/app-panel";
import { CourseFrameworkEditor } from "@/components/course-framework-editor";

export function CourseMyList({
  courses,
  detailMap,
  outputMap,
  gapsMap,
  canEdit,
}: {
  courses: CourseSummary[];
  detailMap: Map<number, CourseDetailRow>;
  outputMap: Map<number, CourseOutputRow>;
  gapsMap: Map<number, KnowledgeGap[]>;
  canEdit: boolean;
}) {
  if (courses.length === 0) {
    return (
      <p className="text-[13px] text-[#8f959e]">
        暂无课程，请先在
        <Link href="/courses/design" className="mx-1 text-[#3370ff]">
          发起设计
        </Link>
        创建。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => {
        const detail = detailMap.get(course.id);
        const output = outputMap.get(course.id);
        const modules = detail ? parseModulesJson(detail.framework_modules, detail.framework) : [];
        const gaps = gapsMap.get(course.id) ?? [];

        return (
          <div key={course.id} className="rounded-md border border-[#eef0f3] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-medium text-[#1f2329]">
                  #{course.id} {course.title}
                </h3>
                <p className="mt-1 text-[12px] text-[#8f959e]">
                  {course.courseType} · {course.learnerType} · v{course.version} ·{" "}
                  <span
                    className={
                      detail?.status === "RELEASED"
                        ? "text-[#00b42a]"
                        : detail?.status === "BLOCKED"
                          ? "text-[#ff7d00]"
                          : ""
                    }
                  >
                    {formatCourseStatus(detail?.status ?? course.status)}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-[#edf3ff] px-2 py-0.5 text-[11px] text-[#3370ff]">{formatScope(course.scope)}</span>
                {canEdit ? (
                  <form action={cloneCourseAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <button type="submit" className="text-[12px] text-[#3370ff]">
                      基于旧版迭代
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            {canEdit && detail ? (
              <CourseFrameworkEditor courseId={course.id} initialModules={modules} action={updateFrameworkAction} />
            ) : detail ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-[13px] text-[#3370ff]">查看课程框架</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[12px] text-[#646a73]">
                  {detail.framework}
                </pre>
              </details>
            ) : null}

            {gaps.length > 0 ? (
              <div className="mt-3 rounded-md border border-[#ffe7ba] bg-[#fffbe6] p-3">
                <p className="text-[12px] font-medium text-[#ad6800]">知识缺口提示</p>
                <ul className="mt-1 space-y-1 text-[11px] text-[#ad6800]">
                  {gaps.map((g) => (
                    <li key={g.label + g.reason}>
                      [{g.type}] {g.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {output ? (
              <>
                {output.section_sources ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[12px] text-[#3370ff]">分段来源追溯</summary>
                    <div className="mt-2 space-y-1">
                      {parseSectionSources(output.section_sources)
                        .slice(0, 12)
                        .map((s, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-[#646a73]">
                            <span>
                              {s.deliverable} · {s.section}
                            </span>
                            <span>
                              {formatSourceKind(s.source_kind)} — {s.note}
                            </span>
                          </div>
                        ))}
                    </div>
                  </details>
                ) : null}

                {detail?.status !== "RELEASED" ? (
                  <div className="mt-3 rounded-md border border-[#ffccc7] bg-[#fff2f0] p-3 text-[12px] text-[#cf1322]">
                    <p className="font-medium">发布前风险提示</p>
                    <p className="mt-1">{output.risk_notice}</p>
                    {canEdit ? (
                      <form action={releaseCourseAction} className="mt-2 flex flex-wrap items-center gap-3">
                        <input type="hidden" name="courseId" value={course.id} />
                        {gaps.length > 0 ? (
                          <label className="flex items-center gap-1 text-[11px] text-[#646a73]">
                            <input type="checkbox" name="acknowledgeRisk" value="1" />
                            已知晓风险，仍要发布
                          </label>
                        ) : null}
                        <button type="submit" className={btnPrimary}>
                          确认发布交付
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {[
                    { label: "课程大纲", content: output.outline, type: "outline" as const },
                    { label: "练习册", content: output.workbook, type: "workbook" as const },
                    { label: "课件包", content: output.deck_package, type: "deck" as const },
                  ].map((item) => (
                    <div key={item.label} className="rounded-md border border-[#eef0f3] p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#1f2329]">{item.label}</span>
                        {detail?.status === "RELEASED" ? (
                          <a
                            href={`/api/courses/${course.id}/download?type=${item.type}`}
                            className="text-[11px] text-[#3370ff]"
                          >
                            下载
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#8f959e]">发布后可下载</span>
                        )}
                      </div>
                      <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap text-[11px] text-[#646a73]">
                        {item.content}
                      </pre>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[#8f959e]">
                  整体来源：{formatSourceKind(output.source_kind)} · {output.risk_notice}
                </p>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
