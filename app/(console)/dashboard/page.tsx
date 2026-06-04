import { requireUser } from "@/lib/auth";
import { sqlOne } from "@/lib/db";
import { getPlatformSettings, listDashboardData } from "@/lib/services";
import { DashboardBento } from "@/components/dashboard-bento";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await listDashboardData(user);
  const canAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  const pointsRow = await sqlOne<{ points: number }>("select points from users where id = ?", user.id);
  const opcPoints = pointsRow?.points ?? 0;

  const pendingKnowledge = data.knowledgeItems.filter(
    (x) => String((x as { review_status: string }).review_status) === "PENDING",
  ).length;
  const pendingFeedback = data.feedbacks.filter(
    (x) => String((x as { review_status: string }).review_status) === "PENDING",
  ).length;

  const activeRate = data.courses.length > 0 ? Math.min(100, (data.feedbacks.length / data.courses.length) * 38) : 0;
  const { minFeedbackForTrend } = await getPlatformSettings();

  return (
    <DashboardBento
      userName={user.name}
      userRole={user.role}
      canAdmin={canAdmin}
      scoreTrend={data.scoreTrend}
      minFeedbackForTrend={minFeedbackForTrend}
      stats={{
        courses: data.courses.length,
        knowledge: data.knowledgeItems.length,
        feedbacks: data.feedbacks.length,
        reports: data.reports.length,
        pendingKnowledge,
        pendingFeedback,
        activeRate,
        opcPoints,
      }}
    />
  );
}
