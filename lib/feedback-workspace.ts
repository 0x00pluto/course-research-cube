import {
  getModuleFeedbackAnalysis,
  getPlatformSettings,
  listCourseSurveys,
  listDashboardData,
  listKnowledgeSuggestions,
} from "@/lib/services";
import type { SessionUser } from "@/lib/types";

export async function loadFeedbackWorkspace(user: SessionUser) {
  const data = await listDashboardData(user);
  const canReview = user.role === "MANAGER" || user.role === "ADMIN";
  const canSurvey = user.role === "INTERNAL" || user.role === "OPC" || user.role === "ADMIN";
  const pending = data.feedbacks.filter((x) => String((x as { review_status: string }).review_status) === "PENDING");
  const moduleAnalysis = await getModuleFeedbackAnalysis(user);
  const surveys = canSurvey ? await listCourseSurveys(user) : [];
  const suggestions = await listKnowledgeSuggestions(user);
  const { minFeedbackForTrend } = await getPlatformSettings();
  const pendingSuggestions = suggestions.filter((s) => (s as { status: string }).status === "PENDING");

  return {
    data,
    canReview,
    canSurvey,
    pending,
    moduleAnalysis,
    surveys,
    suggestions,
    pendingSuggestions,
    minFeedbackForTrend,
  };
}
