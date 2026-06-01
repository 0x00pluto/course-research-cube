"use server";

import { redirect } from "next/navigation";
import { signIn, signOut, requireUser } from "@/lib/auth";
import type { FrameworkModule } from "@/lib/framework";
import {
  addFeedback,
  addKnowledge,
  cloneCourseAsNewVersion,
  createCourseDesign,
  createCourseSurvey,
  createGrowthCard,
  createShareLink,
  createVersionComparison,
  dismissKnowledgeSuggestion,
  generateQualityReport,
  promoteKnowledgeSuggestion,
  rechargeOpcPoints,
  releaseCourseDelivery,
  reviewFeedback,
  reviewKnowledge,
  revokeShareLink,
  submitSurveyResponse,
  updateCourseFramework,
  savePlatformSettings,
  upsertStrategyInsight,
} from "@/lib/services";

function redirectError(path: string, message: string) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function loginAction(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = await signIn(email, password);
  if (!user) return { ok: false, message: "账号或密码错误" };
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}

const COURSES_DESIGN = "/courses/design";
const COURSES_MY = "/courses/my";
const COURSES_VERSIONS = "/courses/versions";
const FEEDBACK_SURVEY = "/feedback/survey";
const FEEDBACK_COLLECT = "/feedback/collect";
const FEEDBACK_LIST = "/feedback/list";
const REPORTS_ANALYSIS = "/reports/analysis";
const REPORTS_SHARE = "/reports/share";

export async function createCourseAction(formData: FormData) {
  const user = await requireUser();
  if (user.role === "OPC" && formData.get("billingConfirmed") !== "1") {
    redirectError(COURSES_DESIGN, "请先确认计费规则后再提交");
  }
  try {
    await createCourseDesign(user, formData);
  } catch (error) {
    redirectError(COURSES_DESIGN, error instanceof Error ? error.message : "创建失败");
  }
  redirect(`${COURSES_DESIGN}?ok=1`);
}

export async function updateFrameworkAction(formData: FormData) {
  const user = await requireUser();
  const courseId = Number(formData.get("courseId"));
  let modules: FrameworkModule[] = [];
  try {
    modules = JSON.parse(String(formData.get("modulesJson") ?? "[]")) as FrameworkModule[];
  } catch {
    redirectError(COURSES_MY, "框架数据格式错误");
  }
  if (modules.length === 0) redirectError(COURSES_MY, "至少保留一个模块");
  try {
    await updateCourseFramework(user, courseId, modules);
  } catch (error) {
    redirectError(COURSES_MY, error instanceof Error ? error.message : "保存失败");
  }
  redirect(`${COURSES_MY}?saved=1`);
}

export async function cloneCourseAction(formData: FormData) {
  const user = await requireUser();
  try {
    cloneCourseAsNewVersion(user, Number(formData.get("courseId")));
  } catch (error) {
    redirectError(COURSES_MY, error instanceof Error ? error.message : "克隆失败");
  }
  redirect(`${COURSES_MY}?cloned=1`);
}

export async function addKnowledgeAction(formData: FormData) {
  const user = await requireUser();
  addKnowledge(user, formData);
  redirect("/knowledge/new?ok=1");
}

export async function reviewKnowledgeAction(formData: FormData) {
  const user = await requireUser();
  reviewKnowledge(user, Number(formData.get("id")), String(formData.get("status")) as "APPROVED" | "REJECTED");
  redirect("/knowledge/list?ok=1");
}

export async function addFeedbackAction(formData: FormData) {
  const user = await requireUser();
  addFeedback(user, formData);
  redirect(`${FEEDBACK_COLLECT}?ok=1`);
}

export async function reviewFeedbackAction(formData: FormData) {
  const user = await requireUser();
  reviewFeedback(user, Number(formData.get("id")), String(formData.get("status")) as "APPROVED" | "REJECTED");
  redirect(`${FEEDBACK_LIST}?ok=1`);
}

export async function generateReportAction(formData: FormData) {
  const user = await requireUser();
  if (user.role === "OPC" && formData.get("billingConfirmed") !== "1") {
    redirectError(REPORTS_ANALYSIS, "请先确认扣费规则");
  }
  try {
    await generateQualityReport(user, Number(formData.get("courseId")));
  } catch (error) {
    redirectError(REPORTS_ANALYSIS, error instanceof Error ? error.message : "生成失败");
  }
  redirect(`${REPORTS_ANALYSIS}?ok=1`);
}

