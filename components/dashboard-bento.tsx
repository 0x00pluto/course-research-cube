import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  MessageSquareText,
  Share2,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardBentoProps {
  userName: string;
  userRole: UserRole;
  stats: {
    courses: number;
    knowledge: number;
    feedbacks: number;
    reports: number;
    pendingKnowledge: number;
    pendingFeedback: number;
    activeRate: number;
    opcPoints: number;
  };
  scoreTrend: Array<{
    courseId: number;
    title: string;
    avgScore: number;
    feedbackCount: number;
    meetsThreshold: boolean;
  }>;
  minFeedbackForTrend?: number;
  canAdmin: boolean;
}

const cardBase =
  "rounded-lg border border-[#dee0e3] bg-white p-5 shadow-[0_1px_2px_rgba(31,35,41,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(31,35,41,0.06)]";

const roleLabel: Record<UserRole, string> = {
  INTERNAL: "内部讲师",
  OPC: "合作讲师",
  MANAGER: "培训负责人",
  ADMIN: "平台管理员",
};

function courseJourneySteps(stats: DashboardBentoProps["stats"]) {
  return [
    {
      step: 1,
      title: "先把课搭起来",
      desc: "选好课型、学员和问题，半小时左右能出一版能讲的方案",
      href: "/courses/design",
      icon: Sparkles,
      metric: stats.courses > 0 ? `已有 ${stats.courses} 门` : "还没开课",
      iconBg: "bg-[#edf3ff]",
      iconColor: "text-[#3370ff]",
      badge: "bg-[#edf3ff] text-[#3370ff]",
    },
    {
      step: 2,
      title: "翻翻知识库",
      desc: "找现成的模块、案例和讲课小技巧，少从零写起",
      href: "/knowledge/search",
      icon: BookOpen,
      metric: `${stats.knowledge} 条可用`,
      iconBg: "bg-[#e6fffb]",
      iconColor: "text-[#00b8a9]",
      badge: "bg-[#e6fffb] text-[#00b8a9]",
    },
    {
      step: 3,
      title: "收学员反馈",
      desc: "发问卷或记下课后评价，学员说了什么都会留下来",
      href: "/feedback/survey",
      icon: MessageSquareText,
      metric: stats.feedbacks > 0 ? `收到 ${stats.feedbacks} 条` : "还没收到",
      iconBg: "bg-[#fff7e6]",
      iconColor: "text-[#fa8c16]",
      badge: "bg-[#fff7e6] text-[#fa8c16]",
    },
    {
      step: 4,
      title: "看看课讲得怎样",
      desc: "哪门课分高、哪个模块要改，一眼能看出来",
      href: "/feedback/analysis",
      icon: BarChart3,
      metric: stats.feedbacks > 0 ? "可以看" : "先多收反馈",
      iconBg: "bg-[#f9f0ff]",
      iconColor: "text-[#722ed1]",
      badge: "bg-[#f9f0ff] text-[#722ed1]",
    },
    {
      step: 5,
      title: "写报告、对外讲",
      desc: "整理成质量报告，需要时生成链接给企业看",
      href: "/reports/analysis",
      icon: Share2,
      metric: stats.reports > 0 ? `${stats.reports} 份报告` : "还没生成",
      iconBg: "bg-[#f0f5ff]",
      iconColor: "text-[#597ef7]",
      badge: "bg-[#f0f5ff] text-[#597ef7]",
    },
  ];
}

const bentoShortcuts = [
  { label: "我的课程", href: "/courses/my", color: "bg-[#3370ff]" },
  { label: "新增知识", href: "/knowledge/new", color: "bg-[#13c2c2]" },
  { label: "录入反馈", href: "/feedback/collect", color: "bg-[#fa8c16]" },
  { label: "反馈列表", href: "/feedback/list", color: "bg-[#eb2f96]" },
  { label: "版本对比", href: "/courses/versions", color: "bg-[#52c41a]" },
  { label: "管理后台", href: "/admin", color: "bg-[#597ef7]", adminOnly: true },
  { label: "OPC 积分", href: "/opc", color: "bg-[#26a69a]", opcOnly: true },
];

