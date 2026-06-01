import { revalidatePath, updateTag } from "next/cache";
import { mockLLMGenerateFramework, mockLLMGenerateOutputs, mockLLMGenerateReport, mockMarketDataFeed, mockPaymentGateway } from "@/lib/external-mocks";
import { parseFramework, parseModulesJson, serializeFramework, type FrameworkModule } from "@/lib/framework";
import { getKnowledgeGapsForCourse, analyzeKnowledgeGaps } from "@/lib/knowledge-gap";
import { buildSectionSources, hasBlockingSources, parseSectionSources } from "@/lib/output-sources";
import { listAdminAuditLogs, logAdminAudit } from "@/lib/admin-audit";
import { buildIterationActions, serializeIterationActions } from "@/lib/iteration-actions";
import {
  getPlatformSettings,
  listPlatformSettingsRows,
  updatePlatformSettings as persistPlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";
import { createToken, sqlAll, sqlOne, sqlRun, withTx } from "@/lib/db";
import type { CourseSummary, KnowledgeItemRow, SessionUser } from "@/lib/types";

function revalidateKnowledgePages() {
  revalidatePath("/knowledge/search");
  revalidatePath("/knowledge/new");
  revalidatePath("/knowledge/list");
}

function revalidateCoursesPages() {
  revalidatePath("/courses/design");
  revalidatePath("/courses/my");
  revalidatePath("/courses/versions");
}

function revalidateFeedbackPages() {
  revalidatePath("/feedback/survey");
  revalidatePath("/feedback/collect");
  revalidatePath("/feedback/list");
  revalidatePath("/feedback/analysis");
}

function revalidateReportsPages() {
  revalidatePath("/reports/analysis");
  revalidatePath("/reports/share");
}

export type ScoreTrendItem = {
  courseId: number;
  title: string;
  avgScore: number;
  feedbackCount: number;
  meetsThreshold: boolean;
};

function ensureScope(conditionUser: SessionUser, targetScope: "INTERNAL" | "OPC") {
  if (conditionUser.role === "ADMIN") return;
  if (conditionUser.scope !== targetScope) {
    throw new Error("跨域访问被拒绝");
  }
}

export function listCourses(user: SessionUser): CourseSummary[] {
  if (user.role === "ADMIN") {
    return sqlAll<CourseSummary>(
      `select c.id,c.title,c.course_type as courseType,c.learner_type as learnerType,c.core_problem as coreProblem,
       u.name as ownerName,u.role as ownerRole,c.scope,c.version,c.status,c.created_at as createdAt
       from courses c join users u on u.id = c.owner_id order by c.id desc`,
    );
  }
  if (user.role === "MANAGER") {
    return sqlAll<CourseSummary>(
      `select c.id,c.title,c.course_type as courseType,c.learner_type as learnerType,c.core_problem as coreProblem,
       u.name as ownerName,u.role as ownerRole,c.scope,c.version,c.status,c.created_at as createdAt
       from courses c join users u on u.id = c.owner_id where c.scope = ? order by c.id desc`,
      "INTERNAL",
    );
  }
  return sqlAll<CourseSummary>(
    `select c.id,c.title,c.course_type as courseType,c.learner_type as learnerType,c.core_problem as coreProblem,
     u.name as ownerName,u.role as ownerRole,c.scope,c.version,c.status,c.created_at as createdAt
     from courses c join users u on u.id = c.owner_id where c.owner_id = ? order by c.id desc`,
    user.id,
  );
}

export function getUserPoints(userId: number): number {
  return sqlOne<{ points: number }>("select points from users where id = ?", userId)?.points ?? 0;
}

export function assertOpcCanAfford(user: SessionUser, action: "COURSE_DESIGN_START" | "REPORT_GENERATE") {
  if (user.role !== "OPC") return;
  const settings = getPlatformSettings();
  const cost = action === "COURSE_DESIGN_START" ? settings.courseDesignCost : settings.reportGenerateCost;
  const points = getUserPoints(user.id);
  if (points < cost) {
    throw new Error(`积分不足：当前 ${points} 积分，需要 ${cost} 积分，请充值后再继续`);
  }
}

function ensureCourseAccess(user: SessionUser, courseId: number) {
  const course = sqlOne<{ owner_id: number; scope: "INTERNAL" | "OPC" }>(
    "select owner_id,scope from courses where id=?",
    courseId,
  );
  if (!course) throw new Error("课程不存在");
  if (user.role === "ADMIN") return course;
  if (user.role === "MANAGER" && course.scope === "INTERNAL") return course;
  if (course.owner_id !== user.id) throw new Error("无权访问该课程");
  return course;
}

export async function createCourseDesign(user: SessionUser, formData: FormData) {
  const scope = user.role === "OPC" ? "OPC" : "INTERNAL";
  assertOpcCanAfford(user, "COURSE_DESIGN_START");
  if (user.role === "OPC") {
    const { courseDesignCost } = getPlatformSettings();
    await mockPaymentGateway("COURSE_DESIGN_START");
    deductPoints(user.id, "COURSE_DESIGN_START", -courseDesignCost, "点击开始课程设计扣费");
  }
  const title = String(formData.get("title") ?? "未命名课程");
  const courseType = String(formData.get("courseType") ?? "半天公开课");
  const learnerType = String(formData.get("learnerType") ?? "企业员工");
  const coreProblem = String(formData.get("coreProblem") ?? "");
  const marketInfo = String(formData.get("marketInfo") ?? "");
  const userInsight = String(formData.get("userInsight") ?? "");
  const productEmbedding = String(formData.get("productEmbedding") ?? "");
  const trainerTips = String(formData.get("trainerTips") ?? "");

  const marketTrend = await mockMarketDataFeed(coreProblem);
  const framework = await mockLLMGenerateFramework({
    title,
    learnerType,
    coreProblem,
    marketInfo: `${marketInfo}\n${marketTrend.trend}`,
    userInsight,
    productEmbedding,
    trainerTips,
  });
  const outputs = await mockLLMGenerateOutputs(
    {
      title,
      learnerType,
      coreProblem,
      marketInfo,
      userInsight,
      productEmbedding,
      trainerTips,
    },
    framework,
  );

  const modules = parseFramework(framework);
  const modulesJson = JSON.stringify(modules);
  const gaps = analyzeKnowledgeGaps(scope, modules, coreProblem);
  const sectionSources = buildSectionSources(modules, gaps, gaps.length === 0);
  const courseStatus = hasBlockingSources(sectionSources, gaps) ? "BLOCKED" : "READY";
  const riskNotice = hasBlockingSources(sectionSources, gaps)
    ? `存在 ${gaps.length} 项知识缺口，交付前请补充案例与技巧或确认风险后发布。`
    : outputs.riskNotice;

  withTx(() => {
    const inserted = sqlRun(
      `insert into courses(owner_id,scope,title,course_type,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,framework,framework_modules,design_started_at,status)
       values (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),?)`,
      user.id,
      scope,
      title,
      courseType,
      learnerType,
      coreProblem,
      `${marketInfo}\n${marketTrend.trend}`,
      userInsight,
      productEmbedding,
      trainerTips,
      framework,
      modulesJson,
      courseStatus,
    );
    const courseId = Number(inserted.lastInsertRowid);
    sqlRun(
      "insert into course_outputs(course_id,outline,workbook,deck_package,source_kind,risk_notice,section_sources) values (?,?,?,?,?,?,?)",
      courseId,
      outputs.outline,
      outputs.workbook,
      outputs.deckPackage,
      "AI_GENERATED",
      riskNotice,
      JSON.stringify(sectionSources),
    );
  });

  updateTag("courses");
  revalidateCoursesPages();
  revalidatePath("/dashboard");
}

export async function updateCourseFramework(user: SessionUser, courseId: number, modules: FrameworkModule[]) {
  const course = ensureCourseAccess(user, courseId);
  if (user.role === "MANAGER") throw new Error("管理层不可编辑课程");
  const full = sqlOne<{
    title: string;
    learner_type: string;
    core_problem: string;
    market_info: string;
    user_insight: string;
    product_embedding: string;
    trainer_tips: string;
    scope: "INTERNAL" | "OPC";
  }>(
    "select title,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,scope from courses where id=?",
    courseId,
  );
  if (!full) throw new Error("课程不存在");

  const framework = serializeFramework(modules);
  const outputs = await mockLLMGenerateOutputs(
    {
      title: full.title,
      learnerType: full.learner_type,
      coreProblem: full.core_problem,
      marketInfo: full.market_info,
      userInsight: full.user_insight,
      productEmbedding: full.product_embedding,
      trainerTips: full.trainer_tips,
    },
    framework,
  );

  const gaps = analyzeKnowledgeGaps(full.scope, modules, full.core_problem);
  const sectionSources = buildSectionSources(modules, gaps, gaps.length === 0);
  const courseStatus = hasBlockingSources(sectionSources, gaps) ? "BLOCKED" : "READY";
  const riskNotice = hasBlockingSources(sectionSources, gaps)
    ? `存在 ${gaps.length} 项知识缺口，交付前请补充。`
    : outputs.riskNotice;

  withTx(() => {
    sqlRun(
      "update courses set framework=?,framework_modules=?,status=?,updated_at=datetime('now') where id=?",
      framework,
      JSON.stringify(modules),
      courseStatus,
      courseId,
    );
    sqlRun(
      "update course_outputs set outline=?,workbook=?,deck_package=?,source_kind='MANUAL',risk_notice=?,section_sources=? where course_id=?",
      outputs.outline,
      outputs.workbook,
      outputs.deckPackage,
      riskNotice,
      JSON.stringify(sectionSources),
      courseId,
    );
  });

  updateTag("courses");
  revalidateCoursesPages();
  return course;
}

export function cloneCourseAsNewVersion(user: SessionUser, courseId: number) {
  ensureCourseAccess(user, courseId);
  if (user.role === "MANAGER") throw new Error("管理层不可克隆课程");

  const source = sqlOne<{
    title: string;
    course_type: string;
    learner_type: string;
    core_problem: string;
    market_info: string;
    user_insight: string;
    product_embedding: string;
    trainer_tips: string;
    framework: string;
    framework_modules: string | null;
    version: number;
    scope: "INTERNAL" | "OPC";
  }>(
    "select title,course_type,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,framework,framework_modules,version,scope from courses where id=?",
    courseId,
  );
  if (!source) throw new Error("课程不存在");

  const output = sqlOne<{ outline: string; workbook: string; deck_package: string; risk_notice: string }>(
    "select outline,workbook,deck_package,risk_notice from course_outputs where course_id=?",
    courseId,
  );

  const newVersion = source.version + 1;
  const newTitle = `${source.title}（v${newVersion}）`;

  withTx(() => {
    const inserted = sqlRun(
      `insert into courses(owner_id,scope,title,course_type,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,framework,framework_modules,version,parent_course_id,status)
       values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      user.id,
      source.scope,
      newTitle,
      source.course_type,
      source.learner_type,
      source.core_problem,
      source.market_info,
      source.user_insight,
      source.product_embedding,
      source.trainer_tips,
      source.framework,
      source.framework_modules,
      newVersion,
      courseId,
      "DRAFT",
    );
    const newId = Number(inserted.lastInsertRowid);
    if (output) {
      sqlRun(
        "insert into course_outputs(course_id,outline,workbook,deck_package,source_kind,risk_notice) values (?,?,?,?,?,?)",
        newId,
        output.outline,
        output.workbook,
        output.deck_package,
        "KNOWLEDGE",
        `继承自课程 #${courseId} v${source.version}，请标注调整点后发布。${output.risk_notice}`,
      );
    }
  });

  revalidateCoursesPages();
}

