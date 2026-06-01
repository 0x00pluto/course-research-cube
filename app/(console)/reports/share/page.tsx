import Link from "next/link";
import { revokeShareAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadReportsWorkspace } from "@/lib/reports-workspace";
import { AppPanel } from "@/components/app-panel";

export default async function ReportsSharePage() {
  const user = await requireUser();
  const { shareLinks, canShare } = await loadReportsWorkspace(user);

  if (!canShare) {
    return (
      <p className="text-[13px] text-[#8f959e]">当前角色无法管理对外分享链接，请在「质量报告」中查看分析报告。</p>
    );
  }

  return (
    <div className="space-y-3">
      <AppPanel description="对外分享页默认 30 天有效，可随时预览或撤销；企业仅能通过您主动分享的链接访问。">
        {shareLinks.length === 0 ? (
          <p className="text-[13px] text-[#8f959e]">
            暂无分享链接。请先在
            <Link href="/reports/analysis" className="mx-1 text-[#3370ff]">
              质量报告
            </Link>
            中生成报告并创建分享链接。
          </p>
        ) : (
          <div className="space-y-2">
            {shareLinks.map((link) => {
              const row = link as {
                id: number;
                token: string;
                course_title: string;
                is_active: number;
                expires_at: string | null;
                created_at: string;
              };
              const active = row.is_active === 1;
              return (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#eef0f3] px-3 py-2 text-[13px]"
                >
                  <div>
                    <span className="font-medium text-[#1f2329]">{row.course_title}</span>
                    <span className="ml-2 text-[#8f959e]">
                      {active ? "有效" : "已撤销"} · 过期 {row.expires_at?.slice(0, 10) ?? "—"} · 创建于 {row.created_at?.slice(0, 10) ?? "—"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {active ? (
                      <>
                        <Link href={`/share/${row.token}`} className="text-[#3370ff]">
                          预览分享页
                        </Link>
                        <form action={revokeShareAction}>
                          <input type="hidden" name="linkId" value={String(row.id)} />
                          <button type="submit" className="text-[#646a73]">
                            撤销链接
                          </button>
                        </form>
                      </>
                    ) : (
                      <span className="text-[#8f959e]">已失效</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppPanel>
    </div>
  );
}
