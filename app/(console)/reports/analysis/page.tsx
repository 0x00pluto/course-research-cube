import { generateReportAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadReportsWorkspace } from "@/lib/reports-workspace";
import { AppPanel } from "@/components/app-panel";
import { ReportGenerateForm } from "@/components/report-generate-form";
import { ReportList } from "@/components/report-list";

export default async function ReportsAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { data, isOpc, opcPoints, platformSettings, canClone, canShare } = await loadReportsWorkspace(user);

  const reports = data.reports.map((report) => {
    const row = report as {
      id: number;
      course_id: number;
      title: string;
      report_text: string;
      summary_score: number;
      iteration_actions: string | null;
      created_at: string;
    };
    return row;
  });

  return (
    <div className="space-y-3">
      {params.error ? (
        <p className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">{params.error}</p>
      ) : null}
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">
          报告已生成，可在下方查看；OPC 可在「分享链接」页管理对外分享。
        </p>
      ) : null}

      <AppPanel description="基于已审核反馈生成课程质量分析报告，支持查看迭代建议。">
        <ReportGenerateForm
          courses={data.courses.map((course) => {
            const row = course as { id: number; title: string };
            return { id: Number(row.id), title: String(row.title) };
          })}
          isOpc={isOpc}
          opcPoints={opcPoints}
          reportGenerateCost={platformSettings.reportGenerateCost}
          minFeedbackForTrend={platformSettings.minFeedbackForTrend}
          action={generateReportAction}
        />
      </AppPanel>

      <AppPanel description="历史报告列表，可展开查看正文并发起课程迭代。">
        <ReportList reports={reports} canShare={canShare} canClone={canClone} />
      </AppPanel>
    </div>
  );
}