export function listKnowledgeItems(user: SessionUser, query: string, category?: string): KnowledgeItemRow[] {
  const scope = user.role === "ADMIN" ? null : user.scope;
  let sql = "select * from knowledge_items where 1=1";
  const params: (string | number)[] = [];
  if (scope) {
    sql += " and scope = ?";
    params.push(scope);
  }
  if (category && category !== "ALL") {
    sql += " and category = ?";
    params.push(category);
  }
  if (query.trim()) {
    sql += " and (title like ? or content like ?)";
    const like = `%${query.trim()}%`;
    params.push(like, like);
  }
  sql += " order by updated_at desc, id desc";
  return sqlAll<KnowledgeItemRow>(sql, ...params);
}

export function searchKnowledgeItems(user: SessionUser, query: string, category?: string) {
  const scope = user.role === "ADMIN" ? null : user.scope;
  let sql = "select * from knowledge_items where review_status='APPROVED'";
  const params: (string | number)[] = [];
  if (scope) {
    sql += " and scope = ?";
    params.push(scope);
  }
  if (category && category !== "ALL") {
    sql += " and category = ?";
    params.push(category);
  }
  if (query.trim()) {
    sql += " and (title like ? or content like ?)";
    const like = `%${query.trim()}%`;
    params.push(like, like);
  }
  sql += " order by updated_at desc, id desc";
  return sqlAll(sql, ...params);
}