export async function createShareAction(formData: FormData) {
  const user = await requireUser();
  const token = createShareLink(user, Number(formData.get("reportId")));
  redirect(`/share/${token}`);
}

export async function revokeShareAction(formData: FormData) {
  const user = await requireUser();
  revokeShareLink(user, Number(formData.get("linkId")));
  redirect(REPORTS_SHARE);
}

export async function rechargeAction(formData: FormData) {
  const user = await requireUser();
  const amount = Number(formData.get("amount") ?? 10);
  try {
    await rechargeOpcPoints(user, amount);
  } catch (error) {
    redirectError("/opc", error instanceof Error ? error.message : "充值失败");
  }
  redirect("/opc?recharged=1");
}

export async function createGrowthCardAction(formData: FormData) {
  const user = await requireUser();
  createGrowthCard(user, String(formData.get("content") ?? ""));
  redirect("/admin");
}

export async function createVersionComparisonAction(formData: FormData) {
  const user = await requireUser();
  createVersionComparison(
    user,
    Number(formData.get("courseId")),
    Number(formData.get("baseVersion")),
    Number(formData.get("targetVersion")),
    String(formData.get("diffText")),
  );
  redirect(`${COURSES_VERSIONS}?ok=1`);
}

export async function createStrategyInsightAction(formData: FormData) {
  const user = await requireUser();
  upsertStrategyInsight(
    user,
    String(formData.get("scope")) as "INTERNAL" | "OPC",
    String(formData.get("title")),
    String(formData.get("insight")),
  );
  redirect("/admin");
}

export async function createSurveyAction(formData: FormData) {
  const user = await requireUser();
  let token = "";
  try {
    token = createCourseSurvey(user, Number(formData.get("courseId")));
  } catch (error) {
    redirectError(FEEDBACK_SURVEY, error instanceof Error ? error.message : "创建失败");
  }
  if (!token) redirectError(FEEDBACK_SURVEY, "创建失败");
  redirect(`${FEEDBACK_SURVEY}?survey=${token}`);
}

export async function submitSurveyAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  try {
    submitSurveyResponse(token, {
      moduleName: String(formData.get("moduleName") ?? "整体"),
      score: Number(formData.get("score") ?? 5),
      content: String(formData.get("content") ?? ""),
      respondentLabel: String(formData.get("respondentLabel") ?? ""),
    });
  } catch (error) {
    redirect(`/survey/${token}?error=${encodeURIComponent(error instanceof Error ? error.message : "提交失败")}`);
  }
  redirect(`/survey/${token}?thanks=1`);
}

export async function releaseCourseAction(formData: FormData) {
  const user = await requireUser();
  const acknowledgeRisk = formData.get("acknowledgeRisk") === "1";
  try {
    releaseCourseDelivery(user, Number(formData.get("courseId")), acknowledgeRisk);
  } catch (error) {
    redirectError(COURSES_MY, error instanceof Error ? error.message : "发布失败");
  }
  redirect(`${COURSES_MY}?released=1`);
}

export async function promoteSuggestionAction(formData: FormData) {
  const user = await requireUser();
  promoteKnowledgeSuggestion(user, Number(formData.get("id")));
  redirect("/knowledge/list?ok=1");
}

export async function dismissSuggestionAction(formData: FormData) {
  const user = await requireUser();
  dismissKnowledgeSuggestion(user, Number(formData.get("id")));
  redirect(`${FEEDBACK_LIST}?ok=1`);
}

export async function updatePlatformSettingsAction(formData: FormData) {
  const user = await requireUser();
  try {
    savePlatformSettings(user, {
      minFeedbackForTrend: Number(formData.get("minFeedbackForTrend")),
      courseDesignCost: Number(formData.get("courseDesignCost")),
      reportGenerateCost: Number(formData.get("reportGenerateCost")),
    });
  } catch (error) {
    redirectError("/admin?tab=settings", error instanceof Error ? error.message : "保存失败");
  }
  redirect("/admin?tab=settings&saved=1");
}
