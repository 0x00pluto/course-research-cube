import { rechargeAction } from "@/app/actions";
import { requireRoles } from "@/lib/auth";
import { getPlatformSettings, getUserPoints, listDashboardData } from "@/lib/services";
import { AppPanel, btnPrimary, inputCls, StatCard } from "@/components/app-panel";
import { formatBillingAction } from "@/lib/display-labels";

export default async function OpcPage({
  searchParams,
}: {
  searchParams: Promise<{ recharged?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await requireRoles(["OPC", "ADMIN"]);
  const data = await listDashboardData(user);
  const opcPoints = await getUserPoints(user.role === "OPC" ? user.id : user.id);
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-3">
      {params.error ? (
        <p className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">{params.error}</p>
      ) : null}
      {params.recharged ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">充值成功。</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="当前积分余额" value={opcPoints} />
        <StatCard label="课程设计扣费" value={`${settings.courseDesignCost} 积分/次`} />
        <StatCard label="报告生成扣费" value={`${settings.reportGenerateCost} 积分/次`} />
      </div>

      {user.role === "OPC" && opcPoints < settings.courseDesignCost ? (
        <div className="rounded-md border border-[#ffccc7] bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]">
          余额不足：当前 {opcPoints} 积分，无法发起新的课程设计。请充值后再继续使用。
        </div>
      ) : null}

      {user.role === "OPC" ? (
        <AppPanel title="积分充值" description="支持在线支付，充值成功后积分即时到账。">
          <form action={rechargeAction} className="flex flex-wrap items-end gap-2">
            <select name="amount" className={inputCls} defaultValue="10">
              <option value="10">充值 10 积分</option>
              <option value="20">充值 20 积分</option>
              <option value="50">充值 50 积分</option>
            </select>
            <button type="submit" className={btnPrimary}>
              立即充值
            </button>
          </form>
        </AppPanel>
      ) : null}

      <AppPanel title="计费规则" description="OPC 按次计费，开始前请确认需求。">
        <ul className="list-inside list-disc space-y-1 text-[13px] text-[#646a73]">
          <li>点击「开始课程设计」立即扣除 5 积分，中途放弃不退还。</li>
          <li>生成分析报告按次扣除 3 积分。</li>
          <li>已生成的报告重复查看不重复扣费。</li>
          <li>余额不足时系统将阻止继续操作并提示充值。</li>
        </ul>
      </AppPanel>

      <AppPanel title="积分流水">
        <div className="space-y-1">
          {data.billing.length === 0 ? (
            <p className="text-[13px] text-[#8f959e]">暂无流水记录。</p>
          ) : (
            data.billing.map((b) => {
              const row = b as { id: number; action: string; points_delta: number; note: string; created_at: string };
              return (
                <div key={row.id} className="flex items-center justify-between rounded-md border border-[#eef0f3] px-3 py-2 text-[12px]">
                  <span className="text-[#646a73]">
                    {formatBillingAction(row.action)} · {row.note}
                  </span>
                  <span className={row.points_delta < 0 ? "text-[#f53f3f]" : "text-[#00b42a]"}>
                    {row.points_delta > 0 ? "+" : ""}
                    {row.points_delta}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </AppPanel>
    </div>
  );
}