export function getModuleFeedbackAnalysis(user: SessionUser, courseId?: number) {
  if (courseId) ensureCourseAccess(user, courseId);

  if (courseId) {
    return sqlAll<{ course_id: number; course_title: string; module_name: string; avg_score: number; cnt: number }>(
      `select f.course_id,c.title as course_title,f.module_name,avg(f.score) as avg_score,count(*) as cnt
       from feedbacks f join courses c on c.id=f.course_id
       where f.review_status='APPROVED' and f.course_id=?
       group by f.course_id,c.title,f.module_name order by avg_score asc`,
      courseId,
    );
  }

  if (user.role === "ADMIN") {
    return sqlAll<{ course_id: number; course_title: string; module_name: string; avg_score: number; cnt: number }>(
      `select f.course_id,c.title as course_title,f.module_name,avg(f.score) as avg_score,count(*) as cnt
       from feedbacks f join courses c on c.id=f.course_id
       where f.review_status='APPROVED'
       group by f.course_id,c.title,f.module_name order by avg_score asc`,
    );
  }

  return sqlAll<{ course_id: number; course_title: string; module_name: string; avg_score: number; cnt: number }>(
    `select f.course_id,c.title as course_title,f.module_name,avg(f.score) as avg_score,count(*) as cnt
     from feedbacks f join courses c on c.id=f.course_id
     where f.review_status='APPROVED' and c.scope=?
     group by f.course_id,c.title,f.module_name order by avg_score asc`,
    user.scope,
  );
}