export function DashboardBento({
  userName,
  userRole,
  stats,
  scoreTrend,
  canAdmin,
  minFeedbackForTrend = 3,
}: DashboardBentoProps) {
  const steps = courseJourneySteps(stats);
  const shortcuts = bentoShortcuts.filter((e) => {
    if (e.adminOnly && !canAdmin) return false;
    if (e.opcOnly && userRole !== "OPC" && userRole !== "ADMIN") return false;
    return true;
  });

  const hasPending = (stats.pendingKnowledge > 0 || stats.pendingFeedback > 0) && canAdmin;

  return (
    <div className="space-y-4">
      {/* 一课怎么走完全程 */}
      <section className={cardBase}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-[#646a73]">从备课到复盘，平常就是这么几步</p>
            <h1 className="mt-1 text-[20px] font-semibold text-[#1f2329]">
              {userName}，欢迎回来
              <span className="ml-2 text-[14px] font-normal text-[#8f959e]">· {roleLabel[userRole]}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#646a73]">
              不用记菜单在哪：先搭课、再查资料、收反馈、看评分、必要时出报告。点下面任意一块，就能进到对应页面。
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3370ff] text-lg font-bold text-white">
            课
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-1">
          <div className="flex min-w-[720px] items-stretch gap-0">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isLast = idx === steps.length - 1;
              return (
                <div key={item.step} className="flex flex-1 items-stretch">
                  <Link
                    href={item.href}
                    className="group flex flex-1 flex-col rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-4 transition-colors hover:border-[#3370ff]/40 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8f959e]">第 {item.step} 步</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", item.badge)}>
                        {item.metric}
                      </span>
                    </div>
                    <div className={cn("mt-3 flex h-10 w-10 items-center justify-center rounded-lg", item.iconBg)}>
                      <Icon className={cn("h-5 w-5", item.iconColor)} strokeWidth={1.5} />
                    </div>
                    <h2 className="mt-3 text-[15px] font-medium text-[#1f2329] group-hover:text-[#3370ff]">
                      {item.title}
                    </h2>
                    <p className="mt-1 flex-1 text-[12px] leading-relaxed text-[#8f959e]">{item.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-0.5 text-[12px] text-[#3370ff] opacity-0 transition-opacity group-hover:opacity-100">
                      点这里开始
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  {!isLast ? (
                    <div className="flex w-6 shrink-0 items-center justify-center text-[#bbbfc4]" aria-hidden>
                      <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 下方信息区 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <section className={cn(cardBase, "md:col-span-2 xl:col-span-5")}>
          <h2 className="text-[15px] font-medium text-[#1f2329]">手头有多少</h2>
          <p className="mt-1 text-[12px] text-[#8f959e]">课程、知识、反馈和报告，点数字就能进去看</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              { label: "我的课程", value: stats.courses, href: "/courses/my" },
              { label: "知识条目", value: stats.knowledge, href: "/knowledge/list" },
              { label: "学员反馈", value: stats.feedbacks, href: "/feedback/list" },
              { label: "分析报告", value: stats.reports, href: "/reports/analysis" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] px-4 py-3 transition-colors hover:border-[#3370ff]/30 hover:bg-white"
              >
                <div className="text-[26px] font-semibold leading-none text-[#1f2329]">{item.value}</div>
                <div className="mt-1 text-[12px] text-[#8f959e]">{item.label}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className={cn(cardBase, "md:col-span-2 xl:col-span-4")}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-medium text-[#1f2329]">学员打得怎么样</h2>
              <p className="mt-0.5 text-[12px] text-[#8f959e]">反馈够多才有均分，不够会提示还差几条</p>
            </div>
            <Link href="/feedback/analysis" className="shrink-0 text-[12px] text-[#3370ff]">
              看详细分析
            </Link>
          </div>
          {scoreTrend.length > 0 ? (
            <div className="mt-4 space-y-2">
              {scoreTrend.slice(0, 4).map((t) => (
                <div key={t.courseId} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate text-[#1f2329]">{t.title}</span>
                  <span className="shrink-0 text-[#646a73]">
                    {t.meetsThreshold
                      ? `均分 ${Number(t.avgScore).toFixed(1)}`
                      : `还差 ${Math.max(0, minFeedbackForTrend - t.feedbackCount)} 条反馈`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-relaxed text-[#8f959e]">
              还没有评分。上完课发一份问卷，学员填完就能在这里看到每门课的表现。
            </p>
          )}
        </section>

        {/* 待办 / OPC - 竖条 */}
        <section className={cn(cardBase, "xl:col-span-3", !hasPending && userRole !== "OPC" && userRole !== "ADMIN" && "xl:row-span-1")}>
          {hasPending ? (
            <>
              <h2 className="text-[15px] font-medium text-[#1f2329]">需要你过一眼</h2>
              <p className="mt-1 text-[12px] text-[#8f959e]">同事提交的内容，审核通过才会进正式库</p>
              <div className="mt-3 space-y-2">
                {stats.pendingKnowledge > 0 ? (
                  <Link
                    href="/knowledge/list"
                    className="flex justify-between rounded-md bg-[#fff7e6] px-3 py-2.5 text-[13px] text-[#ad6800]"
                  >
                    <span>待审的知识条目</span>
                    <span className="font-medium">{stats.pendingKnowledge}</span>
                  </Link>
                ) : null}
                {stats.pendingFeedback > 0 ? (
                  <Link
                    href="/feedback/list"
                    className="flex justify-between rounded-md bg-[#fff7e6] px-3 py-2.5 text-[13px] text-[#ad6800]"
                  >
                    <span>待审的学员反馈</span>
                    <span className="font-medium">{stats.pendingFeedback}</span>
                  </Link>
                ) : null}
              </div>
            </>
          ) : (userRole === "OPC" || userRole === "ADMIN") ? (
            <>
              <h2 className="text-[15px] font-medium text-[#1f2329]">账户积分</h2>
              <div className="mt-2 text-[32px] font-semibold leading-none text-[#1f2329]">{stats.opcPoints}</div>
              <p className="mt-1 text-[12px] text-[#8f959e]">设计课程、生成报告时会按次扣减</p>
              {stats.opcPoints < 5 ? (
                <p className="mt-2 text-[12px] text-[#cf1322]">余额不多了，建议先充一点再用。</p>
              ) : null}
              <Link href="/opc" className="mt-3 inline-block text-[13px] text-[#3370ff]">
                查看充值与消费记录
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-medium text-[#1f2329]">反馈收集情况</h2>
              <div className="mt-4 space-y-3 text-[13px]">
                <div className="flex justify-between text-[#646a73]">
                  <span>有反馈的课程占比</span>
                  <span className="font-medium text-[#1f2329]">{stats.activeRate.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#eef0f3]">
                  <div
                    className="h-full rounded-full bg-[#3370ff] transition-all"
                    style={{ width: `${Math.min(100, stats.activeRate)}%` }}
                  />
                </div>
                <p className="text-[12px] leading-relaxed text-[#8f959e]">多收几条课后评价，改课、续课心里更有数。</p>
              </div>
            </>
          )}
        </section>

        <section className={cn(cardBase, "xl:col-span-8")}>
          <h2 className="text-[15px] font-medium text-[#1f2329]">常用入口</h2>
          <p className="mt-1 text-[12px] text-[#8f959e]">侧边栏里也能找，这里把最常用的摆在一起</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {shortcuts.map((entry) => (
              <Link
                key={entry.label}
                href={entry.href}
                className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-2 transition-colors hover:border-[#eef0f3] hover:bg-[#fafbfc]"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-sm transition-transform group-hover:scale-105",
                    entry.color,
                  )}
                >
                  {entry.label.slice(0, 1)}
                </div>
                <span className="text-center text-[12px] text-[#646a73]">{entry.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 闭环提示 - 宽条 */}
        <section
          className={cn(
            cardBase,
            "flex flex-col justify-center bg-gradient-to-br from-[#edf3ff] to-white xl:col-span-4",
          )}
        >
          <p className="text-[12px] font-medium text-[#3370ff]">建议你接下来</p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#1f2329]">
            {stats.courses === 0
              ? "还没有自己的课？先花半小时把第一节课搭出来，后面收反馈、改课都围着它转。"
              : stats.feedbacks === 0
                ? "课已经有了，下一步发给学员一份课后问卷，听听他们哪块没听懂。"
                : stats.reports === 0
                  ? "反馈攒了一些了，可以看看评分、写一份报告，方便跟企业或团队汇报。"
                  : "该做的都做了，若要开新一版课，可以从报告里的建议改起，或把心得记进知识库。"}
          </p>
          <Link
            href={
              stats.courses === 0
                ? "/courses/design"
                : stats.feedbacks === 0
                  ? "/feedback/survey"
                  : stats.reports === 0
                    ? "/reports/analysis"
                    : "/courses/my"
            }
            className="mt-4 inline-flex w-fit items-center gap-1 rounded-md bg-[#3370ff] px-4 py-2 text-[13px] text-white hover:bg-[#2860e1]"
          >
            {stats.courses === 0
              ? "去搭第一节课"
              : stats.feedbacks === 0
                ? "去发问卷"
                : stats.reports === 0
                  ? "去看分析、写报告"
                  : "打开我的课程"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
