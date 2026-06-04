import { requireUser } from "@/lib/auth";
import { listKnowledgeItems } from "@/lib/services";
import { AppPanel, StatCard } from "@/components/app-panel";
import { KnowledgeItemList } from "@/components/knowledge-item-list";

export default async function KnowledgeListPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const canReview = user.role === "MANAGER" || user.role === "ADMIN";
  const items = await listKnowledgeItems(user, "", "ALL");
  const pending = items.filter((x) => String((x as { review_status: string }).review_status) === "PENDING");

  return (
    <div className="space-y-3">
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">审核操作已保存。</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="知识条目总数" value={items.length} />
        <StatCard label="待审核" value={pending.length} />
      </div>

      <AppPanel description="显示来源标注与时间戳，同主题优先参考较新版本。">
        <KnowledgeItemList items={items} canReview={canReview} />
      </AppPanel>
    </div>
  );
}