export async function rechargeOpcPoints(user: SessionUser, amount: number) {
  if (user.role !== "OPC" && user.role !== "ADMIN") throw new Error("仅 OPC 可充值");
  const targetId = user.role === "OPC" ? user.id : user.id;
  await mockPaymentGateway("COURSE_DESIGN_START");
  withTx(() => {
    const row = sqlOne<{ points: number }>("select points from users where id=?", targetId);
    if (!row) throw new Error("用户不存在");
    sqlRun("update users set points=? where id=?", row.points + amount, targetId);
    sqlRun("insert into billing_logs(user_id,action,points_delta,note) values (?,?,?,?)", targetId, "RECHARGE", amount, `Mock 充值 ${amount} 积分`);
  });
  revalidatePath("/opc");
  revalidatePath("/dashboard");
}

export function listShareLinks(user: SessionUser) {
  if (user.role === "ADMIN") {
    return sqlAll<{
      id: number;
      token: string;
      report_id: number;
      course_title: string;
      is_active: number;
      expires_at: string | null;
      created_at: string;
    }>(
      `select sl.id,sl.token,sl.report_id,c.title as course_title,sl.is_active,sl.expires_at,sl.created_at
       from share_links sl join quality_reports qr on qr.id=sl.report_id join courses c on c.id=qr.course_id
       order by sl.id desc`,
    );
  }
  return sqlAll(
    `select sl.id,sl.token,sl.report_id,c.title as course_title,sl.is_active,sl.expires_at,sl.created_at
     from share_links sl join quality_reports qr on qr.id=sl.report_id join courses c on c.id=qr.course_id
     where sl.owner_id=? order by sl.id desc`,
    user.id,
  );
}

export function revokeShareLink(user: SessionUser, linkId: number) {
  const link = sqlOne<{ owner_id: number }>("select owner_id from share_links where id=?", linkId);
  if (!link) throw new Error("分享链接不存在");
  if (user.role !== "ADMIN" && link.owner_id !== user.id) throw new Error("无权撤销");
  sqlRun("update share_links set is_active=0 where id=?", linkId);
  revalidateReportsPages();
}

export function getCourseOutput(user: SessionUser, courseId: number, type: "outline" | "workbook" | "deck") {
  ensureCourseAccess(user, courseId);
  const course = sqlOne<{ title: string; status: string }>("select title,status from courses where id=?", courseId);
  if (!course) throw new Error("课程不存在");
  if (course.status !== "RELEASED") {
    throw new Error("课程尚未发布交付，请先完成知识补充并通过交付审核");
  }
  const output = sqlOne<{ outline: string; workbook: string; deck_package: string }>(
    "select outline,workbook,deck_package from course_outputs where course_id=?",
    courseId,
  );
  if (!output) throw new Error("输出物不存在");
  const map = {
    outline: { content: output.outline, filename: `${course.title}-大纲.txt` },
    workbook: { content: output.workbook, filename: `${course.title}-练习册.txt` },
    deck: { content: output.deck_package, filename: `${course.title}-课件包.txt` },
  };
  return map[type];
}

export function addKnowledge(user: SessionUser, formData: FormData) {
  const category = String(formData.get("category") ?? "MODULE");
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const scope = (formData.get("scope") as "INTERNAL" | "OPC" | null) ?? user.scope;
  if (user.role !== "ADMIN" && user.role !== "MANAGER") ensureScope(user, scope);
  sqlRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    category,
    title,
    content,
    "MANUAL",
    scope,
    user.role === "MANAGER" || user.role === "ADMIN" ? "APPROVED" : "PENDING",
    user.id,
  );
  revalidateKnowledgePages();
}

export function reviewKnowledge(user: SessionUser, id: number, status: "APPROVED" | "REJECTED") {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无审核权限");
  sqlRun("update knowledge_items set review_status=?,reviewed_by=?,updated_at=datetime('now') where id = ?", status, user.id, id);
  revalidateKnowledgePages();
}

export function addFeedback(user: SessionUser, formData: FormData) {
  const courseId = Number(formData.get("courseId") ?? 0);
  const feedbackType = String(formData.get("feedbackType") ?? "SURVEY");
  const score = Number(formData.get("score") ?? 5);
  const moduleName = String(formData.get("moduleName") ?? "整体");
  const content = String(formData.get("content") ?? "");
  const course = sqlOne<{ scope: "INTERNAL" | "OPC"; owner_id: number }>(
    "select scope,owner_id from courses where id = ?",
    courseId,
  );
  if (!course) throw new Error("课程不存在");
  if (user.role !== "ADMIN" && user.role !== "MANAGER" && course.owner_id !== user.id) throw new Error("仅可录入本人课程反馈");
  sqlRun(
    "insert into feedbacks(course_id,feedback_type,score,module_name,content,created_by) values (?,?,?,?,?,?)",
    courseId,
    feedbackType,
    score,
    moduleName,
    content,
    user.id,
  );
  revalidateFeedbackPages();
}

