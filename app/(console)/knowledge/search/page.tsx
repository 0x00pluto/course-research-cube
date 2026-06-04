import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listKnowledgeItems } from "@/lib/services";
import { AppPanel, btnSecondary, inputCls, StatCard } from "@/components/app-panel";
import { KnowledgeItemList } from "@/components/knowledge-item-list";

export default async function KnowledgeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const query = params.q ?? "";
  const category = params.category ?? "ALL";
  const hasQuery = query.trim().length > 0 || category !== "ALL";
  const items = hasQuery ? await listKnowledgeItems(user, query, category) : [];
  const allItems = await listKnowledgeItems(user, "", "ALL");

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="知识条目总数" value={allItems.length} />
        <StatCard label="检索结果" value={hasQuery ? items.length : "—"} />
      </div>

      <AppPanel description="按主题搜索功能模块、案例素材与讲师技巧。">
        <form method="get" action="/knowledge/search" className="flex flex-wrap gap-2">
          <input name="q" defaultValue={query} placeholder="搜索标题或内容" className={`${inputCls} min-w-[200px] flex-1`} />
          <select name="category" defaultValue={category} className={inputCls}>
            <option value="ALL">全部分类</option>
            <option value="MODULE">功能模块</option>
            <option value="CASE">案例素材</option>
            <option value="TRAINER_TIP">讲师技巧</option>
          </select>
          <button type="submit" className={btnSecondary}>
            搜索
          </button>
          <Link href="/knowledge/search" className={btnSecondary}>
            重置
          </Link>
        </form>
      </AppPanel>

      {hasQuery ? (
        <AppPanel title="检索结果" description={items.length > 0 ? `共 ${items.length} 条匹配` : "未找到匹配条目，可尝试调整关键词或分类。"}>
          <KnowledgeItemList items={items} canReview={false} emptyText="无匹配条目。" />
        </AppPanel>
      ) : (
        <p className="text-[13px] text-[#8f959e]">输入关键词并选择分类后点击搜索，或在「知识条目列表」浏览全部条目。</p>
      )}
    </div>
  );
}
