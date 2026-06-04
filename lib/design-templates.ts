export interface CourseTypeTemplate {
  value: string;
  label: string;
  duration: string;
  structure: string[];
  hints: string[];
  defaultTitle: string;
}

export interface LearnerTemplate {
  value: string;
  label: string;
  hints: string[];
  focusModules: string[];
}

export interface ProblemPreset {
  value: string;
  label: string;
  priorityModules: string[];
}

export const COURSE_TYPE_TEMPLATES: CourseTypeTemplate[] = [
  {
    value: "半天公开课",
    label: "半天公开课",
    duration: "约 4 小时",
    structure: ["破冰 10min", "核心讲授 90min", "演练 60min", "复盘 20min"],
    hints: ["控制模块数量 ≤5", "强调可带走的行动清单", "适合引流与品牌曝光"],
    defaultTitle: "半天公开课 · ",
  },
  {
    value: "一天技能课",
    label: "一天技能课",
    duration: "约 7 小时",
    structure: ["上午理论+案例", "下午实操+点评", "全天作业闭环"],
    hints: ["实操占比建议 ≥50%", "每个技能点配 1 个练习", "适合技能迁移场景"],
    defaultTitle: "一天技能课 · ",
  },
  {
    value: "多天实训营",
    label: "多天实训营",
    duration: "2–5 天",
    structure: ["每日目标对齐", "分日模块递进", "跨日作业与答辩"],
    hints: ["按天拆解里程碑", "增加同伴互评环节", "适合深度能力建设"],
    defaultTitle: "多天实训营 · ",
  },
  {
    value: "企业内训",
    label: "企业内训",
    duration: "按客户需求",
    structure: ["需求调研", "定制模块", "企业场景植入", "训后跟踪"],
    hints: ["突出客户业务语境", "产品植入保持可选方案", "注意合规与版权边界"],
    defaultTitle: "企业内训 · ",
  },
];

export const LEARNER_TEMPLATES: LearnerTemplate[] = [
  {
    value: "企业员工",
    label: "企业员工",
    hints: ["用业务语言，少术语堆砌", "案例贴近日常协作场景"],
    focusModules: ["协作工具", "流程效率", "场景演练"],
  },
  {
    value: "管理层",
    label: "管理层",
    hints: ["强调决策框架与 ROI", "控制实操深度，突出洞察"],
    focusModules: ["趋势判断", "团队赋能", "复盘决策"],
  },
  {
    value: "一线业务",
    label: "一线业务",
    hints: ["步骤化、可立即执行", "多用清单与模板"],
    focusModules: ["操作手册", "案例模仿", "现场练习"],
  },
  {
    value: "OPC 学员",
    label: "OPC 学员",
    hints: ["兼顾独立授课能力", "预留个人品牌展示模块"],
    focusModules: ["授课节奏", "互动设计", "个人案例"],
  },
];

export const PROBLEM_PRESETS: ProblemPreset[] = [
  { value: "工具不会用", label: "工具不会用，上手慢", priorityModules: ["功能模块", "操作步骤", "练习册"] },
  { value: "协作效率低", label: "协作效率低，信息不同步", priorityModules: ["协作场景", "案例素材", "流程模板"] },
  { value: "缺乏方法论", label: "缺乏方法论，执行无章法", priorityModules: ["框架拆解", "理论+实操", "复盘"] },
  { value: "产品植入难", label: "产品植入难，客户反感硬推", priorityModules: ["场景演练", "可选方案", "价值叙事"] },
  { value: "培训效果差", label: "培训效果差，学员记不住", priorityModules: ["互动节奏", "作业闭环", "讲师技巧"] },
];

export function getCourseTypeTemplate(value: string) {
  return COURSE_TYPE_TEMPLATES.find((t) => t.value === value) ?? COURSE_TYPE_TEMPLATES[0];
}

export function getLearnerTemplate(value: string) {
  return LEARNER_TEMPLATES.find((t) => t.value === value) ?? LEARNER_TEMPLATES[0];
}

export function getProblemPreset(value: string) {
  return PROBLEM_PRESETS.find((p) => p.value === value || p.label === value);
}