export function reviewFeedback(user: SessionUser, id: number, status: "APPROVED" | "REJECTED") {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无审核权限");
  sqlRun("update feedbacks set review_status=?,reviewed_by=? where id=?", status, user.id, id);
  if (status === "APPROVED") {
    const row = sqlOne<{ content: string; module_name: string; course_id: number; scope: "INTERNAL" | "OPC" }>(
      `select f.content,f.module_name,f.course_id,c.scope from feedbacks f join courses c on c.id=f.course_id where f.id=?`,
      id,
    );
    if (row) {
      sqlRun(
        "insert into knowledge_suggestions(feedback_id,category,title,content,scope,status) values (?,?,?,?,?,?)",
        id,
        "CASE",
        `反馈沉淀·${row.module_name}`,
        row.content,
        row.scope,
        "PENDING",
      );
    }
  }
  revalidateFeedbackPages();
  revalidateKnowledgePages();
}

export async function generateQualityReport(user: SessionUser, courseId: number) {
  const course = sqlOne<{ id: number; title: string; owner_id: number; scope: "INTERNAL" | "OPC" }>(
    "select id,title,owner_id,scope from courses where id=?",
    courseId,
  );
  if (!course) throw new Error("课程不存在");
  if (user.role !== "INTERNAL" && user.role !== "OPC") {
    throw new Error("仅内部员工与 OPC 讲师可生成分析报告");
  }
  if (course.owner_id !== user.id) throw new Error("仅可分析本人课程");
  assertOpcCanAfford(user, "REPORT_GENERATE");
  if (user.role === "OPC") {
    const { reportGenerateCost } = getPlatformSettings();
    await mockPaymentGateway("REPORT_GENERATE");
    deductPoints(user.id, "REPORT_GENERATE", -reportGenerateCost, "生成分析报告扣费");
  }

  const { minFeedbackForTrend } = getPlatformSettings();
  const stats = sqlOne<{ avgScore: number | null; cnt: number }>(
    "select avg(score) as avgScore,count(*) as cnt from feedbacks where course_id=? and review_status='APPROVED'",
    courseId,
  );
  if (!stats || stats.cnt < minFeedbackForTrend) {
    throw new Error(`反馈样本不足（需至少 ${minFeedbackForTrend} 条已审核反馈）`);
  }
  const weakModules = sqlAll<{ module_name: string; avg_score: number }>(
    "select module_name,avg(score) as avg_score from feedbacks where course_id=? and review_status='APPROVED' group by module_name having avg(score) < 4",
    courseId,
  ).map((x) => x.module_name);
  const avgScore = stats.avgScore ?? 0;
  const iterationActions = buildIterationActions(weakModules, avgScore);
  const reportText = await mockLLMGenerateReport({
    title: course.title,
    avgScore,
    weakModules,
  });
  const result = sqlRun(
    "insert into quality_reports(course_id,generated_by,report_text,summary_score,iteration_actions) values (?,?,?,?,?)",
    courseId,
    user.id,
    reportText,
    avgScore,
    serializeIterationActions(iterationActions),
  );
  revalidateReportsPages();
  return Number(result.lastInsertRowid);
}

export function createShareLink(user: SessionUser, reportId: number) {
  const report = sqlOne<{ id: number; generated_by: number }>("select id,generated_by from quality_reports where id=?", reportId);
  if (!report) throw new Error("报告不存在");
  if (user.role !== "ADMIN" && report.generated_by !== user.id) throw new Error("仅可分享本人报告");
  const token = createToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  sqlRun("insert into share_links(report_id,owner_id,token,is_active,expires_at) values (?,?,?,1,?)", reportId, user.id, token, expiresAt);
  revalidateReportsPages();
  return token;
}

export function getShareReport(token: string) {
  const base = sqlOne<{
    title: string;
    report_text: string;
    summary_score: number;
    ownerName: string;
    course_id: number;
  }>(
    `select c.title,qr.report_text,qr.summary_score,u.name as ownerName,c.id as course_id
     from share_links sl
     join quality_reports qr on qr.id=sl.report_id
     join courses c on c.id=qr.course_id
     join users u on u.id=sl.owner_id
     where sl.token=? and sl.is_active=1 and (sl.expires_at is null or sl.expires_at > datetime('now'))`,
    token,
  );
  if (!base) return null;
  const moduleSummary = sqlAll<{ module_name: string; avg_score: number; cnt: number }>(
    `select module_name,avg(score) as avg_score,count(*) as cnt from feedbacks
     where course_id=? and review_status='APPROVED' group by module_name order by avg_score asc`,
    base.course_id,
  );
  return { ...base, moduleSummary };
}

