import Link from "next/link";
import { getShareReport } from "@/lib/services";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage(props: Props) {
  const { token } = await props.params;
  if (token === "demo") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">企业分享页示例</h1>
          <p className="mt-3 text-muted-foreground">
            真实分享链接由 OPC 讲师在报告页主动生成，未授权时无法访问。
          </p>
          <Link href="/" className="mt-6 inline-block rounded-lg border px-3 py-2">
            返回首页
          </Link>
        </section>
      </main>
    );
  }

  const report = getShareReport(token);
  if (!report) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">分享链接无效</h1>
          <p className="mt-2 text-muted-foreground">该链接不存在、已失效或未被授权访问。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <section className="rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">讲师：{report.ownerName}</p>
        <h1 className="mt-2 text-2xl font-semibold">{report.title}</h1>
        <p className="mt-2 text-lg text-[#3370ff]">综合评分：{Number(report.summary_score).toFixed(2)}</p>

        {report.moduleSummary.length > 0 ? (
          <div className="mt-4 rounded-lg border border-[#eef0f3] p-4">
            <h2 className="text-[15px] font-medium text-[#1f2329]">模块反馈摘要</h2>
            <div className="mt-2 space-y-2">
              {report.moduleSummary.map((m) => (
                <div key={m.module_name} className="flex justify-between text-[13px]">
                  <span className="text-[#646a73]">{m.module_name}</span>
                  <span className={Number(m.avg_score) < 4 ? "text-[#ff7d00]" : "text-[#00b42a]"}>
                    {Number(m.avg_score).toFixed(1)} 分 · {m.cnt} 条反馈
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <details className="mt-4">
          <summary className="cursor-pointer text-[#3370ff]">查看完整分析报告</summary>
          <pre className="mt-3 whitespace-pre-wrap rounded-lg border bg-background p-3 text-sm">{report.report_text}</pre>
        </details>
      </section>
    </main>
  );
}
