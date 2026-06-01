import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const cardBase =
  "rounded-lg border border-[#dee0e3] bg-white shadow-[0_1px_2px_rgba(31,35,41,0.04)]";

/** 对外叙事：五镜故事线 */
const storyFrames = [
  {
    act: "起",
    no: "01",
    title: "新课落在桌上",
    line: "「客户下周就要开营，方案还缺一整块——以前只能连夜翻旧课件。」",
    turn: "课研魔方把课型、学员、核心问题一次问清楚，大约半小时能拉出一版能开讲的方案，并带上大纲、练习册和课件包。",
    value: "价值：新课不再只靠个别骨干熬夜扛过去。",
    tone: "border-[#3370ff] bg-[#fafbff]",
  },
  {
    act: "承",
    no: "02",
    title: "经验伸手可及",
    line: "「好模块、好案例散在网盘和群里，新人备课像重新造轮子。」",
    turn: "把模块、案例、讲课技巧收进知识库，能搜、能审、能沉淀；备课时直接站在团队积累之上。",
    value: "价值：组织经验留下来，不跟着某个人离职带走。",
    tone: "border-[#00b8a9] bg-[#f6fffe]",
  },
  {
    act: "承",
    no: "03",
    title: "学员第一次被听见",
    line: "「上完课只觉得还行，不知道哪一段没讲透，下一轮只能凭感觉改。」",
    turn: "课后问卷和口头反馈统一入库、审核，学员哪块听不懂、哪块喜欢，都有据可查。",
    value: "价值：改课从「我觉得」变成「学员说了」。",
    tone: "border-[#fa8c16] bg-[#fffbf5]",
  },
  {
    act: "转",
    no: "04",
    title: "用数据决定续不续",
    line: "「负责人问这门课还能不能续签，会上只有印象，没有数。」",
    turn: "按课程、按模块看评分和趋势，样本够了才下结论——该续课、该停开、该改哪一段，一目了然。",
    value: "价值：培训投入可衡量，决策不再拍脑袋。",
    tone: "border-[#722ed1] bg-[#faf8ff]",
  },
  {
    act: "合",
    no: "05",
    title: "成果拿得出手",
    line: "「企业想知道你讲得好不好，口头说好不够，还要能展示、能转发。」",
    turn: "一键生成质量分析报告，讲师按需生成分享链接——专业度可见，续单更有底气。",
    value: "价值：对内复盘、对外展示，同一条故事线收尾。",
    tone: "border-[#597ef7] bg-[#f8faff]",
  },
];

const valueBento = [
  {
    who: "培训组织",
    headline: "经验留在公司里",
    body: "知识可审核、可迭代，新课有人能接，不依赖少数名师的脑子。",
    span: "md:col-span-2",
  },
  {
    who: "讲师与 OPC",
    headline: "备课省力，越讲越好",
    body: "从搭课到收反馈到出报告一条线走完，合作讲师还能把质量展示给企业看。",
    span: "md:col-span-2",
  },
  {
    who: "业务与客户",
    headline: "续课有据，信任可见",
    body: "评分、报告、分享页让「讲得好」变成看得见的东西，而不是会后一句感觉。",
    span: "md:col-span-2 xl:col-span-3",
  },
  {
    who: "一堂课的时间感",
    headline: "大约 30 分钟出初稿",
    body: "不是替代思考，而是把重复劳动收掉，把力气留给内容和讲授。",
    span: "md:col-span-2 xl:col-span-3",
  },
];