export function listDashboardData(user: SessionUser) {
  const courses = listCourses(user);
  const knowledgeItems = user.role === "ADMIN"
    ? sqlAll("select * from knowledge_items order by id desc")
    : sqlAll("select * from knowledge_items where scope = ? order by id desc", user.scope);
  const feedbacks = user.role === "ADMIN"
    ? sqlAll("select * from feedbacks order by id desc")
    : sqlAll(
        `select f.* from feedbacks f join courses c on c.id=f.course_id
         where c.scope = ? order by f.id desc`,
        user.scope,
      );
  const reports = user.role === "ADMIN"
    ? sqlAll(
        `select qr.id,qr.course_id,c.title,qr.report_text,qr.summary_score,qr.iteration_actions,qr.created_at from quality_reports qr
         join courses c on c.id=qr.course_id order by qr.id desc`,
      )
    : sqlAll(
        `select qr.id,qr.course_id,c.title,qr.report_text,qr.summary_score,qr.iteration_actions,qr.created_at from quality_reports qr
         join courses c on c.id=qr.course_id
         where c.scope = ? order by qr.id desc`,
        user.scope,
      );
  const { minFeedbackForTrend } = getPlatformSettings();
  const scoreTrendRaw = sqlAll<{ courseId: number; title: string; avgScore: number; feedbackCount: number }>(
    `select c.id as courseId,c.title,coalesce(avg(f.score),0) as avgScore,count(f.id) as feedbackCount
     from courses c left join feedbacks f on f.course_id=c.id and f.review_status='APPROVED'
     ${user.role === "ADMIN" ? "" : "where c.scope = ?"}
     group by c.id,c.title order by c.id desc`,
    ...(user.role === "ADMIN" ? [] : [user.scope]),
  );
  const scoreTrend: ScoreTrendItem[] = scoreTrendRaw.map((t) => ({
    ...t,
    meetsThreshold: t.feedbackCount >= minFeedbackForTrend,
  }));
  const insights = sqlAll("select * from strategy_insights order by id desc");
  const billing = sqlAll(
    user.role === "OPC" ? "select * from billing_logs where user_id=? order by id desc" : "select * from billing_logs order by id desc",
    ...(user.role === "OPC" ? [user.id] : []),
  );
  return { courses, knowledgeItems, feedbacks, reports, scoreTrend, insights, billing };
}

export function createGrowthCard(user: SessionUser, content: string) {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无权限");
  sqlRun("insert into growth_cards(user_id,card_text) values (?,?)", user.id, content);
  revalidatePath("/admin");
}

export function createVersionComparison(user: SessionUser, courseId: number, baseVersion: number, targetVersion: number, diffText: string) {
  const course = sqlOne<{ owner_id: number }>("select owner_id from courses where id = ?", courseId);
  if (!course) throw new Error("课程不存在");
  if (user.role !== "ADMIN" && course.owner_id !== user.id) throw new Error("仅本人可对比版本");
  sqlRun(
    "insert into version_comparisons(course_id,base_version,target_version,diff_text) values (?,?,?,?)",
    courseId,
    baseVersion,
    targetVersion,
    diffText,
  );
  revalidateCoursesPages();
}

export function upsertStrategyInsight(user: SessionUser, scope: "INTERNAL" | "OPC", title: string, insight: string) {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无权限");
  sqlRun("insert into strategy_insights(scope,title,insight) values (?,?,?)", scope, title, insight);
  revalidatePath("/admin");
}

function deductPoints(userId: number, action: "COURSE_DESIGN_START" | "REPORT_GENERATE", delta: number, note: string) {
  withTx(() => {
    const row = sqlOne<{ points: number }>("select points from users where id = ?", userId);
    if (!row) throw new Error("用户不存在");
    const nextPoints = row.points + delta;
    if (nextPoints < 0) throw new Error("积分不足，请充值后继续");
    sqlRun("update users set points=? where id=?", nextPoints, userId);
    sqlRun("insert into billing_logs(user_id,action,points_delta,note) values (?,?,?,?)", userId, action, delta, note);
  });
}

// --- 课后问卷 US-D1 ---
export function createCourseSurvey(user: SessionUser, courseId: number) {
  ensureCourseAccess(user, courseId);
  if (user.role === "MANAGER") throw new Error("管理层不可发起问卷");
  const existing = sqlOne<{ token: string }>(
    "select token from course_surveys where course_id=? and is_active=1 order by id desc limit 1",
    courseId,
  );
  if (existing) return existing.token;
  const token = createToken();
  const title = sqlOne<{ title: string }>("select title from courses where id=?", courseId);
  sqlRun(
    "insert into course_surveys(course_id,token,title,created_by) values (?,?,?,?)",
    courseId,
    token,
    `课后问卷 · ${title?.title ?? "课程"}`,
    user.id,
  );
  revalidateFeedbackPages();
  return token;
}

export function getSurveyByToken(token: string) {
  return sqlOne<{ id: number; course_id: number; title: string; is_active: number }>(
    "select id,course_id,title,is_active from course_surveys where token=? and is_active=1",
    token,
  );
}

