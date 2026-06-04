/** 面向用户的中文展示文案（内部枚举 → 可读标签） */

const sourceKindLabels: Record<string, string> = {
  KNOWLEDGE: "知识库",
  AI_GENERATED: "智能生成",
  MANUAL: "人工编辑",
};

const billingActionLabels: Record<string, string> = {
  COURSE_DESIGN_START: "课程设计",
  REPORT_GENERATE: "报告生成",
  RECHARGE: "积分充值",
};

const knowledgeCategoryLabels: Record<string, string> = {
  MODULE: "功能模块",
  CASE: "案例素材",
  TRAINER_TIP: "讲师技巧",
};

const courseStatusLabels: Record<string, string> = {
  DRAFT: "草稿",
  BLOCKED: "待处理",
  RELEASED: "已发布",
};

const scopeLabels: Record<string, string> = {
  INTERNAL: "内部",
  OPC: "合作讲师",
};

const roleLabels: Record<string, string> = {
  INTERNAL: "内部讲师",
  OPC: "合作讲师",
  MANAGER: "培训负责人",
  ADMIN: "平台管理员",
};

export function formatSourceKind(kind: string) {
  return sourceKindLabels[kind] ?? "系统生成";
}

export function formatBillingAction(action: string) {
  return billingActionLabels[action] ?? "账户变动";
}

export function formatKnowledgeCategory(category: string) {
  return knowledgeCategoryLabels[category] ?? category;
}

export function formatCourseStatus(status: string) {
  return courseStatusLabels[status] ?? status;
}

export function formatScope(scope: string) {
  return scopeLabels[scope] ?? scope;
}

export function formatRole(role: string) {
  return roleLabels[role] ?? role;
}