export function HomeLanding({ user }: { user: SessionUser | null }) {
  const primaryHref = user ? "/dashboard" : "/login";
  const primaryLabel = user ? "进入工作台" : "走进这个故事";

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-[#dee0e3] bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 lg:max-w-4xl">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3370ff] text-sm font-bold text-white">
              课
            </div>
            <span className="text-[16px] font-semibold text-[#1f2329]">课研魔方</span>
          </Link>
          <Link
            href={primaryHref}
            className="rounded-md bg-[#3370ff] px-4 py-2 text-[13px] text-white hover:bg-[#2860e1]"
          >
            {user ? "工作台" : "登录"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-5 lg:max-w-4xl">
        {/* 故事封面 */}
        <section className={cn(cardBase, "overflow-hidden p-0")}>
          <div className="border-b border-[#eef0f3] bg-[#1f2329] px-6 py-8 text-white sm:px-8 sm:py-10">
            <p className="text-[12px] tracking-[0.2em] text-[#8f959e]">故事版 · 对外叙事</p>
            <h1 className="mt-3 text-[24px] font-semibold leading-snug sm:text-[28px]">
              一门好课的故事，
              <br />
              不止发生在讲台上
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#c9cdd4]">
              很多机构不缺讲师，缺的是一条讲得通的路：怎么备课、怎么沉淀、怎么听学员、怎么证明讲得好。
              课研魔方把这条路上的人、事、数据串成一条线。
            </p>
          </div>
          <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
            <div>
              <p className="text-[12px] font-medium text-[#8f959e]">曾经</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#646a73]">
                好课靠少数人，资料散落，反馈在表格里，改课靠印象。
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#3370ff]">现在</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#1f2329]">
                从搭课到报告，五步走完；经验留下，决策有数，对外能展示。
              </p>
            </div>
            <div className="flex items-end">
              <Link
                href={primaryHref}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#3370ff] px-4 py-2.5 text-[14px] font-medium text-white hover:bg-[#2860e1] sm:w-auto"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 五镜分镜 */}
        <section className="space-y-1">
          <div className="px-1 pb-2">
            <h2 className="text-[17px] font-medium text-[#1f2329]">五镜分镜 · 一堂课的完整叙事</h2>
            <p className="mt-1 text-[13px] text-[#8f959e]">
              可按镜讲解：每一镜对应一个痛点、一次转折、一句价值。适合路演、方案页与对内对齐。
            </p>
          </div>

          {storyFrames.map((frame, idx) => (
            <article
              key={frame.no}
              className={cn(cardBase, "border-l-4 p-5 sm:p-6", frame.tone)}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-[13px] font-medium text-[#8f959e]">镜 {frame.no}</span>
                <span className="rounded bg-[#f0f1f2] px-2 py-0.5 text-[12px] font-medium text-[#646a73]">{frame.act}</span>
                <h3 className="text-[18px] font-semibold text-[#1f2329]">{frame.title}</h3>
              </div>

              <blockquote className="mt-4 border-none p-0 text-[15px] italic leading-relaxed text-[#646a73]">
                {frame.line}
              </blockquote>

              <p className="mt-4 text-[14px] leading-relaxed text-[#1f2329]">{frame.turn}</p>

              <p className="mt-3 text-[13px] font-medium text-[#3370ff]">{frame.value}</p>

              {idx < storyFrames.length - 1 ? (
                <div className="mt-5 flex justify-center text-[#dee0e3]" aria-hidden>
                  <span className="text-[20px] leading-none">↓</span>
                </div>
              ) : null}
            </article>
          ))}
        </section>

        {/* 价值便当 */}
        <section>
          <div className="px-1 pb-3">
            <h2 className="text-[17px] font-medium text-[#1f2329]">这个故事，谁受益</h2>
            <p className="mt-1 text-[13px] text-[#8f959e]">用便当格收束——对外讲价值时，可按角色挑格展开。</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            {valueBento.map((tile) => (
              <article key={tile.who} className={cn(cardBase, "p-5", tile.span)}>
                <p className="text-[12px] font-medium text-[#3370ff]">{tile.who}</p>
                <h3 className="mt-2 text-[16px] font-semibold text-[#1f2329]">{tile.headline}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#646a73]">{tile.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 终幕 */}
        <section className={cn(cardBase, "bg-gradient-to-br from-[#edf3ff] to-white p-6 text-center sm:p-8")}>
          <p className="text-[12px] font-medium tracking-wide text-[#3370ff]">终幕</p>
          <h2 className="mt-2 text-[20px] font-semibold text-[#1f2329]">
            课研魔方：把「怎么设计好一门课」
            <br />
            变成组织里人人能走的一条路
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#646a73]">
            {user
              ? "你已在故事里。进入工作台，从下一镜开始演。"
              : "欢迎现场体验演示环境，用故事里的五步亲自走一遍。"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#3370ff] px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#2860e1]"
            >
              {user ? "进入工作台" : "登录，走一遍五镜"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!user ? (
              <Link
                href="/share/demo"
                className="inline-flex items-center rounded-md border border-[#dee0e3] bg-white px-5 py-2.5 text-[14px] text-[#1f2329] hover:bg-[#fafbfc]"
              >
                预览对外分享页
              </Link>
            ) : null}
          </div>
          {!user ? (
            <p className="mt-4 text-[12px] text-[#8f959e]">
              演示账号 internal@demo.local / opc@demo.local 等，密码 demo1234
            </p>
          ) : null}
        </section>

        <footer className="pb-4 text-center text-[12px] text-[#8f959e]">课研魔方 · 课程设计与质量分析平台</footer>
      </main>
    </div>
  );
}