export function getSurveyModuleOptions(token: string): string[] {
  const survey = getSurveyByToken(token);
  if (!survey) return ["整体"];
  const course = sqlOne<{ framework: string; framework_modules: string | null }>(
    "select framework,framework_modules from courses where id=?",
    survey.course_id,
  );
  if (!course) return ["整体"];
  const modules = parseModulesJson(course.framework_modules, course.framework);
  const names = modules.map((m) => m.title).filter(Boolean);
  return ["整体", ...names.filter((n) => n !== "整体")];
}

export function listCourseSurveys(user: SessionUser, courseId?: number) {
  if (courseId) ensureCourseAccess(user, courseId);
  let sql = `select cs.id,cs.token,cs.course_id,c.title as course_title,cs.title,cs.created_at,
     (select count(*) from survey_responses sr where sr.survey_id=cs.id) as response_count
     from course_surveys cs join courses c on c.id=cs.course_id where cs.is_active=1`;
  const params: number[] = [];
  if (courseId) {
    sql += " and cs.course_id=?";
    params.push(courseId);
  }
  if (user.role === "INTERNAL" || user.role === "OPC") {
    sql += " and c.owner_id=?";
    params.push(user.id);
  } else if (user.role === "MANAGER") {
    sql += " and c.scope='INTERNAL'";
  }
  sql += " order by cs.id desc";
  return sqlAll<{
    id: number;
    token: string;
    course_id: number;
    course_title: string;
    title: string;
    response_count: number;
    created_at: string;
  }>(sql, ...params);
}

export function submitSurveyResponse(
  token: string,
  payload: { moduleName: string; score: number; content: string; respondentLabel?: string },
) {
  const survey = getSurveyByToken(token);
  if (!survey) throw new Error("问卷链接无效或已关闭");
  const course = sqlOne<{ owner_id: number; scope: "INTERNAL" | "OPC" }>(
    "select owner_id,scope from courses where id=?",
    survey.course_id,
  );
  if (!course) throw new Error("课程不存在");

  withTx(() => {
    sqlRun(
      "insert into survey_responses(survey_id,module_name,score,content,respondent_label) values (?,?,?,?,?)",
      survey.id,
      payload.moduleName,
      payload.score,
      payload.content,
      payload.respondentLabel ?? "学员",
    );
    sqlRun(
      "insert into feedbacks(course_id,feedback_type,score,module_name,content,created_by,review_status) values (?,?,?,?,?,?,?)",
      survey.course_id,
      "SURVEY",
      payload.score,
      payload.moduleName,
      `[问卷] ${payload.content}`,
      course.owner_id,
      "PENDING",
    );
  });
  return true;
}

// --- 交付发布 US-C5 ---
export function releaseCourseDelivery(user: SessionUser, courseId: number, acknowledgeRisk: boolean) {
  ensureCourseAccess(user, courseId);
  if (user.role === "MANAGER") throw new Error("管理层不可发布交付");
  const course = sqlOne<{
    framework: string;
    framework_modules: string | null;
    core_problem: string;
    scope: "INTERNAL" | "OPC";
    status: string;
  }>("select framework,framework_modules,core_problem,scope,status from courses where id=?", courseId);
  if (!course) throw new Error("课程不存在");
  const gaps = getKnowledgeGapsForCourse(
    courseId,
    course.scope,
    course.framework,
    course.framework_modules,
    course.core_problem,
  );
  if (gaps.length > 0 && !acknowledgeRisk) {
    throw new Error(`仍有 ${gaps.length} 项知识缺口，请补充知识库或勾选「已知晓风险」后发布`);
  }
  sqlRun("update courses set status='RELEASED',updated_at=datetime('now') where id=?", courseId);
  revalidateCoursesPages();
}

// --- 反馈→知识库 ---
export function listKnowledgeSuggestions(user: SessionUser) {
  const scopeFilter = user.role === "ADMIN" ? "" : "where ks.scope = ?";
  return sqlAll<{
    id: number;
    title: string;
    content: string;
    category: string;
    scope: string;
    status: string;
    feedback_id: number;
    created_at: string;
  }>(
    `select ks.id,ks.title,ks.content,ks.category,ks.scope,ks.status,ks.feedback_id,ks.created_at
     from knowledge_suggestions ks ${scopeFilter} order by ks.id desc`,
    ...(user.role === "ADMIN" ? [] : [user.scope]),
  );
}

export function promoteKnowledgeSuggestion(user: SessionUser, suggestionId: number) {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无权限");
  const s = sqlOne<{ title: string; content: string; category: string; scope: "INTERNAL" | "OPC" }>(
    "select title,content,category,scope from knowledge_suggestions where id=?",
    suggestionId,
  );
  if (!s) throw new Error("建议不存在");
  const result = sqlRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    s.category,
    s.title,
    s.content,
    "KNOWLEDGE",
    s.scope,
    "APPROVED",
    user.id,
  );
  sqlRun(
    "update knowledge_suggestions set status='APPROVED',knowledge_item_id=? where id=?",
    Number(result.lastInsertRowid),
    suggestionId,
  );
  revalidateKnowledgePages();
  revalidateFeedbackPages();
}

