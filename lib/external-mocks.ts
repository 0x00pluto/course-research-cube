export interface LLMInput {
  title: string;
  learnerType: string;
  coreProblem: string;
  marketInfo: string;
  userInsight: string;
  productEmbedding: string;
  trainerTips: string;
}

export async function mockLLMGenerateFramework(input: LLMInput) {
  await delay(250);
  return `# 课程框架
1) 破冰与目标对齐（10分钟）
2) 核心问题拆解：${input.coreProblem}（30分钟）
3) 场景演练：${input.learnerType} 真实案例（40分钟）
4) 工具落地：${input.productEmbedding}（30分钟）
5) 复盘与行动计划（10分钟）`;
}

export async function mockLLMGenerateOutputs(input: LLMInput, framework: string) {
  await delay(280);
  return {
    outline: `课程《${input.title}》大纲\n${framework}`,
    workbook: `练习册\n- 练习1：基于${input.marketInfo}做拆解\n- 练习2：结合${input.userInsight}写行动方案\n- 作业：围绕${input.coreProblem}设计下周实践`,
    deckPackage: `课件包素材清单\n- 问题定义页\n- 场景案例页\n- 步骤模板页\n- 复盘页`,
    riskNotice: "存在知识缺口时请补充案例与讲师技巧后再正式交付。",
  };
}

export async function mockLLMGenerateReport(payload: {
  title: string;
  avgScore: number;
  weakModules: string[];
}) {
  await delay(260);
  return `质量分析报告
课程：${payload.title}
综合评分：${payload.avgScore.toFixed(2)}
薄弱模块：${payload.weakModules.length ? payload.weakModules.join("、") : "暂无明显薄弱模块"}
建议：优先优化薄弱模块的练习说明与互动节奏。`;
}

export async function mockPaymentGateway(action: "COURSE_DESIGN_START" | "REPORT_GENERATE") {
  await delay(120);
  return { success: true, channel: "online-payment", action };
}

export async function mockMarketDataFeed(problem: string) {
  await delay(100);
  return {
    trend: `近期与“${problem}”相关的企业培训需求增长明显，建议增加实操比重。`,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