export function dismissKnowledgeSuggestion(user: SessionUser, suggestionId: number) {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无权限");
  sqlRun("update knowledge_suggestions set status='DISMISSED' where id=?", suggestionId);
  revalidateFeedbackPages();
}

// --- 管理看板 US-D7 ---
export function getManagementAnalytics(user: SessionUser) {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") throw new Error("无权限");
  const scopeClause = user.role === "ADMIN" ? "" : "where c.scope = 'INTERNAL'";
  const byCourseType = sqlAll<{ course_type: string; course_count: number; avg_score: number; feedback_count: number }>(
    `select c.course_type, count(distinct c.id) as course_count,
     coalesce(avg(f.score),0) as avg_score, count(f.id) as feedback_count
     from courses c left join feedbacks f on f.course_id=c.id and f.review_status='APPROVED'
     ${scopeClause}
     group by c.course_type order by avg_score desc`,
  );
  const byPeriod = sqlAll<{ period: string; course_count: number; avg_score: number }>(
    `select strftime('%Y-%m', c.created_at) as period, count(distinct c.id) as course_count,
     coalesce(avg(f.score),0) as avg_score
     from courses c left join feedbacks f on f.course_id=c.id and f.review_status='APPROVED'
     ${scopeClause}
     group by period order by period desc limit 12`,
  );
  const internalVsOpc =
    user.role === "ADMIN"
      ? sqlAll<{ scope: string; courses: number; avg_score: number }>(
          `select c.scope, count(distinct c.id) as courses, coalesce(avg(f.score),0) as avg_score
           from courses c left join feedbacks f on f.course_id=c.id and f.review_status='APPROVED'
           group by c.scope`,
        )
      : [];
  return { byCourseType, byPeriod, internalVsOpc };
}

// --- 管理端全景 US-E8 F6 ---
export function listAdminPanorama(user: SessionUser, scope: "INTERNAL" | "OPC") {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") throw new Error("无权限");
  if (user.role === "MANAGER" && scope !== "INTERNAL") throw new Error("管理层仅可查看内部课程");
  return sqlAll<{
    id: number;
    title: string;
    course_type: string;
    learner_type: string;
    status: string;
    version: number;
    owner_name: string;
    feedback_count: number;
    report_count: number;
    avg_score: number;
    created_at: string;
  }>(
    `select c.id,c.title,c.course_type,c.learner_type,c.status,c.version,u.name as owner_name,c.created_at,
     (select count(*) from feedbacks f where f.course_id=c.id) as feedback_count,
     (select count(*) from quality_reports qr where qr.course_id=c.id) as report_count,
     (select coalesce(avg(score),0) from feedbacks f where f.course_id=c.id and f.review_status='APPROVED') as avg_score
     from courses c join users u on u.id=c.owner_id where c.scope=? order by c.id desc`,
    scope,
  );
}

export function getCourseDetailForAdmin(user: SessionUser, courseId: number) {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") throw new Error("无权限");
  const course = sqlOne<Record<string, unknown>>(
    `select c.*, u.name as owner_name, u.email as owner_email, u.role as owner_role
     from courses c join users u on u.id=c.owner_id where c.id=?`,
    courseId,
  );
  if (!course) return null;
  if (user.role === "MANAGER" && course.scope !== "INTERNAL") return null;
  logAdminAudit(user, "VIEW_COURSE_DETAIL", "course", courseId, String(course.title));
  const output = sqlOne<Record<string, unknown>>("select * from course_outputs where course_id=?", courseId);
  const sectionSources = parseSectionSources(output?.section_sources as string | null);
  const feedbacks = sqlAll("select * from feedbacks where course_id=? order by id desc", courseId);
  const reports = sqlAll(
    "select id,report_text,summary_score,iteration_actions,created_at from quality_reports where course_id=? order by id desc",
    courseId,
  );
  const shareLinks = sqlAll(
    `select sl.id,sl.token,sl.is_active,sl.expires_at,sl.created_at
     from share_links sl join quality_reports qr on qr.id=sl.report_id where qr.course_id=? order by sl.id desc`,
    courseId,
  );
  return { course, output, sectionSources, feedbacks, reports, shareLinks };
}

export function savePlatformSettings(user: SessionUser, input: Partial<PlatformSettings>) {
  if (user.role !== "ADMIN") throw new Error("仅平台管理员可修改运营配置");
  persistPlatformSettings(user.id, input);
  logAdminAudit(user, "UPDATE_PLATFORM_SETTINGS", "settings", undefined, JSON.stringify(input));
  revalidatePath("/admin");
}

export { getPlatformSettings, listAdminAuditLogs, listPlatformSettingsRows };
